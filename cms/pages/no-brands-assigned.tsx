import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { getServerSession } from 'next-auth';
import { Result, Button } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { useContext } from 'react';
import { PermissionContext } from '@contexts';
import { authOptions } from './api/auth/[...nextauth]';
import { CMSUserRole } from '../src/graphql-data-provider/utils/graphQlTypes';

const NoBrandsAssigned = () => {
  const { role } = useContext(PermissionContext);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <Result
        status="warning"
        title="No Brands Assigned"
        subTitle={`Your ${role} account is not currently assigned to any brands.`}
        extra={
          <div style={{ textAlign: 'center' }}>
            <p>Please contact the administrator to get brand access:</p>
            <Button
              type="primary"
              icon={<MailOutlined />}
              href="mailto:admin@whiskeysocial.app"
            >
              admin@whiskeysocial.app
            </Button>
          </div>
        }
      />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
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
        destination: `/login?to=${encodeURIComponent('/no-brands-assigned')}`,
        permanent: false,
      },
    };
  }

  // Only brand-related roles should see this page
  const isBrandRole = session.role === CMSUserRole.BrandOwner || session.role === CMSUserRole.BrandEditor;
  const hasNoBrands = !session.brandUserIds || session.brandUserIds.length === 0;

  // If user is not a brand role or has brands, redirect them appropriately
  if (!isBrandRole || !hasNoBrands) {
    // Redirect to brand page if they have brands, or home if not a brand role
    return {
      redirect: {
        destination: isBrandRole ? '/brand' : '/',
        permanent: false,
      },
    };
  }

  return {
    props: {
      ...translateProps,
    },
  };
};

export default NoBrandsAssigned;