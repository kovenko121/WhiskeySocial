import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { getServerSession } from 'next-auth';

import { EditButton, Show, ShowButton, BooleanField } from '@refinedev/antd';
import {
  useCustom,
  useCustomMutation,
  useList,
  useShow,
  useTranslate,
  useGo,
} from '@refinedev/core';
import {
  Image,
  Typography,
  Descriptions,
  Card,
  Table,
  Tag,
  Space,
  Button,
  Tooltip,
  Divider,
  Modal,
  Select,
  Form,
  Input,
  message,
} from 'antd';
import {
  UserAddOutlined,
  ReloadOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  UserDeleteOutlined,
  PlusOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import { TrueIcon } from '@components/true-icon';
import { FalseIcon } from '@components/false-icon';
import { EmailField } from '../../../src/components/form-fields/EmailField';
import { useContext, useEffect, useState, useMemo } from 'react';
import { PermissionContext } from '@contexts';
import { useSession } from 'next-auth/react';
import { getObject } from '../../../src/graphql-data-provider/utils/s3';
import { authOptions } from '../../api/auth/[...nextauth]';
import { SoftDeleteButton } from '../components/SoftDeleteButton';
import { handleServerSideProps } from 'src/utils/serverSideProps';
import { useCognitoUserEmail } from '../../../src/hooks/useCognitoUserEmail';
import { CMSUserRole } from '../../../src/graphql-data-provider/utils/graphQlTypes';

const { Title, Text } = Typography;

const BrandShow = () => {
  const { role, brandUserIds } = useContext(PermissionContext);
  const { data: session } = useSession();
  const { queryResult } = useShow({
    resource: 'brand',
    // The brand resource points to User table with userType = BRAND
    // This is handled by the data provider
    meta: {
      // Force fresh data fetch when navigating to this page
      refetchOnWindowFocus: true,
    },
  });
  const { data, isLoading, refetch } = queryResult;
  const [brandLogo, setBrandLogo] = useState<string | undefined>();
  const [coverPicture, setCoverPicture] = useState<string | undefined>();
  const [isAddOwnerModalVisible, setIsAddOwnerModalVisible] = useState(false);
  const [selectedCMSUserId, setSelectedCMSUserId] = useState<
    string | undefined
  >();
  const [isRemoveWhiskeyModalVisible, setIsRemoveWhiskeyModalVisible] =
    useState(false);
  const [selectedWhiskey, setSelectedWhiskey] = useState<any>(null);
  const [isRemoveVenueModalVisible, setIsRemoveVenueModalVisible] =
    useState(false);
  const [selectedVenue, setSelectedVenue] = useState<any>(null);
  const [isRemoveBrandOwnerModalVisible, setIsRemoveBrandOwnerModalVisible] =
    useState(false);
  const [selectedBrandOwner, setSelectedBrandOwner] = useState<any>(null);
  const [
    isAddBrandOwnerByEmailModalVisible,
    setIsAddBrandOwnerByEmailModalVisible,
  ] = useState(false);
  const [newOwnerEmail, setNewOwnerEmail] = useState<string>('');
  const [isAddingBrandOwner, setIsAddingBrandOwner] = useState(false);
  const [form] = Form.useForm();
  const [emailForm] = Form.useForm();

  // Transfer Brand Modal State
  const [isTransferModalVisible, setIsTransferModalVisible] = useState(false);
  const [transferEmail, setTransferEmail] = useState<string>('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferForm] = Form.useForm();

  const { mutate } = useCustomMutation();
  const go = useGo();

  const record = data?.data;

  // Fetch current owner's email from Cognito
  const {
    email: currentOwnerEmail,
    loading: ownerEmailLoading,
    error: ownerEmailError,
  } = useCognitoUserEmail(record?.owner);

  // Fetch whiskeys belonging to this brand
  const {
    data: whiskeysData,
    isLoading: whiskeysLoading,
    refetch: refetchWhiskeys,
  } = useList({
    resource: 'whiskey',
    filters: [
      {
        field: 'brandId',
        operator: 'eq',
        value: record?.id,
      },
    ],
    pagination: {
      mode: 'off',
    },
    queryOptions: {
      enabled: !!record?.id,
    },
  });

  // Fetch venues belonging to this brand
  const brandVenuesQuery = `
    query GetBrandVenues($id: ID!) {
      getUser(id: $id) {
        id
        brandVenues(limit: 500) {
          items {
            id
            venueName
            venueAddressCity
            venueAddressState
            venueAddressStreet
          }
        }
      }
    }
  `;

  const {
    data: brandVenuesData,
    isLoading: venuesLoading,
    refetch: refetchVenues,
  } = useCustom({
    url: '',
    method: 'get',
    meta: {
      query: brandVenuesQuery,
      queryName: 'getUser',
      variables: {
        id: record?.id,
      },
    },
    queryOptions: {
      enabled: !!record?.id,
    },
  });

  const brandVenues = useMemo(() => {
    const items = (brandVenuesData?.data as any)?.brandVenues?.items;
    return items?.filter(Boolean) || [];
  }, [brandVenuesData]);

  // Fetch brand owners (CMSUserBrand relationships)
  const {
    data: brandOwnersData,
    isLoading: brandOwnersLoading,
    refetch: refetchBrandOwners,
  } = useList({
    resource: 'CMSUserBrand',
    filters: [
      {
        field: 'brandUserId',
        operator: 'eq',
        value: record?.id,
      },
    ],
    queryOptions: {
      enabled: !!record?.id,
    },
  });

  // Fetch all CMSUsers for the Add Owner modal
  const { data: allCMSUsersData, isLoading: cmsUsersLoading } = useList({
    resource: 'CMSUser',
    pagination: {
      mode: 'off',
    },
    queryOptions: {
      enabled: isAddOwnerModalVisible,
    },
  });

  // Filter out already assigned CMSUsers
  const availableCMSUsers = useMemo(() => {
    if (!allCMSUsersData?.data || !brandOwnersData?.data) return [];

    const assignedUserIds = brandOwnersData.data.map(
      (owner: any) => owner.cmsUserId
    );
    return allCMSUsersData.data.filter(
      (user: any) => !assignedUserIds.includes(user.id) && user.isActive
    );
  }, [allCMSUsersData?.data, brandOwnersData?.data]);

  // Check if user can edit this brand
  const canEdit = () => {
    if (role === CMSUserRole.Admin) return true;
    if (brandUserIds && record?.id) {
      return brandUserIds.includes(String(record?.id));
    }
    return false;
  };

  const getBrandLogo = async (key: string) => {
    const result = await getObject(key);
    setBrandLogo(result);
  };

  const getCoverPicture = async (key: string) => {
    const result = await getObject(key);
    setCoverPicture(result);
  };

  const handleAddOwner = async () => {
    if (!selectedCMSUserId || !record?.id) return;

    const createCMSUserBrandMutation = `
      mutation CreateCMSUserBrand($input: CreateCMSUserBrandInput!) {
        createCMSUserBrand(input: $input) {
          id
          cmsUserId
          brandUserId
          assignedAt
          assignedBy
        }
      }
    `;

    mutate(
      {
        url: '',
        method: 'post',
        meta: {
          query: createCMSUserBrandMutation,
          queryName: 'createCMSUserBrand',
          variables: {
            input: {
              cmsUserId: selectedCMSUserId,
              brandUserId: record.id,
              assignedAt: new Date().toISOString(),
              assignedBy: session?.user?.email || 'System',
            },
          },
        },
        values: {},
        errorNotification: () => ({
          message: 'Failed to add brand owner',
          description: 'Error',
          type: 'error',
        }),
        successNotification: () => ({
          message: 'Brand owner added successfully',
          description: 'Success',
          type: 'success',
        }),
      },
      {
        onSuccess: () => {
          setIsAddOwnerModalVisible(false);
          setSelectedCMSUserId(undefined);
          form.resetFields();
          refetchBrandOwners();
        },
        onError: (error: any) => {
          console.error('Error adding brand owner:', error);
        },
      }
    );
  };

  const handleRemoveWhiskeyFromBrand = async () => {
    if (!selectedWhiskey?.id) return;

    const updateWhiskeyMutation = `
      mutation UpdateWhiskey($input: UpdateWhiskeyInput!) {
        updateWhiskey(input: $input) {
          id
          name
          brandId
        }
      }
    `;

    mutate(
      {
        url: '',
        method: 'post',
        meta: {
          query: updateWhiskeyMutation,
          queryName: 'updateWhiskey',
          variables: {
            input: {
              id: selectedWhiskey.id,
              brandId: null, // Remove the brand from the whiskey
            },
          },
        },
        values: {},
        errorNotification: () => ({
          message: 'Failed to remove whiskey from brand',
          description: 'Error',
          type: 'error',
        }),
        successNotification: () => ({
          message: `${selectedWhiskey.name} has been removed from this brand`,
          description: 'Success',
          type: 'success',
        }),
      },
      {
        onSuccess: () => {
          setIsRemoveWhiskeyModalVisible(false);
          setSelectedWhiskey(null);
          refetchWhiskeys();
        },
        onError: (error: any) => {
          console.error('Error removing whiskey from brand:', error);
        },
      }
    );
  };

  const showRemoveWhiskeyModal = (whiskey: any) => {
    setSelectedWhiskey(whiskey);
    setIsRemoveWhiskeyModalVisible(true);
  };

  const handleRemoveVenueFromBrand = async () => {
    if (!selectedVenue?.id) return;

    const updateUserMutation = `
      mutation UpdateUser($input: UpdateUserInput!) {
        updateUser(input: $input) {
          id
          venueName
          brandId
        }
      }
    `;

    mutate(
      {
        url: '',
        method: 'post',
        meta: {
          query: updateUserMutation,
          queryName: 'updateUser',
          variables: {
            input: {
              id: selectedVenue.id,
              brandId: null,
            },
          },
        },
        values: {},
        errorNotification: () => ({
          message: 'Failed to remove venue from brand',
          description: 'Error',
          type: 'error',
        }),
        successNotification: () => ({
          message: `${selectedVenue.venueName} has been removed from this brand`,
          description: 'Success',
          type: 'success',
        }),
      },
      {
        onSuccess: () => {
          setIsRemoveVenueModalVisible(false);
          setSelectedVenue(null);
          refetchVenues();
        },
        onError: (error: any) => {
          console.error('Error removing venue from brand:', error);
        },
      }
    );
  };

  const showRemoveVenueModal = (venue: any) => {
    setSelectedVenue(venue);
    setIsRemoveVenueModalVisible(true);
  };

  const handleViewBrandOwner = (brandOwner: any) => {
    if (brandOwner.cmsUser?.id) {
      go({
        to: `/CMSUser/show/${brandOwner.cmsUser.id}`,
      });
    }
  };

  const handleRemoveBrandOwner = async () => {
    if (!selectedBrandOwner?.id) return;

    const deleteCMSUserBrandMutation = `
      mutation DeleteCMSUserBrand($id: ID!) {
        deleteCMSUserBrand(input: {id: $id}) {
          id
        }
      }
    `;

    mutate(
      {
        url: '',
        method: 'post',
        meta: {
          query: deleteCMSUserBrandMutation,
          queryName: 'deleteCMSUserBrand',
          variables: {
            id: selectedBrandOwner.id,
          },
        },
        values: {},
        errorNotification: () => ({
          message: 'Failed to remove brand owner',
          description: 'Error',
          type: 'error',
        }),
        successNotification: () => ({
          message: 'Brand owner removed successfully',
          description: 'Success',
          type: 'success',
        }),
      },
      {
        onSuccess: () => {
          setIsRemoveBrandOwnerModalVisible(false);
          setSelectedBrandOwner(null);
          refetchBrandOwners();
        },
        onError: (error: any) => {
          console.error('Error removing brand owner:', error);
        },
      }
    );
  };

  const showRemoveBrandOwnerModal = (brandOwner: any) => {
    setSelectedBrandOwner(brandOwner);
    setIsRemoveBrandOwnerModalVisible(true);
  };

  const handleAddWhiskey = () => {
    if (record?.id) {
      go({
        to: `/whiskey/create`,
        query: {
          brandId: record.id,
        },
      });
    }
  };

  const handleAddVenue = () => {
    if (record?.id) {
      go({
        to: `/venue/create`,
        query: {
          brandId: record.id,
        },
      });
    }
  };

  const handleAddBrandOwnerByEmail = async () => {
    if (!newOwnerEmail || !record?.id) return;

    setIsAddingBrandOwner(true);
    try {
      // First, check if CMS user exists with this email using the data provider
      const checkCMSUserQuery = `
        query ListCMSUsers($filter: ModelCMSUserFilterInput) {
          listCMSUsers(filter: $filter) {
            items {
              id
              email
              role
              isActive
            }
          }
        }
      `;

      // Use the mutate function to check if user exists
      mutate(
        {
          url: '',
          method: 'post',
          meta: {
            query: checkCMSUserQuery,
            queryName: 'listCMSUsers',
            variables: {
              filter: {
                email: { eq: newOwnerEmail },
              },
            },
          },
          values: {},
        },
        {
          onSuccess: (checkResult: any) => {
            const existingUser = checkResult?.data?.items?.[0];
            if (existingUser) {
              // User exists, create CMSUserBrand relationship
              const createSimpleCMSUserBrandMutation = `
                mutation CreateCMSUserBrand($input: CreateCMSUserBrandInput!) {
                  createCMSUserBrand(input: $input) {
                    id
                    cmsUserId
                    brandUserId
                    assignedAt
                    assignedBy
                  }
                }
              `;

              mutate(
                {
                  url: '',
                  method: 'post',
                  meta: {
                    query: createSimpleCMSUserBrandMutation,
                    queryName: 'createCMSUserBrand',
                    variables: {
                      input: {
                        cmsUserId: existingUser.id,
                        brandUserId: record.id,
                        assignedAt: new Date().toISOString(),
                        assignedBy: session?.user?.email || 'System',
                      },
                    },
                  },
                  values: {},
                },
                {
                  onSuccess: () => {
                    message.success(
                      `${newOwnerEmail} has been added as a brand owner`
                    );
                    setIsAddBrandOwnerByEmailModalVisible(false);
                    setNewOwnerEmail('');
                    emailForm.resetFields();
                    refetchBrandOwners();
                    setIsAddingBrandOwner(false);
                  },
                  onError: (error: any) => {
                    console.error(
                      'Error adding existing user as brand owner:',
                      error
                    );
                    message.error(
                      'Failed to add brand owner - user may already be assigned'
                    );
                    setIsAddingBrandOwner(false);
                  },
                }
              );
            } else {
              // User doesn't exist, use createCMSUserWithAuth to create user and send invitation
              const createCMSUserWithAuthMutation = `
                mutation CreateCMSUserWithAuth($email: String!, $role: CMSUserRole!, $brandId: String) {
                  createCMSUserWithAuth(email: $email, role: $role, brandId: $brandId) {
                    statusCode
                    success
                    message
                    cmsUserId
                    authId
                  }
                }
              `;

              mutate(
                {
                  url: '',
                  method: 'post',
                  meta: {
                    query: createCMSUserWithAuthMutation,
                    queryName: 'createCMSUserWithAuth',
                    variables: {
                      email: newOwnerEmail,
                      role: 'BrandOwner',
                      brandId: record.id,
                    },
                  },
                  values: {},
                },
                {
                  onSuccess: (createUserResult: any) => {
                    // Check different possible response structures
                    const responseData =
                      createUserResult?.data?.createCMSUserWithAuth ||
                      createUserResult?.createCMSUserWithAuth ||
                      createUserResult?.data ||
                      createUserResult;

                    if (responseData?.success) {
                      message.success(
                        `Brand owner created successfully! An invitation email has been sent to ${newOwnerEmail}`
                      );
                      setIsAddBrandOwnerByEmailModalVisible(false);
                      setNewOwnerEmail('');
                      emailForm.resetFields();
                      refetchBrandOwners();
                      setIsAddingBrandOwner(false);
                    } else {
                      const errorMessage =
                        responseData?.message || 'Failed to create brand owner';
                      console.error(
                        'Error creating brand owner:',
                        errorMessage
                      );
                      console.error('Full response:', createUserResult);
                      message.error(errorMessage);
                      setIsAddingBrandOwner(false);
                    }
                  },
                  onError: (error: any) => {
                    console.error('Error creating new CMS user:', error);
                    message.error(
                      error?.message || 'Failed to create new brand owner'
                    );
                    setIsAddingBrandOwner(false);
                  },
                }
              );
            }
          },
          onError: (error: any) => {
            console.error('Error checking for existing user:', error);
            message.error('Failed to check for existing user');
            setIsAddingBrandOwner(false);
          },
        }
      );
    } catch (error) {
      console.error('Error in handleAddBrandOwnerByEmail:', error);
      message.error('Failed to add brand owner');
      setIsAddingBrandOwner(false);
    }
  };

  /**
   * Handle brand transfer operation
   * Transfers brand ownership to a new email address
   */
  const handleTransferBrand = async () => {
    // Validate inputs
    if (!transferEmail || !record?.id) {
      message.error('Email and brand ID are required');
      return;
    }

    // Validate email format
    try {
      await transferForm.validateFields();
    } catch (error) {
      console.error('Form validation failed:', error);
      return;
    }

    setIsTransferring(true);

    // GraphQL mutation for transferring brand
    const transferBrandMutation = `
      mutation TransferBrand($id: ID!, $email: String!, $owner: String!) {
        transferBrand(id: $id, email: $email, owner: $owner)
      }
    `;

    mutate(
      {
        url: '',
        method: 'post',
        meta: {
          query: transferBrandMutation,
          queryName: 'transferBrand',
          variables: {
            id: record.id,
            email: transferEmail.toLowerCase().trim(),
            owner: record.owner,
          },
        },
        values: {},
        errorNotification: (error: any) => {
          // Parse error message for user-friendly display
          let errorMessage = 'Failed to transfer brand. Please try again.';

          if (error?.message) {
            if (error.message.includes('Email already exists')) {
              errorMessage = 'This email address is already in use.';
            } else if (error.message.includes('not available for transfer')) {
              errorMessage = 'This brand is not available for transfer.';
            } else if (error.message.includes('Unauthorized')) {
              errorMessage = 'Unauthorized. Please check your permissions.';
            } else if (error.message.includes('not found')) {
              errorMessage = 'Brand not found. Please refresh and try again.';
            }
          }

          return {
            message: errorMessage,
            description: 'Error',
            type: 'error',
          };
        },
        successNotification: () => ({
          message: `Brand "${record.brandName || record.username}" successfully transferred to ${transferEmail}`,
          description: 'Success',
          type: 'success',
        }),
      },
      {
        onSuccess: () => {
          // Close modal and reset state
          setIsTransferModalVisible(false);
          setTransferEmail('');
          transferForm.resetFields();
          setIsTransferring(false);

          // Refresh the brand data
          refetch();
          refetchBrandOwners();
        },
        onError: (error: any) => {
          console.error('Error transferring brand:', error);
          setIsTransferring(false);
        },
      }
    );
  };

  useEffect(() => {
    // Clear previous images when record changes to avoid stale data
    setBrandLogo(undefined);
    setCoverPicture(undefined);

    if (record && record.brandLogo) {
      getBrandLogo(record.brandLogo.key);
    }
    if (record && record.coverPicture) {
      getCoverPicture(record.coverPicture.key);
    }
  }, [record]);
  return (
    <Show
      isLoading={isLoading}
      title={`Brand: ${record?.brandName || record?.username || 'View Brand'}`}
      headerButtons={({ editButtonProps }) => (
        <>
          <Tooltip title="Refresh data">
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                refetch();
                refetchBrandOwners();
                refetchWhiskeys();
                refetchVenues();
              }}
            >
              Refresh
            </Button>
          </Tooltip>

          {canEdit() && editButtonProps && (
            <EditButton {...editButtonProps} resource="brand" />
          )}

          {/* Transfer Brand Button - Only show for admins */}
          {role === CMSUserRole.Admin && (
            <Tooltip title="Transfer this brand's mobile app login to a new user">
              <Button
                type="primary"
                icon={<ExportOutlined />}
                onClick={() => setIsTransferModalVisible(true)}
                style={{ backgroundColor: '#389e0d' }}
              >
                Transfer Mobile App Account
              </Button>
            </Tooltip>
          )}

          {canEdit() && role === CMSUserRole.Admin && record && record.id && (
            <SoftDeleteButton
              brandId={record.id}
              brandName={record.brandName || record.username}
            />
          )}
        </>
      )}
    >
      <Title level={5}>Brand Cover Image</Title>
      {coverPicture ? (
        <Image
          style={{
            width: '100%',
            maxHeight: '400px',
            objectFit: 'cover',
            marginBottom: '20px',
          }}
          src={coverPicture}
          alt="Brand Cover"
        />
      ) : record?.coverPicture ? (
        <div style={{ marginBottom: '20px' }}>Loading cover image...</div>
      ) : (
        <div style={{ color: '#999', marginBottom: '20px' }}>
          No cover image available
        </div>
      )}

      <Card style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ width: '150px', height: '150px' }}>
            {brandLogo ? (
              <Image
                style={{
                  width: '150px',
                  height: '150px',
                  objectFit: 'contain',
                }}
                src={brandLogo}
                alt="Brand Logo"
              />
            ) : record?.brandLogo ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: '#999',
                }}
              >
                Loading logo...
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: '#999',
                  border: '1px dashed #d9d9d9',
                  borderRadius: '4px',
                }}
              >
                No logo
              </div>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <Title level={3}>{record?.brandName || 'Unnamed Brand'}</Title>
            {record?.brandWebsite && (
              <a
                href={record.brandWebsite}
                target="_blank"
                rel="noopener noreferrer"
              >
                {record.brandWebsite}
              </a>
            )}
          </div>
        </div>
      </Card>

      <Descriptions bordered column={2}>
        <Descriptions.Item label="ID" span={2}>
          {record?.id}
        </Descriptions.Item>

        <Descriptions.Item label="Username">
          {record?.username || '-'}
        </Descriptions.Item>

        <Descriptions.Item label="Brand Name">
          {record?.brandName || '-'}
        </Descriptions.Item>

        <Descriptions.Item label="Country">
          {record?.brandCountry || '-'}
        </Descriptions.Item>

        <Descriptions.Item label="Founded Year">
          {record?.brandFoundedYear || '-'}
        </Descriptions.Item>

        <Descriptions.Item label="Website" span={2}>
          {record?.brandWebsite ? (
            <a
              href={record.brandWebsite}
              target="_blank"
              rel="noopener noreferrer"
            >
              {record.brandWebsite}
            </a>
          ) : (
            '-'
          )}
        </Descriptions.Item>

        <Descriptions.Item label="Mobile App User Email" span={2}>
          {ownerEmailLoading ? (
            <Text type="secondary" italic>
              Loading...
            </Text>
          ) : ownerEmailError ? (
            <Tooltip title={ownerEmailError}>
              <Text type="danger">Error loading email</Text>
            </Tooltip>
          ) : currentOwnerEmail ? (
            <Text copyable>{currentOwnerEmail}</Text>
          ) : (
            '-'
          )}
        </Descriptions.Item>

        <Descriptions.Item label="Description" span={2}>
          {record?.brandDescription || '-'}
        </Descriptions.Item>

        <Descriptions.Item label="Brand Story" span={2}>
          <div style={{ whiteSpace: 'pre-wrap' }}>
            {record?.brandStory || '-'}
          </div>
        </Descriptions.Item>

        <Descriptions.Item label="Created At">
          {record?.createdAt
            ? new Date(record.createdAt).toLocaleString()
            : '-'}
        </Descriptions.Item>

        <Descriptions.Item label="Updated At">
          {record?.updatedAt
            ? new Date(record.updatedAt).toLocaleString()
            : '-'}
        </Descriptions.Item>
      </Descriptions>

      {/* Brand Owners Table */}
      <Divider orientation="left">CMS Brand Owners</Divider>
      <Card style={{ marginTop: '20px' }}>
        <div
          style={{
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <Text strong>
              Assigned CMS Brand Owners ({brandOwnersData?.data?.length || 0})
            </Text>
          </div>
          {role === CMSUserRole.Admin && (
            <Tooltip title="Add new brand owner">
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                onClick={() => {
                  setIsAddOwnerModalVisible(true);
                }}
              >
                Add Owner
              </Button>
            </Tooltip>
          )}
          {role === CMSUserRole.BrandOwner && canEdit() && (
            <Tooltip title="Add new brand owner by email">
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                onClick={() => {
                  setIsAddBrandOwnerByEmailModalVisible(true);
                }}
              >
                Add Owner
              </Button>
            </Tooltip>
          )}
        </div>

        <Table
          dataSource={brandOwnersData?.data || []}
          loading={brandOwnersLoading}
          rowKey="id"
          size="small"
          pagination={false}
        >
          <Table.Column
            title="CMS User Email"
            dataIndex={['cmsUser', 'email']}
            render={(email) => email || 'Loading...'}
          />

          <Table.Column
            title="Role"
            dataIndex={['cmsUser', 'role']}
            render={(role) => {
              const colors: Record<string, string> = {
                Admin: 'red',
                BrandOwner: 'blue',
                Editor: 'green',
              };
              return role ? (
                <Tag color={colors[role] || 'default'}>{role}</Tag>
              ) : (
                'N/A'
              );
            }}
          />

          <Table.Column
            title="Status"
            dataIndex={['cmsUser', 'isActive']}
            render={(isActive) => (
              <Tag color={isActive ? 'green' : 'red'}>
                {isActive ? 'Active' : 'Inactive'}
              </Tag>
            )}
          />

          <Table.Column
            title="Assigned Date"
            dataIndex="assignedAt"
            render={(date) =>
              date ? new Date(date).toLocaleDateString() : 'N/A'
            }
          />

          <Table.Column
            title="Assigned By"
            dataIndex="assignedBy"
            render={(assignedBy) => assignedBy || 'System'}
          />

          {role === CMSUserRole.Admin && (
            <Table.Column
              title="Actions"
              render={(_, brandOwner: any) => (
                <Space>
                  <Tooltip title="View CMS User">
                    <Button
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => handleViewBrandOwner(brandOwner)}
                      disabled={!brandOwner.cmsUser?.id}
                    />
                  </Tooltip>
                  <Tooltip title="Remove as brand owner">
                    <Button
                      size="small"
                      danger
                      icon={<UserDeleteOutlined />}
                      onClick={() => showRemoveBrandOwnerModal(brandOwner)}
                    />
                  </Tooltip>
                </Space>
              )}
            />
          )}
        </Table>

        {(!brandOwnersData?.data || brandOwnersData?.data?.length === 0) &&
          !brandOwnersLoading && (
            <div
              style={{ textAlign: 'center', padding: '20px', color: '#999' }}
            >
              No brand owners assigned yet
            </div>
          )}
      </Card>

      {/* Brand Whiskeys Table */}
      <Divider orientation="left">Brand Whiskeys</Divider>
      <Card style={{ marginTop: '20px' }}>
        <div
          style={{
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <Text strong>
              Total Whiskeys ({whiskeysData?.data?.length || 0})
            </Text>
          </div>
          {canEdit() && (
            <Tooltip title="Add new whiskey to this brand">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddWhiskey}
              >
                Add Whiskey
              </Button>
            </Tooltip>
          )}
        </div>

        <Table
          dataSource={whiskeysData?.data || []}
          loading={whiskeysLoading}
          rowKey="id"
          size="small"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} whiskeys`,
          }}
        >
          <Table.Column
            title="Name"
            dataIndex="name"
            render={(name) => name || '-'}
            sorter={(a: any, b: any) =>
              (a.name || '').localeCompare(b.name || '')
            }
          />

          <Table.Column
            title="Category"
            dataIndex="category"
            render={(category) => category || '-'}
            filters={[
              { text: 'Bourbon', value: 'Bourbon' },
              { text: 'Scotch', value: 'Scotch' },
              { text: 'Irish', value: 'Irish' },
              { text: 'Japanese', value: 'Japanese' },
              { text: 'Rye', value: 'Rye' },
              { text: 'Canadian', value: 'Canadian' },
              { text: 'Other', value: 'Other' },
            ]}
            onFilter={(value: any, record: any) => record.category === value}
          />

          <Table.Column
            title="Age"
            dataIndex="age"
            render={(age) => (age ? `${age} years` : '-')}
            sorter={(a: any, b: any) =>
              (parseInt(a.age) || 0) - (parseInt(b.age) || 0)
            }
          />

          <Table.Column
            title="Proof"
            dataIndex="proof"
            render={(proof) => proof || '-'}
            sorter={(a: any, b: any) =>
              (parseFloat(a.proof) || 0) - (parseFloat(b.proof) || 0)
            }
          />

          <Table.Column
            title="Price"
            dataIndex="price"
            render={(price) => (price ? `$${price}` : '-')}
            sorter={(a: any, b: any) =>
              (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0)
            }
          />

          <Table.Column
            title="Specialist Choice"
            dataIndex="specialistChoice"
            render={(value: boolean) => (
              <BooleanField
                trueIcon={<TrueIcon />}
                falseIcon={<FalseIcon />}
                value={value}
              />
            )}
            filters={[
              { text: 'Yes', value: true },
              { text: 'No', value: false },
            ]}
            onFilter={(value: any, record: any) =>
              record.specialistChoice === value
            }
          />

          <Table.Column
            title="Starter Pick"
            dataIndex="starterPick"
            render={(value: boolean) => (
              <BooleanField
                trueIcon={<TrueIcon />}
                falseIcon={<FalseIcon />}
                value={value}
              />
            )}
            filters={[
              { text: 'Yes', value: true },
              { text: 'No', value: false },
            ]}
            onFilter={(value: any, record: any) => record.starterPick === value}
          />

          <Table.Column
            title="Actions"
            render={(_, record: any) => (
              <Space>
                <ShowButton
                  hideText
                  size="small"
                  resource="whiskey"
                  recordItemId={record.id}
                />
                {canEdit() && (
                  <Tooltip title="Remove this whiskey from the brand">
                    <Button
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => showRemoveWhiskeyModal(record)}
                    />
                  </Tooltip>
                )}
              </Space>
            )}
          />
        </Table>

        {(!whiskeysData?.data || whiskeysData?.data?.length === 0) &&
          !whiskeysLoading && (
            <div
              style={{ textAlign: 'center', padding: '20px', color: '#999' }}
            >
              No whiskeys found for this brand
            </div>
          )}
      </Card>

      {/* Brand Venues Table */}
      <Divider orientation="left">Brand Venues</Divider>
      <Card style={{ marginTop: '20px' }}>
        <div
          style={{
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <Text strong>Total Venues ({brandVenues.length})</Text>
          </div>
          {canEdit() && (
            <Tooltip title="Create a new venue linked to this brand">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddVenue}
              >
                Add Venue
              </Button>
            </Tooltip>
          )}
        </div>

        <Table
          dataSource={brandVenues}
          loading={venuesLoading}
          rowKey="id"
          size="small"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} venues`,
          }}
        >
          <Table.Column
            title="Venue Name"
            dataIndex="venueName"
            render={(venueName) => venueName || '-'}
            sorter={(a: any, b: any) =>
              (a.venueName || '').localeCompare(b.venueName || '')
            }
          />

          <Table.Column
            title="City"
            dataIndex="venueAddressCity"
            render={(city) => city || '-'}
            sorter={(a: any, b: any) =>
              (a.venueAddressCity || '').localeCompare(b.venueAddressCity || '')
            }
          />

          <Table.Column
            title="State"
            dataIndex="venueAddressState"
            render={(state) => state || '-'}
          />

          <Table.Column
            title="Address"
            dataIndex="venueAddressStreet"
            render={(street) => street || '-'}
          />

          <Table.Column
            title="Actions"
            render={(_, venue: any) => (
              <Space>
                <ShowButton
                  hideText
                  size="small"
                  resource="venue"
                  recordItemId={venue.id}
                />
                {canEdit() && (
                  <Tooltip title="Remove this venue from the brand">
                    <Button
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => showRemoveVenueModal(venue)}
                    />
                  </Tooltip>
                )}
              </Space>
            )}
          />
        </Table>

        {brandVenues.length === 0 && !venuesLoading && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
            No venues linked to this brand
          </div>
        )}
      </Card>

      {/* Add Owner Modal */}
      <Modal
        title="Add Brand Owner"
        open={isAddOwnerModalVisible}
        onOk={handleAddOwner}
        onCancel={() => {
          setIsAddOwnerModalVisible(false);
          setSelectedCMSUserId(undefined);
          form.resetFields();
        }}
        confirmLoading={false}
        okText="Add Owner"
        cancelText="Cancel"
        okButtonProps={{ disabled: !selectedCMSUserId }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Select CMS User"
            name="cmsUserId"
            rules={[{ required: true, message: 'Please select a CMS user' }]}
          >
            <Select
              showSearch
              placeholder="Search and select a CMS user..."
              loading={cmsUsersLoading}
              value={selectedCMSUserId}
              onChange={setSelectedCMSUserId}
              filterOption={(input, option) =>
                (option?.label ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={availableCMSUsers.map((user: any) => ({
                label: `${user.email} (${user.role})`,
                value: user.id,
              }))}
              notFoundContent={
                cmsUsersLoading
                  ? 'Loading...'
                  : availableCMSUsers.length === 0
                  ? 'No available users'
                  : 'No matching users found'
              }
            />
          </Form.Item>
          {availableCMSUsers.length === 0 && !cmsUsersLoading && (
            <div style={{ color: '#999', fontSize: '12px' }}>
              All active CMS users are already assigned to this brand.
            </div>
          )}
        </Form>
      </Modal>

      {/* Remove Whiskey from Brand Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ExclamationCircleOutlined style={{ color: '#faad14' }} />
            Confirm Removal
          </div>
        }
        open={isRemoveWhiskeyModalVisible}
        onOk={handleRemoveWhiskeyFromBrand}
        onCancel={() => {
          setIsRemoveWhiskeyModalVisible(false);
          setSelectedWhiskey(null);
        }}
        okText="Remove from Brand"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <div style={{ marginBottom: '16px' }}>
          <p>
            Are you sure you want to remove{' '}
            <strong>"{selectedWhiskey?.name}"</strong> from this brand?
          </p>
          <div
            style={{
              background: '#fff7e6',
              border: '1px solid #ffd591',
              borderRadius: '4px',
              padding: '12px',
              color: '#d46b08',
            }}
          >
            <strong>Warning:</strong> This whiskey will be left without a brand
            after removal.
          </div>
        </div>
      </Modal>

      {/* Remove Venue from Brand Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ExclamationCircleOutlined style={{ color: '#faad14' }} />
            Confirm Removal
          </div>
        }
        open={isRemoveVenueModalVisible}
        onOk={handleRemoveVenueFromBrand}
        onCancel={() => {
          setIsRemoveVenueModalVisible(false);
          setSelectedVenue(null);
        }}
        okText="Remove from Brand"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <div style={{ marginBottom: '16px' }}>
          <p>
            Are you sure you want to remove{' '}
            <strong>"{selectedVenue?.venueName}"</strong> from this brand?
          </p>
          <div
            style={{
              background: '#fff7e6',
              border: '1px solid #ffd591',
              borderRadius: '4px',
              padding: '12px',
              color: '#d46b08',
            }}
          >
            <strong>Warning:</strong> The venue itself is not deleted. It stays
            in the CMS with no parent brand and stops appearing on this brand's
            page in the app.
          </div>
        </div>
      </Modal>

      {/* Remove Brand Owner Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ExclamationCircleOutlined style={{ color: '#faad14' }} />
            Remove Brand Owner
          </div>
        }
        open={isRemoveBrandOwnerModalVisible}
        onOk={handleRemoveBrandOwner}
        onCancel={() => {
          setIsRemoveBrandOwnerModalVisible(false);
          setSelectedBrandOwner(null);
        }}
        okText="Remove Owner"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <div style={{ marginBottom: '16px' }}>
          <p>
            Are you sure you want to remove{' '}
            <strong>"{selectedBrandOwner?.cmsUser?.email}"</strong> as a brand
            owner?
          </p>
          <div
            style={{
              background: '#fff7e6',
              border: '1px solid #ffd591',
              borderRadius: '4px',
              padding: '12px',
              color: '#d46b08',
            }}
          >
            <strong>Warning:</strong> This will remove their access to manage
            this brand. They will no longer be able to edit whiskeys or other
            brand-related content.
          </div>
        </div>
      </Modal>

      {/* Add Brand Owner by Email Modal */}
      <Modal
        title="Add Brand Owner"
        open={isAddBrandOwnerByEmailModalVisible}
        onOk={handleAddBrandOwnerByEmail}
        onCancel={() => {
          if (!isAddingBrandOwner) {
            setIsAddBrandOwnerByEmailModalVisible(false);
            setNewOwnerEmail('');
            emailForm.resetFields();
          }
        }}
        okText="Add Owner"
        cancelText="Cancel"
        okButtonProps={{
          disabled: !newOwnerEmail || isAddingBrandOwner,
          loading: isAddingBrandOwner,
        }}
        cancelButtonProps={{
          disabled: isAddingBrandOwner,
        }}
        closable={!isAddingBrandOwner}
        maskClosable={!isAddingBrandOwner}
      >
        <Form form={emailForm} layout="vertical">
          <Form.Item
            label="Email Address"
            name="email"
            rules={[
              { required: true, message: 'Please enter an email address' },
              { type: 'email', message: 'Please enter a valid email address' },
            ]}
          >
            <Input
              placeholder="Enter email address..."
              value={newOwnerEmail}
              onChange={(e) => setNewOwnerEmail(e.target.value)}
              disabled={isAddingBrandOwner}
            />
          </Form.Item>
          <div style={{ color: '#666', fontSize: '12px', marginTop: '8px' }}>
            If this email belongs to an existing CMS user, they will be added as
            a brand owner. If not, a new CMS user account will be created and
            they will receive an invitation.
          </div>
        </Form>
      </Modal>

      {/* Transfer Brand Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ExportOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
            <span>Transfer Mobile App Account</span>
          </div>
        }
        open={isTransferModalVisible}
        onOk={handleTransferBrand}
        onCancel={() => {
          if (!isTransferring) {
            setIsTransferModalVisible(false);
            setTransferEmail('');
            transferForm.resetFields();
          }
        }}
        okText="Transfer Account"
        cancelText="Cancel"
        width={600}
        okButtonProps={{
          disabled: !transferEmail || isTransferring,
          loading: isTransferring,
          danger: true,
        }}
        cancelButtonProps={{
          disabled: isTransferring,
        }}
        closable={!isTransferring}
        maskClosable={!isTransferring}
      >
        <div style={{ marginBottom: '16px' }}>
          {/* Brand Information Card */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '12px' }}>
              Brand Information:
            </div>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}
            >
              <div>
                <Text type="secondary">Brand Name: </Text>
                <Text strong>{record?.brandName}</Text>
              </div>
              <div>
                <Text type="secondary">Username: </Text>
                <Text strong>@{record?.username}</Text>
              </div>
              <div>
                <Text type="secondary">Brand ID: </Text>
                <Text code>{record?.id}</Text>
              </div>
              <div>
                <Text type="secondary">Current Owner Email: </Text>
                {ownerEmailLoading ? (
                  <Text type="secondary" italic>
                    Loading...
                  </Text>
                ) : ownerEmailError ? (
                  <Tooltip title={ownerEmailError}>
                    <Text type="danger">Error loading email</Text>
                  </Tooltip>
                ) : currentOwnerEmail ? (
                  <Text strong copyable>
                    {currentOwnerEmail}
                  </Text>
                ) : (
                  <Text type="secondary">Not available</Text>
                )}
              </div>
              <div>
                <Text type="secondary">Current Status: </Text>
                {record?.toBeRedeemed ? (
                  <Tag color="orange">Awaiting Transfer</Tag>
                ) : (
                  <Tag color="green">Claimed</Tag>
                )}
              </div>
            </div>
          </div>

          {/* Email Form */}
          <Form form={transferForm} layout="vertical">
            <EmailField
              label="New Mobile App User Email Address"
              name="email"
              required={true}
              placeholder="newowner@example.com"
              value={transferEmail}
              onChange={(e) => setTransferEmail(e.target.value)}
              disabled={isTransferring}
              size="large"
              prefix={<UserAddOutlined style={{ color: '#bfbfbf' }} />}
            />
          </Form>

          {/* Warning Box */}
          <div style={{ marginTop: '20px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
              }}
            >
              <ExclamationCircleOutlined
                style={{ color: '#faad14', fontSize: '16px', marginTop: '2px' }}
              />
              <div>
                <Text strong style={{ color: '#faad14' }}>
                  Important Information:
                </Text>
                <ul
                  style={{
                    marginTop: '8px',
                    marginBottom: 0,
                    paddingLeft: '20px',
                  }}
                >
                  <li>This will transfer the mobile app login to a new user</li>
                  <li>
                    The new mobile app user will receive login credentials via email
                  </li>
                  <li>All brand whiskeys and content will remain intact</li>
                  <li>
                    <strong>CMS Brand Owners will retain their access permissions</strong> - this only affects the mobile app account
                  </li>
                  <li>
                    The brand's <code>toBeRedeemed</code> flag will be set to
                    false
                  </li>
                  <li>This action cannot be easily reversed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </Show>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/brand');
};

export default BrandShow;
