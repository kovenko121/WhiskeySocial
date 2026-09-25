import { Edit, useForm } from '@refinedev/antd';
import { useShow, useTranslate } from '@refinedev/core';
import { Checkbox, Form, Image, Input } from 'antd';
import { GetServerSideProps } from 'next';
import { useEffect, useState } from 'react';
import { getObject } from '../../../src/graphql-data-provider/utils/s3';
import { handleServerSideProps } from '../../../src/utils/serverSideProps';

const RewardEdit = () => {
  const translate = useTranslate();
  const { formProps, saveButtonProps } = useForm({
    redirect: 'show',
  });

  const { queryResult } = useShow({
    resource: 'reward',
  });
  const { data } = queryResult;
  const [picture, setPicture] = useState<string | undefined>();

  const record = data?.data;

  const getPicture = async (key: string) => {
    const result = await getObject(key);
    setPicture(result);
  };

  useEffect(() => {
    if (record && record.photo) {
      getPicture(record.photo.key);
    }
  }, [record]);

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label={translate('reward.fields.photo')} name={['photo']}>
          <Image style={{ width: '50%' }} src={picture} />
        </Form.Item>
        <Form.Item label={translate('reward.fields.id')} name={['id']}>
          <Input readOnly disabled />
        </Form.Item>

        <Form.Item label={translate('reward.fields.title')} name={['title']}>
          <Input readOnly disabled />
        </Form.Item>

        <Form.Item
          label={translate('reward.fields.isAvailable')}
          name={['isAvailable']}
          valuePropName="checked"
        >
          <Checkbox value={['isAvailable']} />
        </Form.Item>

        <Form.Item label={translate('reward.fields.conditions')}>
          <Input
            readOnly
            disabled
            value={`${formProps?.initialValues?.conditions[0]?.value} ${formProps?.initialValues?.conditions[0]?.key}s`}
          />
        </Form.Item>

        <Form.Item label={translate('reward.fields.sizes')} name={['sizes']}>
          <Input readOnly disabled />
        </Form.Item>

        <Form.Item
          label={translate('reward.fields.description')}
          name={['description']}
        >
          <Input readOnly disabled />
        </Form.Item>
      </Form>
    </Edit>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/reward');
};

export default RewardEdit;
