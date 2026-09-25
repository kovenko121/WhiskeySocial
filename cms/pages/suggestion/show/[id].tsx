import { GetServerSideProps } from 'next';

import { DeleteButton, Show, TextField } from '@refinedev/antd';
import { useShow, useTranslate } from '@refinedev/core';
import { Image, Space, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { getObject } from '../../../src/graphql-data-provider/utils/s3';
import { useAppUserContact } from '../../../src/hooks/useAppUserContact';
import { handleServerSideProps } from '../../../src/utils/serverSideProps';

const { Text, Title } = Typography;

const SuggestionShow = () => {
  const translate = useTranslate();
  const { queryResult } = useShow({
    resource: 'suggestion',
  });
  const { data, isLoading } = queryResult;
  const [picture, setPicture] = useState<string | undefined>();

  const record = data?.data;

  const {
    name: submitterName,
    username: submitterUsername,
    email: submitterEmail,
    deleted: submitterDeleted,
    profileFound: submitterProfileFound,
    loading: submitterLoading,
    emailError: submitterEmailError,
  } = useAppUserContact(record?.userId);

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
      headerButtons={({ deleteButtonProps }) =>
        deleteButtonProps && <DeleteButton {...deleteButtonProps} />
      }
    >
      <Title level={5}>{translate('suggestion.fields.photo')}</Title>
      <Image style={{ width: '50%' }} src={picture} />

      <Title level={5}>{translate('suggestion.fields.id')}</Title>
      <TextField value={record?.id} />

      {record?.barcode && (
        <>
          <Title level={5}>{translate('suggestion.fields.barcode')}</Title>
          <TextField value={record?.barcode} />
        </>
      )}

      <Title level={5}>{translate('suggestion.fields.name')}</Title>
      <TextField value={record?.name} />

      <Title level={5}>{translate('suggestion.fields.brand')}</Title>
      <TextField value={record?.brand} />

      <Title level={5}>{translate('suggestion.fields.year')}</Title>
      <TextField value={record?.year} />

      <Title level={5}>{translate('suggestion.fields.submittedBy')}</Title>

      {!record?.userId && (
        <TextField value={translate('suggestion.submitter.notRecorded')} />
      )}

      {record?.userId && (
        <Space direction="vertical" size={2}>
          {submitterLoading && (
            <Text type="secondary">
              {translate('suggestion.submitter.loading')}
            </Text>
          )}

          {!submitterLoading && submitterName && (
            <Text strong>{submitterName}</Text>
          )}

          {!submitterLoading && submitterUsername && (
            <Text type="secondary">@{submitterUsername}</Text>
          )}

          {!submitterLoading && submitterEmail && (
            <Text copyable>{submitterEmail}</Text>
          )}

          {!submitterLoading && !submitterEmail && submitterEmailError && (
            <Text type="danger">
              {translate('suggestion.submitter.emailUnavailable')}
            </Text>
          )}

          {!submitterLoading && !submitterProfileFound && (
            <Text type="warning">
              {translate('suggestion.submitter.profileMissing')}
            </Text>
          )}

          {!submitterLoading && submitterDeleted && (
            <Text type="warning">
              {translate('suggestion.submitter.deleted')}
            </Text>
          )}

          <Text type="secondary" style={{ fontSize: 12 }} copyable>
            {record.userId}
          </Text>
        </Space>
      )}
    </Show>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/suggestion');
};

export default SuggestionShow;
