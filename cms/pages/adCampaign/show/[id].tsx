import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { getServerSession } from 'next-auth';

import { DeleteButton, EditButton, Show, TextField } from '@refinedev/antd';
import { useShow, useTranslate } from '@refinedev/core';
import { Image, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { getObject } from '../../../src/graphql-data-provider/utils/s3';
import { authOptions } from '../../api/auth/[...nextauth]';
import { handleServerSideProps } from 'src/utils/serverSideProps';

const { Title } = Typography;

const AdCampaignShow = () => {
  const translate = useTranslate();
  const { queryResult } = useShow({
    resource: 'adCampaign',
  });
  const { data, isLoading } = queryResult;
  const [picture, setPicture] = useState<string | undefined>();

  const record = data?.data;

  const getPicture = async (key: string) => {
    const result = await getObject(key);
    setPicture(result);
  };

  useEffect(() => {
    if (record && record.picture) {
      getPicture(record.picture.key);
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
      <Title level={5}>{translate('adCampaign.fields.picture')}</Title>
      <Image style={{ width: '50%' }} src={picture} />

      <Title level={5}>{translate('adCampaign.fields.owner')}</Title>
      <TextField value={record?.owner} />

      <Title level={5}>{translate('adCampaign.fields.name')}</Title>
      <TextField value={record?.name} />

      <Title level={5}>{translate('adCampaign.fields.url')}</Title>
      <TextField value={record?.url} />

      <Title level={5}>{translate('adCampaign.fields.startDate')}</Title>
      <TextField value={record?.startDate.split('T')[0]} />

      <Title level={5}>{translate('adCampaign.fields.endDate')}</Title>
      <TextField value={record?.endDate.split('T')[0]} />

      <Title level={5}>{translate('adCampaign.fields.type')}</Title>
      <TextField value={record?.type} />
    </Show>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/adCampaign');
};

export default AdCampaignShow;
