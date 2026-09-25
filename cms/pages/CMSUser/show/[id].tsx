import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { getServerSession } from 'next-auth';
import {
  DeleteButton,
  EditButton,
  Show,
  ShowButton,
  TextField,
} from '@refinedev/antd';
import { useShow, useCustomMutation, useNotification } from '@refinedev/core';
import {
  Tag,
  Descriptions,
  Card,
  Space,
  Table,
  Spin,
  Button,
  Popconfirm,
} from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useContext } from 'react';
import { PermissionContext } from '@contexts';
import { authOptions } from '../../api/auth/[...nextauth]';
import { handleServerSideProps } from 'src/utils/serverSideProps';
import { CMSUserRole } from '../../../src/graphql-data-provider/utils/graphQlTypes';

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
        bio?: string;
      };
      assignedAt: string;
      assignedBy?: string;
    }>;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const BrandOwnerShow = () => {
  const { queryResult } = useShow<CMSUser>({
    resource: 'CMSUser',
  });
  const { data, isLoading } = queryResult;
  const record = data?.data;

  const { open } = useNotification();
  const { mutate: deleteBrandAssignment } = useCustomMutation();
  const { role } = useContext(PermissionContext);

  const getRoleColor = (userRole?: CMSUserRole) => {
    switch (userRole) {
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

  const deleteCMSUserBrandAssignment = (CMSUserBrandId: string) => {
    deleteBrandAssignment(
      {
        url: '',
        method: 'post',
        meta: {
          query: `
            mutation DeleteCMSUserBrand($input: DeleteCMSUserBrandInput!) {
              deleteCMSUserBrand(input: $input) {
                id
              }
            }
          `,
          queryName: 'deleteCMSUserBrand',
          variables: {
            input: {
              id: CMSUserBrandId,
            },
          },
        },
        values: {},
      },
      {
        onSuccess: () => {
          open?.({
            type: 'success',
            message: 'Brand assignment removed successfully',
          });
          queryResult.refetch();
        },
        onError: (error: any) => {
          open?.({
            type: 'error',
            message: 'Failed to remove brand assignment',
            description: error.message,
          });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div
        style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Show
      isLoading={isLoading}
      headerButtons={({ editButtonProps, deleteButtonProps }) => (
        <>
          {editButtonProps && <EditButton {...editButtonProps} />}
          {deleteButtonProps && <DeleteButton {...deleteButtonProps} />}
        </>
      )}
    >
      {/* Brand Owner Information */}
      <Card title="Brand Owner Information" style={{ marginBottom: 24 }}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Email">
            <strong>{record?.email || 'N/A'}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Role">
            <Tag color={getRoleColor(record?.role)}>
              {record?.role || 'N/A'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={record?.isActive ? 'green' : 'red'}>
              {record?.isActive ? 'Active' : 'Inactive'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Owner ID">
            <TextField value={record?.id} />
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* All Brand Assignments for this Owner */}
      <Card
        title="All Brand Assignments for this Owner"
        style={{ marginBottom: 24 }}
      >
        <Table
          dataSource={record?.brands?.items || []}
          loading={isLoading}
          rowKey="id"
          pagination={false}
        >
          <Table.Column
            title="Brand"
            dataIndex={['brandUser', 'brandName']}
            render={(brandName: string, cmsUserRecord: any) =>
              brandName || cmsUserRecord.brandUser?.username || 'N/A'
            }
          />
          <Table.Column
            title="Assigned At"
            dataIndex="assignedAt"
            render={(date: string) =>
              date ? new Date(date).toLocaleDateString() : 'N/A'
            }
          />
          <Table.Column
            title="Assigned By"
            dataIndex="assignedBy"
            render={(assignedBy: string) => assignedBy || 'System'}
          />
          <Table.Column
            title="Actions"
            dataIndex="actions"
            render={(_, cmsUserData: any) => (
              <Space>
                <ShowButton
                  hideText
                  size="small"
                  recordItemId={cmsUserData.brandUserId}
                  resource="brand"
                />
                {role === CMSUserRole.Admin && (
                  <Popconfirm
                    title="Remove Brand from User"
                    description="Are you sure you want to remove this brand from this user?"
                    onConfirm={() =>
                      deleteCMSUserBrandAssignment(cmsUserData.id)
                    }
                    okText="Yes"
                    cancelText="No"
                    okButtonProps={{ danger: true }}
                  >
                    <Button
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      title="Remove Assignment"
                    />
                  </Popconfirm>
                )}
              </Space>
            )}
          />
        </Table>
      </Card>

      {/* System Information */}
      <Card title="System Information">
        <Descriptions column={2} bordered>
          <Descriptions.Item label="User ID">
            <TextField value={record?.id} />
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {record?.createdAt
              ? new Date(record.createdAt).toLocaleString()
              : 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Updated At" span={2}>
            {record?.updatedAt
              ? new Date(record.updatedAt).toLocaleString()
              : 'N/A'}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </Show>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/cmsuser');
};

export default BrandOwnerShow;
