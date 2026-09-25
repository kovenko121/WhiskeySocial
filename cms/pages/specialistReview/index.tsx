import { GetServerSideProps } from 'next';

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
import { Button, Form, Input, Space, Table } from 'antd';
import React, { useEffect } from 'react';

import { ClearOutlined, SearchOutlined } from '@ant-design/icons';
import { handleServerSideProps } from '../../src/utils/serverSideProps';
import { textSorter } from '../../src/utils/tableSorters';

export const SpecialistReviewsList: React.FC<IResourceComponentsProps> = () => {
  const translate = useTranslate();

  const { tableProps, searchFormProps } = useTable({
    resource: 'review',
    pagination: {
      mode: 'client',
    },
    filters: {
      permanent: [
        {
          field: 'specialistReview',
          operator: 'eq',
          value: 1,
        },
      ],
    },

    onSearch: (values: any) => [
      {
        field: 'whiskeyId',
        operator: 'contains',
        value: values?.whiskeyId?.toLowerCase(),
      },
    ],
  });

  useEffect(() => {
    searchFormProps.form?.resetFields();
    searchFormProps.form?.submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <List title="Specialist Reviews">
      <Form {...searchFormProps} layout="inline">
        <Form.Item name="whiskeyId">
          <Input placeholder="Search by whiskeyId" />
        </Form.Item>
        <Button
          style={{ marginBottom: 20, marginRight: 20 }}
          onClick={() => {
            searchFormProps.form?.submit();
          }}
        >
          <SearchOutlined />
          Search
        </Button>

        <Button
          style={{ marginLeft: 5 }}
          onClick={() => {
            searchFormProps.form?.resetFields();
            searchFormProps.form?.submit();
          }}
        >
          <ClearOutlined />
          Clear filters
        </Button>
      </Form>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="id"
          title={translate('specialistReview.fields.id')}
          sorter={textSorter('id')}
        />

        <Table.Column
          dataIndex="whiskeyId"
          title={translate('specialistReview.fields.whiskeyId')}
          sorter={textSorter('whiskeyId')}
        />
        <Table.Column
          dataIndex="title"
          title={translate('specialistReview.fields.title')}
          sorter={textSorter('title')}
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
  return handleServerSideProps(context, '/specialistReview');
};

export default SpecialistReviewsList;
