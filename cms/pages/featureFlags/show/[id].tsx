import { GetServerSideProps } from 'next';

import { FalseIcon } from '@components/false-icon';
import { TrueIcon } from '@components/true-icon';
import { BooleanField, EditButton, Show, TextField } from '@refinedev/antd';
import { useShow, useTranslate } from '@refinedev/core';
import { Space, Tag, Typography } from 'antd';
import { handleServerSideProps } from '../../../src/utils/serverSideProps';

const { Title } = Typography;

const FeatureFlagsShow = () => {
  const translate = useTranslate();
  const { queryResult } = useShow({
    resource: 'featureFlags',
  });
  const { data, isLoading } = queryResult;

  const record = data?.data;

  return (
    <Show
      isLoading={isLoading}
      headerButtons={({ editButtonProps }) =>
        editButtonProps && <EditButton {...editButtonProps} />
      }
    >
      <Title level={5}>{translate('featureFlags.fields.id')}</Title>
      <TextField value={record?.id} />

      <Title level={5}>{translate('featureFlags.fields.key')}</Title>
      <TextField value={record?.key} />

      <Title level={5}>{translate('featureFlags.fields.value')}</Title>
      <BooleanField
        trueIcon={<TrueIcon />}
        falseIcon={<FalseIcon />}
        value={record?.value === 'true'}
      />

      <Title level={5}>Allowlist</Title>
      {!!record?.allowedUserIds?.length && (
        <Space size={[0, 8]} wrap>
          {record.allowedUserIds.map((userId: string) => (
            <Tag key={userId}>{userId}</Tag>
          ))}
        </Space>
      )}
      {!record?.allowedUserIds?.length && (
        <TextField value="None — flag follows the global toggle for all users" />
      )}
    </Show>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/featureFlags');
};

export default FeatureFlagsShow;
