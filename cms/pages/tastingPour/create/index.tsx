import { Create, useForm } from '@refinedev/antd';
import { GetServerSideProps } from 'next';
import { Form } from 'antd';
import React from 'react';

import { PourFormFields } from '@components/tasting/PourFormFields';
import { handleServerSideProps } from 'src/utils/serverSideProps';

const TastingPourCreate = () => {
  const { formProps, saveButtonProps, form } = useForm({ redirect: 'list' });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <PourFormFields form={form} isCreate />
      </Form>
    </Create>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/tastingPour');
};

export default TastingPourCreate;
