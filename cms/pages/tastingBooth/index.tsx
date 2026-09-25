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

interface ITastingBooth {
  id: string;
  name: string;
  eventId: string;
  event?: { id: string; title: string };
  brandRefId?: string;
}

export const TastingBoothList: React.FC<IResourceComponentsProps> = () => {
  const { tableProps, searchFormProps } = useTable<ITastingBooth>({
    resource: 'tastingBooth',
    pagination: { mode: 'client' },
    onSearch: (values: any) => {
      const filters: CrudFilters = [];
      if (values?.eventId) {
        filters.push({ field: 'eventId', operator: 'eq', value: values.eventId });
      }
      return filters;
    },
  });

  const { selectProps: eventSelectProps } = useSelect({
    resource: 'tastingEvent',
    optionLabel: 'title',
    optionValue: 'id',
  });

  return (
    <List>
      <Form {...searchFormProps} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item name="eventId" label="Event">
          <Select
            {...eventSelectProps}
            onSearch={undefined}
            filterOption={filterByLabel}
            showSearch
            allowClear
            style={{ minWidth: 260 }}
            placeholder="Filter by event"
            onChange={() => searchFormProps.form?.submit()}
          />
        </Form.Item>
      </Form>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="name"
          title="Booth"
          sorter={textSorter<ITastingBooth>('name')}
          defaultSortOrder="ascend"
        />
        <Table.Column
          dataIndex={['event', 'title']}
          title="Event"
          sorter={textSorter<ITastingBooth>(['event', 'title'])}
          render={(value: string, record: ITastingBooth) =>
            value || record.eventId
          }
        />
        <Table.Column
          dataIndex="brandRefId"
          title="Brand"
          sorter={booleanSorter<ITastingBooth>('brandRefId')}
          render={(value: string) =>
            value ? <Tag color="blue">linked</Tag> : <Tag>custom</Tag>
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
  return handleServerSideProps(context, '/tastingBooth');
};

export default TastingBoothList;
