import { GetServerSideProps } from 'next';

import { ClearOutlined, SearchOutlined } from '@ant-design/icons';
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
  CrudFilters,
  IResourceComponentsProps,
  useTranslate,
} from '@refinedev/core';
import { Button, Form, Input, Space, Switch, Table } from 'antd';
import React, { useEffect } from 'react';
import { handleServerSideProps } from '../../src/utils/serverSideProps';
import { booleanSorter, textSorter } from '../../src/utils/tableSorters';

interface IUserReward {
  redeemed: boolean;
  email: string;
  fullName: string;
  city: string;
  state: string;
  size: string;
  model: string;
  updatedAt: string;
  trackingCode: string;
  service: string;
  id: string;
  owner: string;
  userId: string;
  address: string;
  zipCode: string;
  score: number;
  rewardId: string;
  lastScoreUpdate: string;
  isCompleted: boolean;
  isAlreadyViewed: boolean;
}

export const UserRewardList: React.FC<IResourceComponentsProps> = () => {
  const translate = useTranslate();
  const { tableProps, searchFormProps } = useTable<IUserReward>({
    resource: 'userReward',
    pagination: {
      mode: 'client',
    },
    onSearch: (values: any) => {
      let filters: CrudFilters = [];
      console.log('onSearch has fired with these values', values);

      // Add search filter for email or fullName using OR
      // Always push to ensure query retriggers, but handle empty/undefined to avoid filtering nulls
      filters.push({
        operator: 'or',
        value: [
          {
            field: 'email',
            operator: 'contains',
            value: values.search,
          },
          {
            field: 'fullName',
            operator: 'contains',
            value: values.search,
          },
        ],
      });

      // Add filter for isRedeemed switch - always push to ensure query retriggers
      filters.push({
        field: 'isRedeemed',
        operator: 'eq',
        value: values?.isRedeemed,
      });

      console.log('this is the filters array being returned:', { filters });
      return filters;
    },
  });

  useEffect(() => {
    searchFormProps.form?.resetFields();
    searchFormProps.form?.submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <List>
      <Form {...searchFormProps} layout="inline">
        <Form.Item name="search">
          <Input placeholder="Search by email or name" />
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

        <Form.Item name="isRedeemed">
          <Switch
            checkedChildren="redeemed"
            unCheckedChildren="redeemed"
            onChange={(checked: boolean) => {
              searchFormProps.form?.setFieldValue('isRedeemed', checked ? true : undefined);

              searchFormProps.form?.submit();
            }}
          />
        </Form.Item>

        <Button
          style={{ marginLeft: 5 }}
          onClick={() => {
            searchFormProps.form?.setFieldsValue({
              search: undefined,
              isRedeemed: undefined,
            });
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
          dataIndex="isRedeemed"
          title={translate('userReward.fields.redeemed')}
          sorter={booleanSorter<IUserReward>('isRedeemed')}
          render={(value: boolean) => (
            <BooleanField
              trueIcon={<TrueIcon />}
              falseIcon={<FalseIcon />}
              value={value}
            />
          )}
        />

        <Table.Column
          dataIndex="email"
          title={translate('userReward.fields.email')}
          sorter={textSorter<IUserReward>('email')}
        />

        <Table.Column
          dataIndex="fullName"
          title={translate('userReward.fields.fullName')}
          sorter={textSorter<IUserReward>('fullName')}
        />

        <Table.Column
          dataIndex="city"
          title={translate('userReward.fields.city')}
          sorter={textSorter<IUserReward>('city')}
        />

        <Table.Column
          dataIndex="state"
          title={translate('userReward.fields.state')}
          sorter={textSorter<IUserReward>('state')}
        />

        <Table.Column
          dataIndex="size"
          title={translate('userReward.fields.size')}
          sorter={textSorter<IUserReward>('size')}
        />

        <Table.Column
          dataIndex="model"
          title={translate('userReward.fields.model')}
          sorter={textSorter<IUserReward>('model')}
        />

        <Table.Column
          dataIndex="trackingCode"
          title={translate('userReward.fields.trackingCode')}
          sorter={textSorter<IUserReward>('trackingCode')}
        />

        <Table.Column
          dataIndex="service"
          title={translate('userReward.fields.service')}
          sorter={textSorter<IUserReward>('service')}
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
  return handleServerSideProps(context, '/userReward');
};

export default UserRewardList;
