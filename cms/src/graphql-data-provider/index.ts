import { DataProvider } from '@refinedev/core';
import dayjs from 'dayjs';
import { GraphQLClient } from 'graphql-request';
import { signOut } from 'next-auth/react';
import {
  capitalizeFirstLetter,
  handleOrFilter,
  isOrFilter,
  normalizeInputApostrophe,
  normalizeSearchName,
  resolveApostrophe,
} from './utils';
import { ClubRole, fieldTypes, MemberStatus } from './utils/graphQlTypes';
import {
  buildSearchableFilter,
  buildSearchableSort,
  WHISKEY_SEARCH_QUERY,
} from './utils/searchableWhiskey';
import { isPrivilegedOperation } from './utils/privilegedOperations';
import { privilegedRequest } from './utils/privilegedRequest';
import { uploadCSVFile, uploadPicture } from './utils/s3';
import { createLogger } from '../utils/logger';
import { textSorter } from '../utils/tableSorters';

// Create a logger instance for this module
const logger = createLogger('GraphQLProvider');

const keyEmptyPicture = {
  key: '',
  bucket: `${process.env.S3_BUCKET_NAME}`,
  region: `${process.env.S3_REGION}`,
};

type GraphQlResponse = { [queryName: string]: any };

const requestMutation = async (
  graphqlClient: GraphQLClient,
  mutation: string,
  mutationName: string,
  variables: Record<string, any>
): Promise<GraphQlResponse> => {
  if (isPrivilegedOperation(mutationName)) {
    return privilegedRequest<GraphQlResponse>(
      mutation,
      mutationName,
      variables
    );
  }

  return graphqlClient.request<GraphQlResponse>(mutation, variables);
};

const VENUE_BRAND_FIELD = 'brandId';

const takeVenueBrandId = (variables: any): string | null | undefined => {
  if (!variables || !(VENUE_BRAND_FIELD in variables)) {
    return undefined;
  }
  const brandId = variables[VENUE_BRAND_FIELD] || null;
  // eslint-disable-next-line no-param-reassign
  delete variables[VENUE_BRAND_FIELD];
  return brandId;
};

const writeVenueBrandId = async (
  graphqlClient: GraphQLClient,
  id: string,
  brandId: string | null
) => {
  const mutation = `
    mutation UpdateUser($input: UpdateUserInput!) {
      updateUser(input: $input) {
        id
        brandId
      }
    }`;

  const data = await graphqlClient.request<GraphQlResponse>(mutation, {
    input: { id, brandId },
  });

  return data.updateUser;
};

// --- Tasting Passport helpers ---------------------------------------------
// Handle an S3Object form field that may be (a) a fresh AntD Upload payload,
// (b) an S3Object already copied from a brand ("Sync now"), or (c) cleared.
const uploadS3Field = async (variables: any, field: string) => {
  const value = variables?.[field];
  if (value?.file && value?.file?.uid) {
    await uploadPicture({ key: value.file.uid, file: value.fileList[0] });
    // eslint-disable-next-line no-param-reassign
    variables[field] = {
      key: value.file.uid,
      bucket: `${process.env.S3_BUCKET_NAME}`,
      region: `${process.env.S3_REGION}`,
    };
  } else if (value && value.key) {
    // Already an S3Object (e.g. synced from a brand) — leave as-is.
  } else if (value === null) {
    // Explicitly cleared by the user.
    // eslint-disable-next-line no-param-reassign
    variables[field] = null;
  } else {
    // Untouched on an edit — omit so the existing value is preserved.
    // eslint-disable-next-line no-param-reassign
    delete variables[field];
  }
};

// An emptied AntD Select yields undefined, which JSON drops from the mutation
// input — so the old link would survive. Send an explicit null instead, but only
// when the form actually carried the field.
const clearedRefToNull = (variables: any, field: string) => {
  if (variables && field in variables && !variables[field]) {
    // eslint-disable-next-line no-param-reassign
    variables[field] = null;
  }
};

// Leaderboard identity for a pour: the linked catalogue bottle when present,
// otherwise a normalized brand+name slug so the same custom bottle typed at two
// booths aggregates into one leaderboard row. Stored on the pour and editable,
// so the CMS can force a merge/split.
const normalizeBottleName = (raw: string) =>
  raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const computeBottleKey = (variables: any): string =>
  variables?.whiskeyRefId ||
  normalizeBottleName(`${variables?.brand || ''} ${variables?.name || ''}`);
// --------------------------------------------------------------------------

const searchWhiskeyPage = async (
  graphqlClient: GraphQLClient,
  { filters, sorters, pagination }: any
) => {
  const current = pagination?.current || 1;
  const pageSize = pagination?.pageSize || 10;

  const data = await graphqlClient.request<GraphQlResponse>(
    WHISKEY_SEARCH_QUERY,
    {
      filter: buildSearchableFilter(filters),
      sort: buildSearchableSort(sorters),
      limit: pageSize,
      from: (current - 1) * pageSize,
    }
  );

  return {
    data: (data.searchWhiskeys?.items || []).filter(Boolean),
    total: data.searchWhiskeys?.total || 0,
  };
};

export const dataProvider = (
  graphqlClient: GraphQLClient
): Omit<
  Required<DataProvider>,
  'createMany' | 'updateMany' | 'deleteMany'
> => ({
  getList: async ({ resource, filters, sorters, pagination, meta }) => {
    if (
      resource === 'whiskey' &&
      meta?.searchable &&
      pagination?.mode !== 'off'
    ) {
      try {
        return await searchWhiskeyPage(graphqlClient, {
          filters,
          sorters,
          pagination,
        });
      } catch (error: any) {
        if (error.response?.status === 401) {
          signOut({
            redirect: true,
            callbackUrl: '/login',
          });
        }
        throw error;
      }
    }

    const getQueryName = () => {
      if (resource === 'article') {
        return 'listGuides';
      }
      if (resource === 'brand' || resource === 'venue') {
        return 'listUsers';
      }

      return `list${capitalizeFirstLetter(resource)}${
        resource.charAt(resource.length - 1) !== 's' ? 's' : ''
      }`;
    };

    const queryName = getQueryName();

    // Add default filter for deleted brands
    if (resource === 'brand') {
      // Only add default deleted filter if not explicitly filtering for deleted brands
      const hasDeletedFilter = filters?.find((f: any) => f.field === 'deleted');
      if (!hasDeletedFilter) {
        const deletedFilter = {
          field: 'deleted',
          operator: 'ne' as const,
          value: true,
        };
        filters = filters ? [...filters, deletedFilter] : [deletedFilter];
      }
    }

    // Separate regular filters from OR filters
    const regularFilters: string[] = [];
    let orFilter: string | null = null;

    const queryFilter = filters
      ? filters.forEach((item: any) => {
          // Handle OR filters specially
          if (isOrFilter(item)) {
            const result = handleOrFilter(item);
            // Only set orFilter if handleOrFilter returns a valid string (not null)
            if (result !== null) {
              orFilter = result;
            }
          } else {
            // Handle regular filters
            const filterString = `${item?.field}: { ${item?.operator}: ${
              item?.field === 'specialistChoice' ||
              item?.field === 'singleBarrel' ||
              item?.field === 'status' ||
              item?.field === 'starterPick' ||
              item?.field === 'isRedeemed' ||
              item?.field === 'specialistReview' ||
              item?.field === 'userType' ||
              item?.field === 'deleted' ||
              item?.field === 'isPrivate'
                ? item?.value
                : `"${resolveApostrophe(item?.value).replace(/&/g, 'ëéèê')}"`
            } }`;
            regularFilters.push(filterString);
          }
        })
      : null;

    // Combine regular filters and OR filter properly
    let queryFilterString = '';
    if (regularFilters.length > 0 && orFilter) {
      // Both regular filters and OR filter exist
      queryFilterString = `{${regularFilters.join(', ')}, ${orFilter}}`;
    } else if (regularFilters.length > 0) {
      // Only regular filters exist
      queryFilterString = `{${regularFilters.join(', ')}}`;
    } else if (orFilter) {
      // Only OR filter exists
      queryFilterString = `{${orFilter}}`;
    } else {
      // No filters
      queryFilterString = '{}';
    }

    const query = filters?.length
      ? `
      query List {
        ${queryName}(limit: 2000, filter:${queryFilterString || '{}'}){
          items {
            ${fieldTypes[resource]}
          }
          nextToken
        }
      }`
      : `query List {
      ${queryName}(limit: 2000){
        items {
          ${fieldTypes[resource]}
        }
        nextToken
      }
    }`;

    try {
      const data = await graphqlClient.request<GraphQlResponse>(query);

      while (data[queryName].nextToken) {
        const nextQuery = filters?.length
          ? `
      query List {
        ${queryName}(limit: 2000, nextToken: "${data[queryName].nextToken}", filter:${queryFilterString}){
          items {
            ${fieldTypes[resource]}
          }
          nextToken
        }
      }`
          : `
      query List {
        ${queryName}(limit: 2000, nextToken: "${data[queryName].nextToken}"){
          items {
            ${fieldTypes[resource]}
          }
          nextToken
        }
      }`;
        // eslint-disable-next-line no-await-in-loop
        const nextData = await graphqlClient.request<GraphQlResponse>(
          nextQuery
        );

        data[queryName].items = [
          ...data[queryName].items,
          ...nextData[queryName].items,
        ];
        data[queryName].nextToken = nextData[queryName].nextToken;
      }

      const items: any[] = sorters?.length
        ? [...data[queryName].items].sort((a: any, b: any) => {
            for (const sorter of sorters) {
              const result = textSorter<any>(sorter.field.split('.'))(a, b);
              if (result !== 0) {
                return sorter.order === 'desc' ? -result : result;
              }
            }
            return 0;
          })
        : data[queryName].items;

      return {
        data: items,
        total: items.length,
      };
    } catch (error: any) {
      if (error.response?.status === 401) {
        signOut({
          redirect: true,
          callbackUrl: '/login',
        });
      }
      throw error;
    }
  },

  getMany: async () =>
    ({
      data: [],
    } as any),

  create: async ({ resource, variables }) => {
    let formattedResourceName = capitalizeFirstLetter(resource);
    if (resource === 'article') {
      formattedResourceName = 'Guides';
    }

    const venueBrandId =
      resource === 'venue' ? takeVenueBrandId(variables) : undefined;

    // Handle club creation - upload images and create club with initial admin
    if (resource === 'club') {
      // Handle image uploads for club
      if (
        (variables as any)?.coverPhoto?.file &&
        (variables as any)?.coverPhoto?.file?.uid
      ) {
        await uploadPicture({
          key: (variables as any)?.coverPhoto?.file?.uid,
          file: (variables as any)?.coverPhoto?.fileList[0],
        });

        // eslint-disable-next-line no-param-reassign
        (variables as any).coverPhoto = (variables as any)?.coverPhoto?.file?.uid;
      } else {
        // eslint-disable-next-line no-param-reassign
        (variables as any).coverPhoto = null;
      }

      if (
        (variables as any)?.profilePicture?.file &&
        (variables as any)?.profilePicture?.file?.uid
      ) {
        await uploadPicture({
          key: (variables as any)?.profilePicture?.file?.uid,
          file: (variables as any)?.profilePicture?.fileList[0],
        });

        // eslint-disable-next-line no-param-reassign
        (variables as any).profilePicture = (variables as any)?.profilePicture?.file?.uid;
      } else {
        // eslint-disable-next-line no-param-reassign
        (variables as any).profilePicture = null;
      }

      // Store initialAdminId to create ClubMember after Club creation
      const initialAdminId = (variables as any).initialAdminId;

      // Remove initialAdminId from club creation input
      // eslint-disable-next-line no-param-reassign
      delete (variables as any).initialAdminId;

      const createClubMutation = `
        mutation CreateClub($input: CreateClubInput!) {
          createClub(input: $input) {
            id
            clubName
            searchName
            clubDetails
            coverPhoto
            profilePicture
            isPrivate
            createdBy
            createdAt
            updatedAt
            memberCount
            whiskeyCount
          }
        }`;

      try {
        const clubData = await graphqlClient.request<GraphQlResponse>(createClubMutation, {
          input: variables,
        });

        const club = clubData.createClub;

        // Create initial admin as ClubMember
        if (initialAdminId) {
          const createClubMemberMutation = `
            mutation CreateClubMember($input: CreateClubMemberInput!) {
              createClubMember(input: $input) {
                id
                clubId
                userId
                role
                status
                joinedAt
                requestedAt
              }
            }`;

          await graphqlClient.request(createClubMemberMutation, {
            input: {
              clubId: club.id,
              userId: initialAdminId,
              role: ClubRole.CLUBOWNERROLE,
              status: MemberStatus.ACTIVE,
              joinedAt: new Date().toISOString(),
              requestedAt: new Date().toISOString(),
            },
          });

          // Lambda function will automatically update memberCount via DynamoDB stream
        }

        return {
          data: { id: club.id, ...club },
        };
      } catch (error: any) {
        if (error.response?.status === 401) {
          signOut({
            redirect: true,
            callbackUrl: '/login',
          });
        }
        throw error;
      }
    }

    // Handle brand creation differently - use createUser mutation without ID
    if (resource === 'brand') {
      // Handle image uploads for brand
      if (
        (variables as any)?.brandLogo?.file &&
        (variables as any)?.brandLogo?.file?.uid
      ) {
        await uploadPicture({
          key: (variables as any)?.brandLogo?.file?.uid,
          file: (variables as any)?.brandLogo?.fileList[0],
        });

        // eslint-disable-next-line no-param-reassign
        (variables as any).brandLogo = {
          key: (variables as any)?.brandLogo?.file?.uid,
          bucket: `${process.env.S3_BUCKET_NAME}`,
          region: `${process.env.S3_REGION}`,
        };
      }

      if (
        (variables as any)?.coverPicture?.file &&
        (variables as any)?.coverPicture?.file?.uid
      ) {
        await uploadPicture({
          key: (variables as any)?.coverPicture?.file?.uid,
          file: (variables as any)?.coverPicture?.fileList[0],
        });

        // eslint-disable-next-line no-param-reassign
        (variables as any).coverPicture = {
          key: (variables as any)?.coverPicture?.file?.uid,
          bucket: `${process.env.S3_BUCKET_NAME}`,
          region: `${process.env.S3_REGION}`,
        };
      }

      const mutation = `
        mutation CreateBrandV2(
          $input: CreateBrandV2Input!
        ) {
          createBrandV2(input: $input) {
            id
            username
            brandName
            brandDescription
            brandLogo {
              bucket
              key
              region
            }
            coverPicture {
              bucket
              key
              region
            }
            brandWebsite
            brandCountry
            brandFoundedYear
            brandStory
            userType
            createdAt
            updatedAt
          }
        }`;

      try {
        logger.debug('Creating brand user', {
          extra: {
            username: (variables as any).username,
            brandName: (variables as any).brandName,
          },
        });

        const data = await requestMutation(
          graphqlClient,
          mutation,
          'createBrandV2',
          {
            input: {
              username: (variables as any).username,
              brandName: (variables as any).brandName,
              brandDescription: (variables as any).brandDescription,
              brandLogo: (variables as any).brandLogo || null,
              coverPicture: (variables as any).coverPicture || null,
              brandWebsite: (variables as any).brandWebsite,
              brandCountry: (variables as any).brandCountry,
              brandFoundedYear: (variables as any).brandFoundedYear,
              brandStory: (variables as any).brandStory,
              mobileEmail: (variables as any).mobileEmail || null,
              cmsEmail: (variables as any).cmsEmail || null,
            },
          }
        );

        logger.info('Brand user created successfully', {
          extra: {
            brandId: data.createBrandV2.id,
            brandName: data.createBrandV2.brandName,
          },
        });
        return {
          data: { id: data.createBrandV2.id, ...data.createBrandV2 },
        };
      } catch (error: any) {
        logger.error('Error creating brand user', error, {
          extra: {
            username: (variables as any).username,
            brandName: (variables as any).brandName,
            errorMessage: error.message,
          },
        });
        if (error.response?.status === 401) {
          signOut({
            redirect: true,
            callbackUrl: '/login',
          });
        }
        throw error;
      }
    }

    const mutationName = `create${formattedResourceName}`;
    const mutation = `
    mutation Create($input: Create${formattedResourceName}Input!) {
      ${mutationName}(input: $input) {
        id
      }
    }`;

    if (resource === 'whiskey') {
      // Get brand name from brandUser relationship using brandId
      let brandName = (variables as any).brand;
      if ((variables as any).brandId) {
        try {
          const brandQuery = `
            query GetUser($id: ID!) {
              getUser(id: $id) {
                id
                brandName
              }
            }
          `;
          const brandResult = await graphqlClient.request(brandQuery, {
            id: (variables as any).brandId,
          });
          brandName =
            (brandResult as any).getUser?.brandName || (variables as any).brand;
        } catch (error) {
          logger.warn('Failed to fetch brand name from brandUser', error instanceof Error ? error : new Error(String(error)), {
            extra: {
              brandId: (variables as any).brandId,
              fallbackBrand: (variables as any).brand,
            },
          });
          brandName = (variables as any).brand ?? ''; // fallback to direct brand field
        }
      }

      // eslint-disable-next-line no-param-reassign
      (variables as any).fullName = normalizeInputApostrophe(
        `${brandName} ${(variables as any).name}`
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks (accents, umlauts, etc.) - Unicode range U+0300-U+036F
          .replace(/&/g, 'ëéèê')
          .toLowerCase()
          .trim()
      );

      // Handle whiskey image uploads and deletions
      if ('picture' in (variables as any)) {
        if ((variables as any).picture === null) {
          // Image removal - set to null
          // eslint-disable-next-line no-param-reassign
          (variables as any).picture = null;
        } else if (
          (variables as any)?.picture?.file &&
          (variables as any)?.picture?.file?.uid
        ) {
          // New image upload
          await uploadPicture({
            key: (variables as any)?.picture?.file?.uid,
            file: (variables as any)?.picture?.fileList[0],
          });

          // eslint-disable-next-line no-param-reassign
          (variables as any).picture = {
            key: (variables as any)?.picture?.file?.uid,
            bucket: `${process.env.S3_BUCKET_NAME}`,
            region: `${process.env.S3_REGION}`,
          };
        }
      }

      if ('brandPicture' in (variables as any)) {
        if ((variables as any).brandPicture === null) {
          // Image removal - set to null
          // eslint-disable-next-line no-param-reassign
          (variables as any).brandPicture = null;
        } else if (
          (variables as any)?.brandPicture?.file &&
          (variables as any)?.brandPicture?.file?.uid
        ) {
          // New image upload
          await uploadPicture({
            key: (variables as any)?.brandPicture?.file?.uid,
            file: (variables as any)?.brandPicture?.fileList[0],
          });

          // eslint-disable-next-line no-param-reassign
          (variables as any).brandPicture = {
            key: (variables as any)?.brandPicture?.file?.uid,
            bucket: `${process.env.S3_BUCKET_NAME}`,
            region: `${process.env.S3_REGION}`,
          };
        }
      }
    }

    if (resource === 'adCampaign') {
      // eslint-disable-next-line no-param-reassign
      (variables as any).startDate = `${dayjs(
        (variables as any).startDate
      ).format('YYYY-MM-DDTHH:mm:ss.SSSZ')}`;

      // eslint-disable-next-line no-param-reassign
      (variables as any).endDate = `${dayjs((variables as any).endDate).format(
        'YYYY-MM-DDTHH:mm:ss.SSSZ'
      )}`;
    }

    if (
      (variables as any)?.picture?.file &&
      (variables as any)?.picture?.file?.uid
    ) {
      await uploadPicture({
        key: (variables as any)?.picture?.file?.uid,
        file: (variables as any)?.picture?.fileList[0],
      });

      // eslint-disable-next-line no-param-reassign
      (variables as any).picture = {
        key: (variables as any)?.picture?.file?.uid,
        bucket: `${process.env.S3_BUCKET_NAME}`,
        region: `${process.env.S3_REGION}`,
      };
    }

    if (
      (variables as any)?.brandPicture?.file &&
      (variables as any)?.brandPicture?.file?.uid
    ) {
      await uploadPicture({
        key: (variables as any)?.brandPicture?.file?.uid,
        file: (variables as any)?.brandPicture?.fileList[0],
      });

      // eslint-disable-next-line no-param-reassign
      (variables as any).brandPicture = {
        key: (variables as any)?.brandPicture?.file?.uid,
        bucket: `${process.env.S3_BUCKET_NAME}`,
        region: `${process.env.S3_REGION}`,
      };
    }

    if (resource === 'tastingEvent') {
      if ((variables as any)?.publishAt) {
        // eslint-disable-next-line no-param-reassign
        (variables as any).publishAt = dayjs(
          (variables as any).publishAt
        ).toISOString();
      }
      await uploadS3Field(variables, 'image');
      await uploadS3Field(variables, 'mapImage');
    }

    if (resource === 'tastingBooth') {
      await uploadS3Field(variables, 'logo');
    }

    if (resource === 'tastingPour') {
      // eslint-disable-next-line no-param-reassign
      (variables as any).bottleKey = computeBottleKey(variables);
    }

    if (resource === 'article') {
      // eslint-disable-next-line no-param-reassign
      (variables as any).tag = (variables as any).tag.toString().toLowerCase();

      // eslint-disable-next-line no-param-reassign
      (variables as any).title = normalizeInputApostrophe(
        (variables as any).title
      );
      if (
        (variables as any)?.coverPhoto?.file &&
        (variables as any)?.coverPhoto?.file?.uid
      ) {
        await uploadPicture({
          key: (variables as any)?.coverPhoto?.file?.uid,
          file: (variables as any)?.coverPhoto?.fileList[0],
        });

        // eslint-disable-next-line no-param-reassign
        (variables as any).coverPhoto = {
          key: (variables as any)?.coverPhoto?.file?.uid,
          bucket: `${process.env.S3_BUCKET_NAME}`,
          region: `${process.env.S3_REGION}`,
        };
      }

      if ((variables as any)?.coverPhoto?.file === null) {
        // eslint-disable-next-line no-param-reassign
        (variables as any).coverPhoto = keyEmptyPicture;
      }

      if ((variables as any)?.photos) {
        if (
          (variables as any)?.photos[0]?.file &&
          (variables as any)?.photos[0]?.file?.uid
        ) {
          await uploadPicture({
            key: (variables as any)?.photos[0]?.file?.uid,
            file: (variables as any)?.photos[0]?.fileList[0],
          });

          // eslint-disable-next-line no-param-reassign
          (variables as any).photos[0] = {
            key: (variables as any)?.photos[0]?.file?.uid,
            bucket: `${process.env.S3_BUCKET_NAME}`,
            region: `${process.env.S3_REGION}`,
          };
        }

        if ((variables as any)?.photos[0]?.file === null) {
          // eslint-disable-next-line no-param-reassign
          (variables as any).photos[0] = keyEmptyPicture;
        }

        if (
          (variables as any)?.photos[1]?.file &&
          (variables as any)?.photos[1]?.file?.uid
        ) {
          await uploadPicture({
            key: (variables as any)?.photos[1]?.file?.uid,
            file: (variables as any)?.photos[1]?.fileList[0],
          });

          // eslint-disable-next-line no-param-reassign
          (variables as any).photos[1] = {
            key: (variables as any)?.photos[1]?.file?.uid,
            bucket: `${process.env.S3_BUCKET_NAME}`,
            region: `${process.env.S3_REGION}`,
          };
        }
        if ((variables as any)?.photos[1]?.file === null) {
          // eslint-disable-next-line no-param-reassign
          (variables as any).photos[1] = keyEmptyPicture;
        }

        if (
          (variables as any)?.photos[2]?.file &&
          (variables as any)?.photos[2]?.file?.uid
        ) {
          await uploadPicture({
            key: (variables as any)?.photos[2]?.file?.uid,
            file: (variables as any)?.photos[2]?.fileList[0],
          });

          // eslint-disable-next-line no-param-reassign
          (variables as any).photos[2] = {
            key: (variables as any)?.photos[2]?.file?.uid,
            bucket: `${process.env.S3_BUCKET_NAME}`,
            region: `${process.env.S3_REGION}`,
          };
        }
        if ((variables as any)?.photos[2]?.file === null) {
          // eslint-disable-next-line no-param-reassign
          (variables as any).photos[2] = keyEmptyPicture;
        }
      }
    }

    if (resource === 'review') {
      // eslint-disable-next-line no-param-reassign

      if (
        (variables as any)?.specialistImage?.file &&
        (variables as any)?.specialistImage?.file?.uid
      ) {
        await uploadPicture({
          key: (variables as any)?.specialistImage?.file?.uid,
          file: (variables as any)?.specialistImage?.fileList[0],
        });

        // eslint-disable-next-line no-param-reassign
        (variables as any).specialistImage = {
          key: (variables as any)?.specialistImage?.file?.uid,
          bucket: `${process.env.S3_BUCKET_NAME}`,
          region: `${process.env.S3_REGION}`,
        };
      }

      if ((variables as any)?.specialistImage?.file === null) {
        // eslint-disable-next-line no-param-reassign
        (variables as any).specialistImage = keyEmptyPicture;
      }
    }

    if (resource === 'venue') {
      // eslint-disable-next-line no-param-reassign
      (variables as any).venueName = normalizeInputApostrophe(
        capitalizeFirstLetter(`${(variables as any).venueName}`.trim())
      );

      // eslint-disable-next-line no-param-reassign
      (variables as any).venuePhone = (variables as any).venueName
        ? `${(variables as any).venuePhone}`.trim()
        : '';

      if (
        (variables as any)?.profilePicture?.file &&
        (variables as any)?.profilePicture?.file?.uid
      ) {
        await uploadPicture({
          key: (variables as any)?.profilePicture?.file?.uid,
          file: (variables as any)?.profilePicture?.fileList[0],
        });

        // eslint-disable-next-line no-param-reassign
        (variables as any).profilePicture = {
          key: (variables as any)?.profilePicture?.file?.uid,
          bucket: `${process.env.S3_BUCKET_NAME}`,
          region: `${process.env.S3_REGION}`,
        };
      }
      if (
        (variables as any)?.coverPicture?.file &&
        (variables as any)?.coverPicture?.file?.uid
      ) {
        await uploadPicture({
          key: (variables as any)?.coverPicture?.file?.uid,
          file: (variables as any)?.coverPicture?.fileList[0],
        });

        // eslint-disable-next-line no-param-reassign
        (variables as any).coverPicture = {
          key: (variables as any)?.coverPicture?.file?.uid,
          bucket: `${process.env.S3_BUCKET_NAME}`,
          region: `${process.env.S3_REGION}`,
        };
      }
    }
    try {
      if (process.env.DEBUG === 'true') {
        logger.debug('GraphQL create request', {
          extra: {
            resource,
            mutationName,
            variables: JSON.stringify(variables, null, 2),
            headers: graphqlClient.requestConfig?.headers,
          },
        });
      }

      const data = await requestMutation(graphqlClient, mutation, mutationName, {
        input: variables,
      });

      if (process.env.DEBUG === 'true') {
        logger.debug('GraphQL create response', {
          extra: {
            resource,
            mutationName,
            response: JSON.stringify(data, null, 2),
          },
        });
      }

      const created = data[mutationName];

      if (venueBrandId && created?.id) {
        try {
          await writeVenueBrandId(graphqlClient, created.id, venueBrandId);
          created.brandId = venueBrandId;
        } catch (brandError) {
          logger.error(
            'Venue was created but its parent brand could not be set',
            brandError instanceof Error
              ? brandError
              : new Error(String(brandError)),
            {
              extra: { venueId: created.id, brandId: venueBrandId },
            }
          );
        }
      }

      return {
        data: created,
      };
    } catch (error: any) {
      if (error.response?.status === 401) {
        signOut({
          redirect: true,
          callbackUrl: '/login',
        });
      }
      throw error;
    }
  },

  update: async ({ resource, id, variables }) => {
    let formattedResourceName = capitalizeFirstLetter(resource);
    if (resource === 'article') {
      formattedResourceName = 'Guides';
    }
    if (resource === 'brand') {
      formattedResourceName = 'User';
    }

    const venueBrandId =
      resource === 'venue' ? takeVenueBrandId(variables) : undefined;

    const mutationName = `update${formattedResourceName}`;

    const mutation = `
    mutation Update($input: Update${formattedResourceName}Input!) {
      ${mutationName}(input: $input) {
        ${fieldTypes[resource]}
      }
    }`;

    if (resource === 'whiskey') {
      // Get brand name from brandUser relationship using brandId
      let brandName = (variables as any).brand;
      if ((variables as any).brandId) {
        try {
          const brandQuery = `
            query GetUser($id: ID!) {
              getUser(id: $id) {
                id
                brandName
              }
            }
          `;
          const brandResult = await graphqlClient.request(brandQuery, {
            id: (variables as any).brandId,
          });
          brandName =
            (brandResult as any).getUser?.brandName || (variables as any).brand;
        } catch (error) {
          logger.warn('Failed to fetch brand name from brandUser', error instanceof Error ? error : new Error(String(error)), {
            extra: {
              brandId: (variables as any).brandId,
              fallbackBrand: (variables as any).brand,
            },
          });
          brandName = (variables as any).brand ?? ''; // fallback to direct brand field
        }
      }

      // eslint-disable-next-line no-param-reassign
      (variables as any).fullName = normalizeInputApostrophe(
        `${brandName} ${(variables as any).name}`
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks (accents, umlauts, etc.) - Unicode range U+0300-U+036F
          .replace(/&/g, 'ëéèê')
          .toLowerCase()
          .trim()
      );
      if (
        (variables as any)?.picture?.file &&
        (variables as any)?.picture?.file?.uid
      ) {
        await uploadPicture({
          key: (variables as any)?.picture?.file?.uid,
          file: (variables as any)?.picture?.fileList[0],
        });

        // eslint-disable-next-line no-param-reassign
        (variables as any).picture = {
          key: (variables as any)?.picture?.file?.uid,
          bucket: `${process.env.S3_BUCKET_NAME}`,
          region: `${process.env.S3_REGION}`,
        };
      }
      if (
        (variables as any)?.brandPicture?.file &&
        (variables as any)?.brandPicture?.file?.uid
      ) {
        await uploadPicture({
          key: (variables as any)?.brandPicture?.file?.uid,
          file: (variables as any)?.brandPicture?.fileList[0],
        });

        // eslint-disable-next-line no-param-reassign
        (variables as any).brandPicture = {
          key: (variables as any)?.brandPicture?.file?.uid,
          bucket: `${process.env.S3_BUCKET_NAME}`,
          region: `${process.env.S3_REGION}`,
        };
      }
    }

    if (resource === 'article') {
      // eslint-disable-next-line no-param-reassign
      (variables as any).tag = (variables as any).tag.toString().toLowerCase();
      // eslint-disable-next-line no-param-reassign
      (variables as any).title = normalizeInputApostrophe(
        (variables as any).title
      );
      if (
        (variables as any)?.coverPhoto?.file &&
        (variables as any)?.coverPhoto?.file?.uid
      ) {
        await uploadPicture({
          key: (variables as any)?.coverPhoto?.file?.uid,
          file: (variables as any)?.coverPhoto?.fileList[0],
        });

        // eslint-disable-next-line no-param-reassign
        (variables as any).coverPhoto = {
          key: (variables as any)?.coverPhoto?.file?.uid,
          bucket: `${process.env.S3_BUCKET_NAME}`,
          region: `${process.env.S3_REGION}`,
        };
      }
      if ((variables as any)?.coverPhoto.file === null) {
        // eslint-disable-next-line no-param-reassign
        (variables as any).coverPhoto = keyEmptyPicture;
      }

      if ((variables as any)?.photos) {
        if (
          (variables as any)?.photos[0]?.file &&
          (variables as any)?.photos[0]?.file?.uid
        ) {
          await uploadPicture({
            key: (variables as any)?.photos[0]?.file?.uid,
            file: (variables as any)?.photos[0]?.fileList[0],
          });

          // eslint-disable-next-line no-param-reassign
          (variables as any).photos[0] = {
            key: (variables as any)?.photos[0]?.file?.uid,
            bucket: `${process.env.S3_BUCKET_NAME}`,
            region: `${process.env.S3_REGION}`,
          };
        }
        if ((variables as any)?.photos[0].file === null) {
          // eslint-disable-next-line no-param-reassign
          (variables as any).photos[0] = keyEmptyPicture;
        }

        if (
          (variables as any)?.photos[1]?.file &&
          (variables as any)?.photos[1]?.file?.uid
        ) {
          await uploadPicture({
            key: (variables as any)?.photos[1]?.file?.uid,
            file: (variables as any)?.photos[1]?.fileList[0],
          });

          // eslint-disable-next-line no-param-reassign
          (variables as any).photos[1] = {
            key: (variables as any)?.photos[1]?.file?.uid,
            bucket: `${process.env.S3_BUCKET_NAME}`,
            region: `${process.env.S3_REGION}`,
          };
        }
        if ((variables as any)?.photos[1].file === null) {
          // eslint-disable-next-line no-param-reassign
          (variables as any).photos[1] = keyEmptyPicture;
        }

        if (
          (variables as any)?.photos[2]?.file &&
          (variables as any)?.photos[2]?.file?.uid
        ) {
          await uploadPicture({
            key: (variables as any)?.photos[2]?.file?.uid,
            file: (variables as any)?.photos[2]?.fileList[0],
          });

          // eslint-disable-next-line no-param-reassign
          (variables as any).photos[2] = {
            key: (variables as any)?.photos[2]?.file?.uid,
            bucket: `${process.env.S3_BUCKET_NAME}`,
            region: `${process.env.S3_REGION}`,
          };
        }
        if ((variables as any)?.photos[2].file === null) {
          // eslint-disable-next-line no-param-reassign
          (variables as any).photos[2] = keyEmptyPicture;
        }
      }
    }

    if (resource === 'adCampaign') {
      // eslint-disable-next-line no-param-reassign
      (variables as any).startDate = `${dayjs(
        (variables as any).startDate
      ).format('YYYY-MM-DDTHH:mm:ss.SSSZ')}`;

      if (
        (variables as any)?.picture?.file &&
        (variables as any)?.picture?.file?.uid
      ) {
        await uploadPicture({
          key: (variables as any)?.picture?.file?.uid,
          file: (variables as any)?.picture?.fileList[0],
        });

        // eslint-disable-next-line no-param-reassign
        (variables as any).picture = {
          key: (variables as any)?.picture?.file?.uid,
          bucket: `${process.env.S3_BUCKET_NAME}`,
          region: `${process.env.S3_REGION}`,
        };
      }

      // eslint-disable-next-line no-param-reassign
      (variables as any).endDate = `${dayjs((variables as any).endDate).format(
        'YYYY-MM-DDTHH:mm:ss.SSSZ'
      )}`;
    }

    if (resource === 'adCampaign') {
      // eslint-disable-next-line no-param-reassign
      (variables as any).startDate = `${dayjs(
        (variables as any).startDate
      ).format('YYYY-MM-DDTHH:mm:ss.SSSZ')}`;

      // eslint-disable-next-line no-param-reassign
      (variables as any).endDate = `${dayjs((variables as any).endDate).format(
        'YYYY-MM-DDTHH:mm:ss.SSSZ'
      )}`;
    }

    if (resource === 'featureFlags') {
      // eslint-disable-next-line no-param-reassign
      (variables as any).value = (variables as any).value ? 'true' : 'false';
    }

    if (resource === 'tastingEvent') {
      if ((variables as any)?.publishAt) {
        // eslint-disable-next-line no-param-reassign
        (variables as any).publishAt = dayjs(
          (variables as any).publishAt
        ).toISOString();
      }
      await uploadS3Field(variables, 'image');
      await uploadS3Field(variables, 'mapImage');
    }

    if (resource === 'tastingBooth') {
      await uploadS3Field(variables, 'logo');
      clearedRefToNull(variables, 'brandRefId');
    }

    if (resource === 'tastingPour') {
      await uploadS3Field(variables, 'picture');
      clearedRefToNull(variables, 'whiskeyRefId');
      // Recompute identity when the bottle link or its name/brand changed.
      // eslint-disable-next-line no-param-reassign
      (variables as any).bottleKey = computeBottleKey(variables);
    }

    if (resource === 'review') {
      // eslint-disable-next-line no-param-reassign

      if (
        (variables as any)?.specialistImage?.file &&
        (variables as any)?.specialistImage?.file?.uid
      ) {
        await uploadPicture({
          key: (variables as any)?.specialistImage?.file?.uid,
          file: (variables as any)?.specialistImage?.fileList[0],
        });

        // eslint-disable-next-line no-param-reassign
        (variables as any).specialistImage = {
          key: (variables as any)?.specialistImage?.file?.uid,
          bucket: `${process.env.S3_BUCKET_NAME}`,
          region: `${process.env.S3_REGION}`,
        };
      }

      if ((variables as any)?.specialistImage?.file === null) {
        // eslint-disable-next-line no-param-reassign
        (variables as any).specialistImage = keyEmptyPicture;
      }
    }

    if (resource === 'club') {
      // Regenerate searchName when clubName changes
      if ((variables as any)?.clubName) {
        // eslint-disable-next-line no-param-reassign
        (variables as any).searchName = normalizeSearchName(
          (variables as any).clubName
        );
      }

      // Handle club image uploads and deletions
      if ('coverPhoto' in (variables as any)) {
        if ((variables as any).coverPhoto === null) {
          // Image removal - set to null
          // eslint-disable-next-line no-param-reassign
          (variables as any).coverPhoto = null;
        } else if (
          (variables as any)?.coverPhoto?.file &&
          (variables as any)?.coverPhoto?.file?.uid
        ) {
          // New image upload
          await uploadPicture({
            key: (variables as any)?.coverPhoto?.file?.uid,
            file: (variables as any)?.coverPhoto?.fileList[0],
          });

          // eslint-disable-next-line no-param-reassign
          (variables as any).coverPhoto = (variables as any)?.coverPhoto?.file?.uid;
        }
      }

      if ('profilePicture' in (variables as any)) {
        if ((variables as any).profilePicture === null) {
          // Image removal - set to null
          // eslint-disable-next-line no-param-reassign
          (variables as any).profilePicture = null;
        } else if (
          (variables as any)?.profilePicture?.file &&
          (variables as any)?.profilePicture?.file?.uid
        ) {
          // New image upload
          await uploadPicture({
            key: (variables as any)?.profilePicture?.file?.uid,
            file: (variables as any)?.profilePicture?.fileList[0],
          });

          // eslint-disable-next-line no-param-reassign
          (variables as any).profilePicture = (variables as any)?.profilePicture?.file?.uid;
        }
      }
    }

    if (resource === 'brand') {
      // Regenerate brandSearchName when brandName changes
      if ((variables as any)?.brandName) {
        // eslint-disable-next-line no-param-reassign
        (variables as any).brandSearchName = normalizeSearchName(
          (variables as any).brandName
        );
      }

      // Handle brand image uploads and deletions
      if ('brandLogo' in (variables as any)) {
        if ((variables as any).brandLogo === null) {
          // Image removal - set to null
          // eslint-disable-next-line no-param-reassign
          (variables as any).brandLogo = null;
        } else if (
          (variables as any)?.brandLogo?.file &&
          (variables as any)?.brandLogo?.file?.uid
        ) {
          // New image upload
          await uploadPicture({
            key: (variables as any)?.brandLogo?.file?.uid,
            file: (variables as any)?.brandLogo?.fileList[0],
          });

          // eslint-disable-next-line no-param-reassign
          (variables as any).brandLogo = {
            key: (variables as any)?.brandLogo?.file?.uid,
            bucket: `${process.env.S3_BUCKET_NAME}`,
            region: `${process.env.S3_REGION}`,
          };
        }
      }

      if ('coverPicture' in (variables as any)) {
        if ((variables as any).coverPicture === null) {
          // Image removal - set to null
          // eslint-disable-next-line no-param-reassign
          (variables as any).coverPicture = null;
        } else if (
          (variables as any)?.coverPicture?.file &&
          (variables as any)?.coverPicture?.file?.uid
        ) {
          // New image upload
          await uploadPicture({
            key: (variables as any)?.coverPicture?.file?.uid,
            file: (variables as any)?.coverPicture?.fileList[0],
          });

          // eslint-disable-next-line no-param-reassign
          (variables as any).coverPicture = {
            key: (variables as any)?.coverPicture?.file?.uid,
            bucket: `${process.env.S3_BUCKET_NAME}`,
            region: `${process.env.S3_REGION}`,
          };
        }
      }
    }

    if (resource === 'venue') {
      // eslint-disable-next-line no-param-reassign
      (variables as any).venueName = normalizeInputApostrophe(
        capitalizeFirstLetter(`${(variables as any).venueName}`.trim())
      );

      // eslint-disable-next-line no-param-reassign
      (variables as any).venuePhone = (variables as any).venueName
        ? `${(variables as any).venuePhone}`.trim()
        : '';

      if (
        (variables as any)?.profilePicture?.file &&
        (variables as any)?.profilePicture?.file?.uid
      ) {
        await uploadPicture({
          key: (variables as any)?.profilePicture?.file?.uid,
          file: (variables as any)?.profilePicture?.fileList[0],
        });

        // eslint-disable-next-line no-param-reassign
        (variables as any).profilePicture = {
          key: (variables as any)?.profilePicture?.file?.uid,
          bucket: `${process.env.S3_BUCKET_NAME}`,
          region: `${process.env.S3_REGION}`,
        };
      }
      if (
        (variables as any)?.coverPicture?.file &&
        (variables as any)?.coverPicture?.file?.uid
      ) {
        await uploadPicture({
          key: (variables as any)?.coverPicture?.file?.uid,
          file: (variables as any)?.coverPicture?.fileList[0],
        });

        // eslint-disable-next-line no-param-reassign
        (variables as any).coverPicture = {
          key: (variables as any)?.coverPicture?.file?.uid,
          bucket: `${process.env.S3_BUCKET_NAME}`,
          region: `${process.env.S3_REGION}`,
        };
      }
    }
    try {
      const data = await requestMutation(graphqlClient, mutation, mutationName, {
        input: { id, ...variables },
      });

      const updated = data[mutationName];

      if (
        venueBrandId !== undefined &&
        (!updated || (updated.brandId ?? null) !== venueBrandId)
      ) {
        await writeVenueBrandId(graphqlClient, `${id}`, venueBrandId);
        if (updated) {
          updated.brandId = venueBrandId;
        }
      }

      return {
        data: updated,
      };
    } catch (error: any) {
      if (error.response?.status === 401) {
        signOut({
          redirect: true,
          callbackUrl: '/login',
        });
      }

      // Handle case where mutation succeeded but nested relationships failed to resolve
      // This happens when AppSync can't properly fetch @belongsTo relationships after update
      // (e.g., whiskey.brandUser, review.user, review.whiskey, etc.)
      if (
        error.response?.data?.[mutationName] &&
        error.response?.errors?.length > 0
      ) {
        const hasNullableFieldError = error.response.errors.some(
          (err: any) =>
            err.message?.includes('Cannot return null for non-nullable')
        );

        if (hasNullableFieldError) {
          logger.warn(`${mutationName} succeeded but some nested relationships failed to resolve`, {
            extra: {
              mutationName,
              errors: error.response.errors,
              partialData: error.response.data[mutationName],
            },
          });
          // Return the partial data since the mutation actually succeeded
          return {
            data: error.response.data[mutationName],
          };
        }
      }

      throw error;
    }
  },

  getOne: async ({ resource, id }) => {
    let queryName = `get${capitalizeFirstLetter(resource)}`;
    if (resource === 'article') {
      queryName = `getGuides`;
    }

    if (resource === 'brand' || resource === 'venue') {
      queryName = `getUser`;
    }

    const query = `
    query Get($id: ID!) {
      ${queryName}(id: $id) {
        ${fieldTypes[resource]}
      }
    }`;

    try {
      const data = await graphqlClient.request<GraphQlResponse>(query, { id });

      if (resource === 'review') {
        if (data[queryName]) {
          data[queryName].whiskey.fullName = data[
            queryName
          ].whiskey.fullName.replace(/ëéèê/g, '&');
        }
      }

      if (resource === 'venue') {
        if (data[queryName]) {
          data[queryName].venuePhone =
            data[queryName].venuePhone.split(' ')[1] || '';
        }
      }

      return {
        data: data[queryName],
      };
    } catch (error: any) {
      if (error.response?.status === 401) {
        signOut({
          redirect: true,
          callbackUrl: '/login',
        });
      }
      throw error;
    }
  },

  deleteOne: async ({ resource, id }) => {
    let formattedResourceName = capitalizeFirstLetter(resource);
    if (resource === 'article') {
      formattedResourceName = 'Guides';
    }
    const mutationName = `delete${formattedResourceName}`;
    const mutation = `
    mutation Delete($input: Delete${formattedResourceName}Input!) {
      ${mutationName}(input: $input) {
        ${fieldTypes[resource]}
      }
    }`;
    try {
      const data = await requestMutation(graphqlClient, mutation, mutationName, {
        input: { id },
      });

      return {
        data: data[mutationName],
      };
    } catch (error: any) {
      if (error.response?.status === 401) {
        signOut({
          redirect: true,
          callbackUrl: '/login',
        });
      }
      throw error;
    }
  },

  getApiUrl: () => '',

  custom: async ({ meta }) => {
    const variables = meta?.variables as any;

    if (meta?.file && meta?.file?.uid) {
      await uploadCSVFile({
        key: meta?.file?.uid,
        file: meta?.file,
      });
    }

    try {
      const data = await requestMutation(
        graphqlClient,
        meta?.query,
        meta?.queryName,
        { ...variables }
      );

      return {
        data: data[meta?.queryName],
      };
    } catch (error: any) {
      logger.error('GraphQL custom request error', error, {
        extra: {
          queryName: meta?.queryName,
          status: error.response?.status,
          response: error.response,
          errorMessage: error.message,
        },
      });

      if (error.response?.status === 401) {
        signOut({
          redirect: true,
          callbackUrl: '/login',
        });
      }
      throw error;
    }
  },
});
