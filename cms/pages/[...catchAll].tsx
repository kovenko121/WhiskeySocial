import { ErrorComponent } from '@refinedev/antd';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const CatchAll = () => <ErrorComponent />;

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  const translateProps = await serverSideTranslations(context.locale ?? 'en', [
    'common',
  ]);

  return {
    props: {
      ...translateProps,
    },
  };
};

export default CatchAll;
