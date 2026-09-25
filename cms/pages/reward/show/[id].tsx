import { GetServerSideProps } from 'next';

import { FalseIcon } from '@components/false-icon';
import { TrueIcon } from '@components/true-icon';
import { BooleanField, EditButton, Show, TextField } from '@refinedev/antd';
import { useShow, useTranslate } from '@refinedev/core';
import { Image, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { getObject } from '../../../src/graphql-data-provider/utils/s3';
import { handleServerSideProps } from '../../../src/utils/serverSideProps';

const { Title } = Typography;

const RewardShow = () => {
  const translate = useTranslate();
  const { queryResult } = useShow({
    resource: 'reward',
  });
  const { data, isLoading } = queryResult;
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
    <Show
      isLoading={isLoading}
      headerButtons={({ editButtonProps }) =>
        editButtonProps && <EditButton {...editButtonProps} />
      }
    >
      <Title level={5}>{translate('reward.fields.photo')}</Title>
      <Image style={{ width: '50%' }} src={picture} />

      <Title level={5}>{translate('reward.fields.id')}</Title>
      <TextField value={record?.id} />

      <Title level={5}>{translate('reward.fields.title')}</Title>
      <TextField value={record?.title} />

      <Title level={5}>{translate('reward.fields.isAvailable')}</Title>
      <BooleanField
        trueIcon={<TrueIcon />}
        falseIcon={<FalseIcon />}
        value={record?.isAvailable}
      />

      <Title level={5}>{translate('reward.fields.conditions')}</Title>
      <TextField
        value={`${record?.conditions[0]?.value} ${record?.conditions[0]?.key}s`}
      />

      <Title level={5}>{translate('reward.fields.sizes')}</Title>
      <TextField
        value={
          record && record?.sizes
            ? record.sizes.map((size: string, index: number) =>
                index !== record.sizes.length - 1 ? `${size}, ` : `${size}`
              )
            : ''
        }
      />

      <Title level={5}>{translate('reward.fields.description')}</Title>
      <TextField value={record?.description} />
    </Show>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/reward');
};

export default RewardShow;
