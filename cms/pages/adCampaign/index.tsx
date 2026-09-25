import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { getServerSession } from 'next-auth';

import {
  DeleteButton,
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
import dayjs from 'dayjs';
import React from 'react';
import { authOptions } from '../api/auth/[...nextauth]';
import { handleServerSideProps } from 'src/utils/serverSideProps';
import { dateSorter, textSorter } from 'src/utils/tableSorters';

interface IAd {
  name: string;
  owner: string;
  type: string;
  startDate: string;
  endDate: string;
}

export const AdCampaignList: React.FC<IResourceComponentsProps> = () => {
  const translate = useTranslate();
  const { tableProps } = useTable<IAd>({
    resource: 'adCampaign',
    pagination: {
      mode: 'client',
    },
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="name"
          title={translate('adCampaign.fields.name')}
          sorter={textSorter<IAd>('name')}
        />

        <Table.Column
          dataIndex="owner"
          title={translate('adCampaign.fields.owner')}
          sorter={textSorter<IAd>('owner')}
        />

        <Table.Column
          dataIndex="type"
          title={translate('adCampaign.fields.type')}
          sorter={textSorter<IAd>('type')}
        />

        <Table.Column
          dataIndex="startDate"
          title={translate('adCampaign.fields.startDate')}
          sorter={dateSorter<IAd>('startDate')}
          render={(value) => dayjs(value).format('YYYY-MM-DD')}
        />

        <Table.Column
          dataIndex="endDate"
          title={translate('adCampaign.fields.endDate')}
          sorter={dateSorter<IAd>('endDate')}
          render={(value) => dayjs(value).format('YYYY-MM-DD')}
        />

        <Table.Column
          title={translate('table.actions')}
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <ShowButton hideText size="small" recordItemId={record.id} />
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
  return handleServerSideProps(context, '/adCampaign');
};

export default AdCampaignList;
