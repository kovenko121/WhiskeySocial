import { GetServerSideProps } from 'next';

import { DeleteButton, List, ShowButton, useTable } from '@refinedev/antd';
import {
  BaseRecord,
  IResourceComponentsProps,
  useTranslate,
} from '@refinedev/core';
import { Space, Table } from 'antd';
import React from 'react';
import { handleServerSideProps } from '../../src/utils/serverSideProps';
import { dateSorter, textSorter } from '../../src/utils/tableSorters';

interface IReport {
  contentType: string;
  reason: string;
  createdAt: string;
  reportedUserId: string;
}

export const ReportList: React.FC<IResourceComponentsProps> = () => {
  const translate = useTranslate();
  const { tableProps } = useTable<IReport>({
    resource: 'report',
    pagination: {
      mode: 'client',
    },
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="contentType"
          title={translate('report.fields.contentType')}
          sorter={textSorter<IReport>('contentType')}
        />

        <Table.Column
          dataIndex="reason"
          title={translate('report.fields.reason')}
          sorter={textSorter<IReport>('reason')}
        />

        <Table.Column
          dataIndex="reportedUserId"
          title={translate('report.fields.reportedUserId')}
          sorter={textSorter<IReport>('reportedUserId')}
        />

        <Table.Column
          dataIndex="createdAt"
          title={translate('report.fields.createdAt')}
          sorter={dateSorter<IReport>('createdAt')}
        />

        <Table.Column
          title={translate('table.actions')}
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <ShowButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/report');
};

export default ReportList;
