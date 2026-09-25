import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { getServerSession } from 'next-auth';

import { List, useTable } from '@refinedev/antd';
import { IResourceComponentsProps, useTranslate } from '@refinedev/core';
import { Table } from 'antd';
import React from 'react';
import { authOptions } from '../api/auth/[...nextauth]';
import { handleServerSideProps } from 'src/utils/serverSideProps';
import { numberSorter, textSorter } from 'src/utils/tableSorters';

interface IAdReport {
  campaign: string;
  impressions: string;
  interactions: string;
}

export const AdReportList: React.FC<IResourceComponentsProps> = () => {
  const translate = useTranslate();
  const { tableProps } = useTable<IAdReport>({
    resource: 'events',
    pagination: {
      mode: 'client',
    },
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="campaign"
          title={translate('events.fields.campaign')}
          sorter={textSorter<IAdReport>('campaign')}
        />

        <Table.Column
          dataIndex="impressions"
          title={translate('events.fields.impressions')}
          sorter={numberSorter<IAdReport>('impressions')}
        />

        <Table.Column
          dataIndex="interactions"
          title={translate('events.fields.interactions')}
          sorter={numberSorter<IAdReport>('interactions')}
        />
      </Table>
    </List>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/events');
};

export default AdReportList;
