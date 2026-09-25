import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../pages/api/auth/[...nextauth]';
import { CMSUserRole } from '../graphql-data-provider/utils/graphQlTypes';

export const handleServerSideProps = async (
  context: GetServerSidePropsContext,
  resourceUrl: string
): Promise<any> => {
  const session = await getServerSession(context.req, context.res, authOptions);

  const translateProps = await serverSideTranslations(context.locale ?? 'en', [
    'common',
  ]);

  if (!session) {
    return {
      props: {
        ...translateProps,
      },
      redirect: {
        destination: `/login?to=${encodeURIComponent(resourceUrl)}`,
        permanent: false,
      },
    };
  }

  // Check if user is a BrandOwner or BrandEditor with no brands assigned
  const isBrandRole =
    session.role === CMSUserRole.BrandOwner || session.role === CMSUserRole.BrandEditor;
  const hasNoBrands =
    !session.brandUserIds || session.brandUserIds.length === 0;
  const hasNoBrandsAssigned = isBrandRole && hasNoBrands;

  // Redirect brand users with no brands to the no-brands page
  if (hasNoBrandsAssigned && resourceUrl !== '/no-brands-assigned') {
    return {
      props: {
        ...translateProps,
      },
      redirect: {
        destination: '/no-brands-assigned',
        permanent: false,
      },
    };
  }

  // Include session data (role and brandUserIds) in props
  const initialPermissions = {
    role: session.role || null,
    brandUserIds: session.brandUserIds || [],
  };

  return {
    props: {
      ...translateProps,
      initialPermissions,
    },
  };
};
