import { DeleteButton, Edit, SaveButton, useForm } from '@refinedev/antd';
import { useShow, useTranslate } from '@refinedev/core';
import { Form, Image, Input, Typography } from 'antd';
import { GetServerSideProps } from 'next';
import { useEffect, useState } from 'react';
import { getObject } from 'src/graphql-data-provider/utils/s3';
import { handleServerSideProps } from '../../../src/utils/serverSideProps';

const { Title } = Typography;

const UserRewardEdit = () => {
  const translate = useTranslate();

  const { formProps, saveButtonProps } = useForm({
    redirect: 'show',
  });

  const { queryResult } = useShow({
    resource: 'userReward',
  });
  const { data } = queryResult;
  const [picture, setPicture] = useState<string | undefined>();

  const record = data?.data;

  const getPicture = async (key: string) => {
    const result = await getObject(key);
    setPicture(result);
  };

  useEffect(() => {
    if (record && record.reward.photo) {
      getPicture(record.reward.photo.key);
    }
  }, [record]);

  return (
    <Edit
      headerButtonProps={{
        style: {
          padding: '16px',
        },
      }}
      headerButtons={() => (
        <>
          <DeleteButton />
          <SaveButton {...saveButtonProps} />
        </>
      )}
      saveButtonProps={saveButtonProps}
    >
      <Form {...formProps} layout="vertical">
        <Title level={5}>{translate('userReward.fields.reward.photo')}</Title>
        <Image style={{ width: '50%' }} src={picture} />

        <Form.Item label={translate('userReward.fields.reward.title')}>
          <Input readOnly value={record?.reward.title} disabled />
        </Form.Item>

        <Form.Item label={translate('userReward.fields.reward.description')}>
          <Input readOnly value={record?.reward.description} disabled />
        </Form.Item>

        <Form.Item label={translate('userReward.fields.size')}>
          <Input readOnly value={record?.size} disabled />
        </Form.Item>

        <Form.Item label={translate('userReward.fields.model')}>
          <Input readOnly value={record?.model} disabled />
        </Form.Item>

        <Form.Item label={translate('userReward.fields.fullName')}>
          <Input readOnly value={record?.fullName} disabled />
        </Form.Item>

        <Form.Item label={translate('userReward.fields.address')}>
          <Input readOnly value={record?.address} disabled />
        </Form.Item>

        <Form.Item label={translate('userReward.fields.city')}>
          <Input readOnly value={record?.city} disabled />
        </Form.Item>

        <Form.Item label={translate('userReward.fields.state')}>
          <Input readOnly value={record?.state} disabled />
        </Form.Item>

        <Form.Item label={translate('userReward.fields.zipcode')}>
          <Input readOnly value={record?.zipcode} disabled />
        </Form.Item>

        <Form.Item
          label={translate('userReward.fields.trackingCode')}
          name={['trackingCode']}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label={translate('userReward.fields.service')}
          name={['service']}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Edit>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/userReward');
};

export default UserRewardEdit;
