import { GetServerSideProps } from 'next';

import {
  ClearOutlined,
  DeleteOutlined,
  KeyOutlined,
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
  BaseRecord,
  IResourceComponentsProps,
  useTranslate,
} from '@refinedev/core';
import { Button, Form, Input, Popconfirm, Space, Table, Tag } from 'antd';
import { useSession } from 'next-auth/react';
import React, { useContext, useEffect } from 'react';
import { handleServerSideProps } from '../../src/utils/serverSideProps';
import { CMSUserRole } from '../../src/graphql-data-provider/utils/graphQlTypes';
import { PermissionContext } from '@contexts/index';
import { useCMSUserAdminActions } from '../../src/hooks/useCMSUserAdminActions';
import { booleanSorter, dateSorter, textSorter } from '../../src/utils/tableSorters';

interface CMSUser {
  id: string;
  authId?: string;
  email: string;
  role: CMSUserRole;
  brandIds?: string[];
  brands?: {
    items: Array<{
      id: string;
      brandUserId: string;
      brandUser?: {
        id: string;
        username?: string;
        brandName?: string;
        brandSearchName?: string;
        bio?: string | null;
      };
      assignedAt: string;
      assignedBy?: string | null;
    }>;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const BrandOwnersList: React.FC<IResourceComponentsProps> = () => {
  const translate = useTranslate();
  const { role } = useContext(PermissionContext);
  const { data: session } = useSession();
  const currentUserId = (session as any)?.user?.id;
  const { resetPassword, deleteUser, isResetting, isDeleting } =
    useCMSUserAdminActions();

  const { tableProps, searchFormProps, tableQueryResult } = useTable<CMSUser>({
    resource: 'CMSUser',
    pagination: {
      mode: 'client',
    },
    // @ts-ignore
    onSearch: (values: any) => [
      {
        field: 'email',
        operator: 'contains',
        value: values?.email?.toLowerCase(),
      },
    ],
  });

  useEffect(() => {
    searchFormProps.form?.resetFields();
    searchFormProps.form?.submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // WHI-112: Admins can reset passwords + delete users; BrandOwners can reset
  // passwords for their own brand users (enforced again server-side).
  const canResetPassword =
    role === CMSUserRole.Admin || role === CMSUserRole.BrandOwner;
  const canDelete = role === CMSUserRole.Admin;

  const handleDelete = async (userId: string) => {
    const ok = await deleteUser(userId);
    if (ok) {
      tableQueryResult?.refetch();
    }
  };

  const getRoleColor = (role: CMSUserRole) => {
    switch (role) {
      case CMSUserRole.Admin:
        return 'red';
      case CMSUserRole.BrandOwner:
        return 'blue';
      case CMSUserRole.BrandEditor:
        return 'green';
      default:
        return 'default';
    }
  };

  const formatBrands = (user: CMSUser): string => {
    if (!user.brands?.items || user.brands.items.length === 0) {
      return 'No brands assigned';
    }

    return user.brands.items
      .map(
        (brand) =>
          brand.brandUser?.brandName || brand.brandUser?.username || 'Unknown'
      )
      .join(', ');
  };

  return (
    <List headerButtons={<CreateButton />}>
      <Form {...searchFormProps} layout="inline">
        <Form.Item name="email">
          <Input placeholder="Search by email" />
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
          dataIndex="email"
          title="Email"
          sorter={textSorter<CMSUser>('email')}
          render={(email: string) => email || 'N/A'}
        />

        <Table.Column
          dataIndex="role"
          title="Role"
          sorter={textSorter<CMSUser>('role')}
          render={(role: CMSUserRole) => (
            <Tag color={getRoleColor(role)}>{role || 'N/A'}</Tag>
          )}
        />

        <Table.Column
          dataIndex="isActive"
          title="Status"
          sorter={booleanSorter<CMSUser>('isActive')}
          render={(isActive: boolean) => (
            <Tag color={isActive ? 'green' : 'red'}>
              {isActive ? 'Active' : 'Inactive'}
            </Tag>
          )}
        />

        <Table.Column
          title="Brands"
          sorter={textSorter<CMSUser>(formatBrands)}
          render={(_, record: CMSUser) => formatBrands(record)}
        />

        <Table.Column
          dataIndex="createdAt"
          title="Created At"
          sorter={dateSorter<CMSUser>('createdAt')}
          render={(date: string) =>
            date ? new Date(date).toLocaleDateString() : 'N/A'
          }
        />

        <Table.Column
          title={translate('table.actions')}
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space style={{ alignItems: 'center' }}>
              <ShowButton hideText size="small" recordItemId={record.id} />
              <EditButton hideText size="small" recordItemId={record.id} />
              {canResetPassword && (
                <Popconfirm
                  title="Reset password?"
                  description={`Email a new temporary password to ${
                    (record as CMSUser).email || 'this user'
                  }?`}
                  okText="Reset"
                  cancelText="Cancel"
                  okButtonProps={{ loading: isResetting }}
                  onConfirm={() => resetPassword(record.id as string)}
                >
                  <Button
                    size="small"
                    icon={<KeyOutlined />}
                    title="Reset password"
                  />
                </Popconfirm>
              )}
              {canDelete && record.id !== currentUserId && (
                <Popconfirm
                  title="Delete user?"
                  description={`Permanently remove ${
                    (record as CMSUser).email || 'this user'
                  } and revoke CMS access. This cannot be undone.`}
                  okText="Delete"
                  cancelText="Cancel"
                  okButtonProps={{ danger: true, loading: isDeleting }}
                  onConfirm={() => handleDelete(record.id as string)}
                >
                  <Button
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    title="Delete user"
                  />
                </Popconfirm>
              )}
            </Space>
          )}
        />
      </Table>
    </List>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/cmsuser');
};

export default BrandOwnersList;
