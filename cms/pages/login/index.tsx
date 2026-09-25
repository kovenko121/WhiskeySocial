import { useLogin, useTranslate } from '@refinedev/core';

import { Button, Layout, Space } from 'antd';

import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { AppIcon } from 'src/components/app-icon';

import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';

const Login = () => {
  const { mutate: login } = useLogin();

  const t = useTranslate();

  return (
    <Layout
      style={{
        height: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Space direction="vertical" align="center">
        <AppIcon width={310} height={50} />
        <Button
          style={{ width: '240px', marginTop: '56px', marginBottom: '12px' }}
          type="primary"
          size="middle"
          onClick={() => login({})}
        >
          {t('pages.login.signin', 'Sign in')}
        </Button>
      </Space>
    </Layout>
  );
};

Login.noLayout = true;

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  const translateProps = await serverSideTranslations(context.locale ?? 'en', [
    'common',
  ]);

  if (session) {
    return {
      props: {},
      redirect: {
        destination: '/',
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

export default Login;
