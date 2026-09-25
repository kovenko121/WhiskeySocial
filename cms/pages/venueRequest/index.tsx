import { GetServerSideProps } from 'next';

import { DeleteButton, EditButton, List, ShowButton, useTable } from '@refinedev/antd';
import {
  BaseRecord,
  IResourceComponentsProps,
  useTranslate,
} from '@refinedev/core';
import { Form, Space, Switch, Table, Tag } from 'antd';
import React, { useEffect } from 'react';
import { handleServerSideProps } from '../../src/utils/serverSideProps';
import { VenueRequestStatus } from '../../src/graphql-data-provider/utils/graphQlTypes';
import { textSorter } from '../../src/utils/tableSorters';

interface IVenueRequest {
  id: string;
  email: string;
  fullName: string;
  venuePhone: string;
  venueId: string;
  venueName: string;
  username: string;
  venueAddressCountry: string;
  venueAddressCity: string;
  venueAddressStreet: string;
  venueAddressNumber: string;
  venueAddressState: string;
  status: string;
}

export const VenueRequestList: React.FC<IResourceComponentsProps> = () => {
  const translate = useTranslate();
  const { tableProps, searchFormProps } = useTable<IVenueRequest>({
    resource: 'venueRequest',
    pagination: {
      mode: 'client',
    },

    onSearch: (values: any) => [
      {
        field: 'status',
        operator: 'eq',
        value: values?.status,
      },
    ],
  });

  const getStatusColor = (status: VenueRequestStatus) => {
    switch (status) {
      case VenueRequestStatus.PENDING:
        return 'orange';
      case VenueRequestStatus.FINISHED:
        return 'green';
      default:
        return 'red';
    }
  };

  useEffect(() => {
    searchFormProps.form?.resetFields();
    searchFormProps.form?.submit();
    searchFormProps.form?.setFieldValue('status', VenueRequestStatus.PENDING);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <List>
      <Form {...searchFormProps}>
        <Form.Item name="status">
          <Switch
            checkedChildren="Pending"
            unCheckedChildren="All"
            onChange={(checked: boolean) => {
              if (checked) {
                searchFormProps.form?.setFieldValue('status', VenueRequestStatus.PENDING);
              } else {
                searchFormProps.form?.setFieldValue('status', undefined);
              }

              searchFormProps.form?.submit();
            }}
          />
        </Form.Item>
      </Form>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="status"
          title={translate('venueRequest.fields.status')}
          sorter={textSorter<IVenueRequest>('status')}
          render={(value: VenueRequestStatus) => (
            <Tag color={getStatusColor(value)}>{value}</Tag>
          )}
        />

        <Table.Column
          dataIndex="email"
          title={translate('venueRequest.fields.email')}
          sorter={textSorter<IVenueRequest>('email')}
        />

        <Table.Column
          dataIndex="fullName"
          title={translate('venueRequest.fields.fullName')}
          sorter={textSorter<IVenueRequest>('fullName')}
        />

        <Table.Column
          dataIndex="venuePhone"
          title={translate('venueRequest.fields.venuePhone')}
          sorter={textSorter<IVenueRequest>('venuePhone')}
        />

        <Table.Column
          dataIndex="venueAddressCity"
          title={translate('venueRequest.fields.venueAddressCity')}
          sorter={textSorter<IVenueRequest>('venueAddressCity')}
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
  return handleServerSideProps(context, '/venueRequest');
};

export default VenueRequestList;
