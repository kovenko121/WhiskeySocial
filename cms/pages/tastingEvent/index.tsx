import { GetServerSideProps } from 'next';

import {
  DeleteButton,
  EditButton,
  List,
  useTable,
} from '@refinedev/antd';
import { BaseRecord, IResourceComponentsProps } from '@refinedev/core';
import { Space, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import { handleServerSideProps } from 'src/utils/serverSideProps';
import { dateSorter, textSorter } from 'src/utils/tableSorters';

interface ITastingEvent {
  id: string;
  title: string;
  status: string;
  publishAt: string;
}

const STATUS_COLORS: { [key: string]: string } = {
  DRAFT: 'default',
  SCHEDULED: 'blue',
  PUBLISHED: 'green',
  ARCHIVED: 'red',
};

export const TastingEventList: React.FC<IResourceComponentsProps> = () => {
  const { tableProps } = useTable<ITastingEvent>({
    resource: 'tastingEvent',
    pagination: { mode: 'client' },
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="title"
          title="Title"
          sorter={textSorter<ITastingEvent>('title')}
        />
        <Table.Column
          dataIndex="status"
          title="Status"
          sorter={textSorter<ITastingEvent>('status')}
          render={(value: string) => (
            <Tag color={STATUS_COLORS[value] || 'default'}>{value}</Tag>
          )}
        />
        <Table.Column
          dataIndex="publishAt"
          title="Publish At"
          sorter={dateSorter<ITastingEvent>('publishAt')}
          render={(value) =>
            value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '—'
          }
        />
        <Table.Column
          title="Actions"
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/tastingEvent');
};

export default TastingEventList;
