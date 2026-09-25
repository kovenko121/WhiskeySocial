import { Edit, useForm } from '@refinedev/antd';
import { GetServerSideProps } from 'next';
import { Form } from 'antd';
import React from 'react';

import { PourFormFields } from '@components/tasting/PourFormFields';
import { handleServerSideProps } from 'src/utils/serverSideProps';

const TastingPourEdit = () => {
  const { formProps, saveButtonProps, form } = useForm({ redirect: 'list' });

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <PourFormFields form={form} />
      </Form>
    </Edit>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/tastingPour');
};

export default TastingPourEdit;
