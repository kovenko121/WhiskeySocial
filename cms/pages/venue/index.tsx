import { GetServerSideProps } from 'next';

import {
  ClearOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  CreateButton,
  EditButton,
  List,
  ShowButton,
  useTable,
} from '@refinedev/antd';
import {
  BaseKey,
  BaseRecord,
  IResourceComponentsProps,
  useCustomMutation,
  useInvalidate,
  useTranslate,
} from '@refinedev/core';
import { Button, Form, Input, Popconfirm, Space, Table } from 'antd';
import React, { useEffect } from 'react';
import { UserType } from 'src/graphql-data-provider/utils/graphQlTypes';
import { handleServerSideProps } from '../../src/utils/serverSideProps';
import { textSorter } from '../../src/utils/tableSorters';

interface IVenue {
  venueName: string;
}

export const VenuesList: React.FC<IResourceComponentsProps> = () => {
  const translate = useTranslate();
  const { mutate: deleteMutation, isLoading: isDeleting } = useCustomMutation();
  const invalidate = useInvalidate();

  const { tableProps, searchFormProps } = useTable<IVenue>({
    resource: 'venue',

    pagination: {
      mode: 'client',
    },

    permanentFilter: [
      {
        field: 'userType',
        operator: 'eq',
        value: UserType.VENUE,
      },
    ],
    // @ts-ignore
    onSearch: (values: any) => [
      {
        field: 'venueSearchName',
        operator: 'contains',
        value: values?.venueSearchName?.toLowerCase(),
      },
    ],
  });

  useEffect(() => {
    searchFormProps.form?.resetFields();
    searchFormProps.form?.submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteVenueMutation = `
  mutation DeleteVenue($id: ID!, $token: String!) {
    deleteVenue(input: {id: $id, token: $token}) {
      id
    }
  }
`;

  const deleteVenue = async (id: BaseKey | undefined) => {
    deleteMutation(
      {
        url: '',
        method: 'post',
        meta: {
          query: deleteVenueMutation,
          queryName: 'deleteVenue',
          variables: {
            id,
          },
        },
        errorNotification: () => ({
          message: `Something went wrong`,
          description: 'Error',
          type: 'error',
        }),
        successNotification: () => ({
          message: `Venue deleted succesfully`,
          description: 'Success',
          type: 'success',
        }),
        values: {},
      },
      {
        onSuccess: () =>
          invalidate({
            resource: 'venue',
            invalidates: ['list'],
          }),
      }
    );
  };

  return (
    <List headerButtons={<CreateButton />}>
      <Form {...searchFormProps} layout="inline">
        <Form.Item name="venueSearchName">
          <Input placeholder="Search by name" />
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
          dataIndex="venueName"
          title={translate('venue.fields.venueName')}
          sorter={textSorter<IVenue>('venueName')}
        />

        <Table.Column
          dataIndex="username"
          title={translate('venue.fields.username')}
          sorter={textSorter<IVenue>('username')}
        />

        <Table.Column
          title={translate('table.actions')}
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space style={{ alignItems: 'center' }}>
              <ShowButton hideText size="small" recordItemId={record.id} />
              <EditButton hideText size="small" recordItemId={record.id} />
              <Popconfirm
                title="Are you sure?"
                onConfirm={() => deleteVenue(record.id)}
                okText="Delete"
                cancelText="Cancel"
              >
                <Button
                  loading={isDeleting}
                  style={{ borderColor: '#ff4d4f', color: '#ff4d4f' }}
                  size="small"
                  icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
                />
              </Popconfirm>
            </Space>
          )}
        />
      </Table>
    </List>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/venue');
};

export default VenuesList;
