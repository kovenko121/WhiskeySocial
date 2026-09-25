import { FalseIcon } from '@components/false-icon';
import { TrueIcon } from '@components/true-icon';
import {
  BooleanField,
  EditButton,
  List,
  ShowButton,
  useTable,
} from '@refinedev/antd';
import {
  BaseRecord,
  IResourceComponentsProps,
  useTranslate,
} from '@refinedev/core';
import { Space, Table } from 'antd';
import { GetServerSideProps } from 'next';
import React from 'react';
import { handleServerSideProps } from '../../src/utils/serverSideProps';
import { booleanSorter, textSorter } from '../../src/utils/tableSorters';

interface IReward {
  isAvailable: boolean;
  title: string;
  description: string;
  rules: string;
}

export const RewardList: React.FC<IResourceComponentsProps> = () => {
  const translate = useTranslate();
  const { tableProps } = useTable<IReward>({
    resource: 'reward',
    pagination: {
      mode: 'client',
    },
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="isAvailable"
          title={translate('reward.fields.isAvailable')}
          sorter={booleanSorter<IReward>('isAvailable')}
          render={(value) => (
            <BooleanField
              value={value === true}
              trueIcon={<TrueIcon />}
              falseIcon={<FalseIcon />}
            />
          )}
        />
        <Table.Column
          dataIndex="title"
          title={translate('reward.fields.title')}
          sorter={textSorter<IReward>('title')}
        />

        <Table.Column
          title={translate('table.actions')}
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <ShowButton hideText size="small" recordItemId={record.id} />
              <EditButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/reward');
};

export default RewardList;
