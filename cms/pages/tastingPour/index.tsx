import { GetServerSideProps } from 'next';

import {
  DeleteButton,
  EditButton,
  List,
  useSelect,
  useTable,
} from '@refinedev/antd';
import {
  BaseRecord,
  CrudFilters,
  IResourceComponentsProps,
} from '@refinedev/core';
import { Form, Select, Space, Table, Tag } from 'antd';
import React from 'react';
import { filterByLabel } from '@components/tasting/filterByLabel';
import { handleServerSideProps } from 'src/utils/serverSideProps';
import { booleanSorter, textSorter } from 'src/utils/tableSorters';

interface ITastingPour {
  id: string;
  name: string;
  brand?: string;
  boothId: string;
  booth?: { id: string; name: string };
  whiskeyRefId?: string;
}

export const TastingPourList: React.FC<IResourceComponentsProps> = () => {
  const { tableProps, searchFormProps } = useTable<ITastingPour>({
    resource: 'tastingPour',
    pagination: { mode: 'client' },
    sorters: { initial: [{ field: 'order', order: 'asc' }] },
    onSearch: (values: any) => {
      const filters: CrudFilters = [];
      if (values?.boothId) {
        filters.push({ field: 'boothId', operator: 'eq', value: values.boothId });
      }
      return filters;
    },
  });

  const { selectProps: boothSelectProps } = useSelect({
    resource: 'tastingBooth',
    optionLabel: 'name',
    optionValue: 'id',
  });

  return (
    <List>
      <Form {...searchFormProps} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item name="boothId" label="Booth">
          <Select
            {...boothSelectProps}
            onSearch={undefined}
            filterOption={filterByLabel}
            showSearch
            allowClear
            style={{ minWidth: 260 }}
            placeholder="Filter by booth"
            onChange={() => searchFormProps.form?.submit()}
          />
        </Form.Item>
      </Form>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="name"
          title="Bottle"
          sorter={textSorter<ITastingPour>('name')}
        />
        <Table.Column
          dataIndex="brand"
          title="Brand"
          sorter={textSorter<ITastingPour>('brand')}
        />
        <Table.Column
          dataIndex={['booth', 'name']}
          title="Booth"
          sorter={textSorter<ITastingPour>(['booth', 'name'])}
          render={(value: string, record: ITastingPour) =>
            value || record.boothId
          }
        />
        <Table.Column
          dataIndex="whiskeyRefId"
          title="Source"
          sorter={booleanSorter<ITastingPour>('whiskeyRefId')}
          render={(value: string) =>
            value ? <Tag color="blue">catalogue</Tag> : <Tag>custom</Tag>
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
  return handleServerSideProps(context, '/tastingPour');
};

export default TastingPourList;
