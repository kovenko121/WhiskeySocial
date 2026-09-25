import { GetServerSideProps } from 'next';

import { DeleteButton, EditButton, Show, TextField } from '@refinedev/antd';
import { useShow, useTranslate } from '@refinedev/core';
import { Image, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { getObject } from '../../../src/graphql-data-provider/utils/s3';
import { handleServerSideProps } from '../../../src/utils/serverSideProps';

const { Title } = Typography;

const UserRewardShow = () => {
  const translate = useTranslate();
  const { queryResult } = useShow({
    resource: 'userReward',
  });
  const { data, isLoading } = queryResult;
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
    <Show
      isLoading={isLoading}
      headerButtons={({ editButtonProps, deleteButtonProps }) => (
        <>
          {editButtonProps && <EditButton {...editButtonProps} />}
          {deleteButtonProps && <DeleteButton {...deleteButtonProps} />}
        </>
      )}
    >
      <Title level={5}>{translate('userReward.fields.reward.photo')}</Title>
      <Image style={{ width: '50%' }} src={picture} />

      <Title level={5}>{translate('userReward.fields.reward.title')}</Title>
      <TextField value={record?.reward.title} />

      <Title level={5}>
        {translate('userReward.fields.reward.description')}
      </Title>
      <TextField value={record?.reward.description} />

      <Title level={5}>{translate('userReward.fields.size')}</Title>
      <TextField value={record?.size} />

      <Title level={5}>{translate('userReward.fields.model')}</Title>
      <TextField value={record?.model} />

      <Title level={5}>{translate('userReward.fields.fullName')}</Title>
      <TextField value={record?.fullName} />

      <Title level={5}>{translate('userReward.fields.address')}</Title>
      <TextField value={record?.address} />

      <Title level={5}>{translate('userReward.fields.city')}</Title>
      <TextField value={record?.city} />

      <Title level={5}>{translate('userReward.fields.state')}</Title>
      <TextField value={record?.state} />

      <Title level={5}>{translate('userReward.fields.zipcode')}</Title>
      <TextField value={record?.zipcode} />

      <Title level={5}>{translate('userReward.fields.trackingCode')}</Title>
      <TextField value={record?.trackingCode} />

      <Title level={5}>{translate('userReward.fields.service')}</Title>
      <TextField value={record?.service} />
    </Show>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/userReward');
};

export default UserRewardShow;
