import { GetServerSideProps } from 'next';

import { FalseIcon } from '@components/false-icon';
import { TrueIcon } from '@components/true-icon';
import {
  BooleanField,
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
import React from 'react';
import { handleServerSideProps } from '../../src/utils/serverSideProps';
import { booleanSorter, textSorter } from '../../src/utils/tableSorters';

interface IFeatureFlag {
  key: string;
  value: string;
}

export const FeatureFlagsList: React.FC<IResourceComponentsProps> = () => {
  const translate = useTranslate();
  const { tableProps } = useTable<IFeatureFlag>({
    resource: 'featureFlags',
    pagination: {
      mode: 'client',
    },
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="key"
          title={translate('featureFlags.fields.key')}
          sorter={textSorter<IFeatureFlag>('key')}
        />

        <Table.Column
          dataIndex="value"
          title={translate('featureFlags.fields.value')}
          sorter={booleanSorter<IFeatureFlag>(
            (record) => record.value === 'true'
          )}
          render={(value: string) => (
            <BooleanField
              trueIcon={<TrueIcon />}
              falseIcon={<FalseIcon />}
              value={value === 'true'}
            />
          )}
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
  return handleServerSideProps(context, '/featureFlags');
};

export default FeatureFlagsList;
