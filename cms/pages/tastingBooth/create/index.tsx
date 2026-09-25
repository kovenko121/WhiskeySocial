import { Create, useForm } from '@refinedev/antd';
import { GetServerSideProps } from 'next';
import { Form } from 'antd';
import React from 'react';

import { BoothFormFields } from '@components/tasting/BoothFormFields';
import { handleServerSideProps } from 'src/utils/serverSideProps';

const TastingBoothCreate = () => {
  const { formProps, saveButtonProps, form } = useForm({ redirect: 'list' });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <BoothFormFields form={form} isCreate />
      </Form>
    </Create>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/tastingBooth');
};

export default TastingBoothCreate;
