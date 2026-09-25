import { Edit, useForm } from '@refinedev/antd';
import { GetServerSideProps } from 'next';
import { Form } from 'antd';
import React from 'react';

import { BoothFormFields } from '@components/tasting/BoothFormFields';
import { handleServerSideProps } from 'src/utils/serverSideProps';

const TastingBoothEdit = () => {
  const { formProps, saveButtonProps, form } = useForm({ redirect: 'list' });

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <BoothFormFields form={form} />
      </Form>
    </Edit>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/tastingBooth');
};

export default TastingBoothEdit;
