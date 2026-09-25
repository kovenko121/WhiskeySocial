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
import { textSorter } from '../../src/utils/tableSorters';

interface ISuggestion {
  name: string;
  barcode: string;
  brand: string;
  year: string;
}

export const SuggestionList: React.FC<IResourceComponentsProps> = () => {
  const translate = useTranslate();
  const { tableProps } = useTable<ISuggestion>({
    resource: 'suggestion',
    pagination: {
      mode: 'client',
    },
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="brand"
          title={translate('suggestion.fields.brand')}
          sorter={textSorter<ISuggestion>('brand')}
          defaultSortOrder="ascend"
        />
        <Table.Column
          dataIndex="name"
          title={translate('suggestion.fields.name')}
          sorter={textSorter<ISuggestion>('name')}
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
  return handleServerSideProps(context, '/suggestion');
};

export default SuggestionList;
