import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { getServerSession } from 'next-auth';
import { useRouter } from 'next/router';

import { ClearOutlined, SearchOutlined, PlusOutlined } from '@ant-design/icons';
import {
  CreateButton,
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
import React, { useContext, useEffect } from 'react';
import { PermissionContext } from '@contexts';
import { CMSUserRole, UserType } from 'src/graphql-data-provider/utils/graphQlTypes';
import { authOptions } from '../api/auth/[...nextauth]';
import { RestoreBrandButton } from './components/RestoreBrandButton';
import { formatUrlToString } from '../../src/utils/stringHelpers';
import { handleServerSideProps } from 'src/utils/serverSideProps';
import { dateSorter, numberSorter, textSorter } from 'src/utils/tableSorters';

interface IBrand {
  id: string;
  username: string;
  brandName?: string;
  brandDescription?: string;
  brandWebsite?: string;
  brandCountry?: string;
  brandFoundedYear?: number;
  brandStory?: string;
  brandLogo?: {
    bucket: string;
    key: string;
    region: string;
  };
  coverPicture?: {
    bucket: string;
    key: string;
    region: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const BrandsList: React.FC<IResourceComponentsProps> = () => {
  const translate = useTranslate();
  const router = useRouter();
  const { role, brandUserIds } = useContext(PermissionContext);

  // Build permanent filters based on user role
  const permanentFilters: CrudFilters = [
    {
      field: 'userType',
      operator: 'eq',
      value: UserType.BRAND,
    },
  ];

  if (
    (role === CMSUserRole.BrandOwner || role === CMSUserRole.BrandEditor) &&
    brandUserIds &&
    brandUserIds.length > 0
  ) {
    // Add filters to only show brands the user owns/edits
    permanentFilters.push({
      operator: 'or',
      value: brandUserIds.map((id) => ({
        field: 'id',
        operator: 'eq',
        value: id,
      })),
    });
  }

  const { tableProps, searchFormProps } = useTable<IBrand>({
    resource: 'brand',
    pagination: {
      mode: 'client',
    },
    permanentFilter: permanentFilters,
    onSearch: (values: any) => {
      const filters: CrudFilters = [];

      // Add search filter for brandSearchName (normalized field like whiskey's fullName)
      filters.push({
        field: 'brandSearchName',
        operator: 'contains',
        value: values?.brandName?.toLowerCase(),
      });

      // Add filter for deleted field - default to false to show only active brands
      filters.push({
        field: 'deleted',
        operator: 'eq',
        value: values?.deleted !== undefined ? values.deleted : false,
      });

      return filters;
    },
  });

  useEffect(() => {
    searchFormProps.form?.resetFields();
    searchFormProps.form?.submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <List
      headerButtons={
        role === CMSUserRole.Admin ? (
          <CreateButton
            resource="brand"
            icon={<PlusOutlined />}
            onClick={() => router.push('/brand/create')}
          >
            Create Brand
          </CreateButton>
        ) : undefined
      }
    >
      <Form {...searchFormProps} layout="inline">
        <Form.Item name="brandName">
          <Input
            placeholder="Search by brand name"
            prefix={<SearchOutlined />}
            allowClear
          />
        </Form.Item>
        <Form.Item>
          <Button htmlType="submit" type="primary">
            Search
          </Button>
        </Form.Item>
        <Form.Item>
          <Button
            onClick={() => {
              searchFormProps.form?.setFieldsValue({
                brandName: undefined,
                deleted: false,
              });
              searchFormProps.form?.resetFields();
              searchFormProps.form?.submit();
            }}
            icon={<ClearOutlined />}
          >
            Clear
          </Button>
        </Form.Item>
        {role === CMSUserRole.Admin && (
          <Form.Item name="deleted">
            <Switch
              checkedChildren="show deleted"
              unCheckedChildren="show deleted"
              onChange={(checked: boolean) => {
                if (checked) {
                  // When checked, show ONLY deleted brands
                  searchFormProps.form?.setFieldValue('deleted', true);
                } else {
                  // When unchecked, explicitly set to false to show only active brands
                  searchFormProps.form?.setFieldValue('deleted', false);
                }

                searchFormProps.form?.submit();
              }}
            />
          </Form.Item>
        )}
      </Form>

      <Table {...tableProps} rowKey="id" style={{ marginTop: 16 }}>
        <Table.Column
          dataIndex="brandName"
          title="Brand Name"
          sorter={textSorter<IBrand>('brandName')}
          defaultSortOrder="ascend"
          render={(value) => <strong>{value || 'Unnamed Brand'}</strong>}
        />
        <Table.Column
          dataIndex="username"
          title="Username"
          sorter={textSorter<IBrand>('username')}
          render={(value) => value || '-'}
        />
        <Table.Column
          dataIndex="brandCountry"
          title="Country"
          sorter={textSorter<IBrand>('brandCountry')}
          render={(value) => value || '-'}
        />
        <Table.Column
          dataIndex="brandFoundedYear"
          title="Founded"
          sorter={numberSorter<IBrand>('brandFoundedYear')}
          render={(value) => value || '-'}
        />
        <Table.Column
          dataIndex="brandWebsite"
          title="Website"
          sorter={textSorter<IBrand>('brandWebsite')}
          render={(value) => formatUrlToString(value)}
        />
        <Table.Column
          dataIndex="brandDescription"
          title="Description"
          ellipsis
          render={(value) => value || '-'}
        />
        <Table.Column
          dataIndex="brandStory"
          title="Story"
          ellipsis
          width={200}
          render={(value) =>
            value ? (
              <span title={value}>
                {value.length > 50 ? `${value.substring(0, 50)}...` : value}
              </span>
            ) : (
              '-'
            )
          }
        />
        <Table.Column
          dataIndex="createdAt"
          title="Created"
          sorter={dateSorter<IBrand>('createdAt')}
          render={(value) =>
            value ? new Date(value).toLocaleDateString() : '-'
          }
        />
        <Table.Column
          title={translate('table.actions')}
          dataIndex="actions"
          render={(_, record: BaseRecord) => {
            const showDeleted = searchFormProps.form?.getFieldValue('deleted');
            // Show restore button only if we're in deleted view AND record is actually deleted
            const shouldShowRestore = showDeleted && record.deleted === true;

            return (
              <Space style={{ alignItems: 'center' }}>
                {shouldShowRestore && record.id ? (
                  <RestoreBrandButton
                    brandId={record.id}
                    brandName={record.brandName || record.username}
                  />
                ) : (
                  <>
                    <ShowButton
                      hideText
                      size="small"
                      recordItemId={record.id}
                      resource="brand"
                    />
                    {role !== CMSUserRole.BrandEditor && (
                      <EditButton
                        hideText
                        size="small"
                        recordItemId={record.id}
                        resource="brand"
                      />
                    )}
                  </>
                )}
              </Space>
            );
          }}
        />
      </Table>
    </List>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/brand');
};

export default BrandsList;
