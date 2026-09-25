import { Create, useForm } from '@refinedev/antd';
import { useCustomMutation, useTranslate, useList } from '@refinedev/core';
import { Form, Input, Select, Alert, message, Tag } from 'antd';
import { GetServerSideProps } from 'next';
import { useState, useMemo, useContext } from 'react';

import { handleServerSideProps } from '../../../src/utils/serverSideProps';
import { useSession } from 'next-auth/react';
import { PermissionContext } from '@contexts/index';
import { CMSUserRole, UserType } from '../../../src/graphql-data-provider/utils/graphQlTypes';

const BrandOwnerCreate = () => {
  const { role } = useContext(PermissionContext);
  const translate = useTranslate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { mutate } = useCustomMutation();

  // Query brands - filter for BRAND userType only to avoid null userType errors
  const { data: brandsData, isLoading: brandsLoading } = useList({
    resource: 'brand',
    filters: [
      {
        field: 'userType',
        operator: 'eq',
        value: UserType.BRAND,
      },
      {
        field: 'deleted',
        operator: 'eq',
        value: false,
      },
    ],
    pagination: { mode: 'off' },
  });

  // Prepare brand options for Select with multiple selection
  const brandOptions = useMemo(() => {
    if (brandsLoading || !brandsData?.data) return [];
    return brandsData.data.map((brand: any) => ({
      label: brand.name || brand.brandName || 'Unknown Brand',
      value: brand.id, // Use ID directly for Select component
    }));
  }, [brandsData, brandsLoading]);

  const createCMSUserMutation = `
    mutation CreateCMSUserWithAuth($email: String!, $role: CMSUserRole!, $brandId: String) {
      createCMSUserWithAuth(email: $email, role: $role, brandId: $brandId) {
        statusCode
        success
        message
        cmsUserId
        authId
      }
    }
  `;

  const handleSubmit = (values: any) => {
    setLoading(true);
    setError(null);

    mutate(
      {
        url: '',
        method: 'post',
        meta: {
          query: createCMSUserMutation,
          queryName: 'createCMSUserWithAuth',
          variables: {
            email: values.email,
            role: values.role,
            brandId: values.brandId,
          },
        },
        values: {},
      },
      {
        onSuccess: (data) => {
          if (data?.data?.success) {
            message.success(
              'CMS User created successfully! An invitation email has been sent.'
            );
            form.resetFields();
            window.location.href = '/CMSUser';
          } else {
            let errorMessage = 'Failed to create CMS User';

            if (data?.data?.message) {
              errorMessage = data.data?.message;
            } else if (data?.data?.errors?.length > 0) {
              errorMessage = data.data.errors[0].message;
            }

            setError(errorMessage);
            message.error(errorMessage);
          }
          setLoading(false);
        },
        onError: (err: any) => {
          const errorMessage = err.message || 'An unexpected error occurred';
          setError(errorMessage);
          message.error(errorMessage);
          setLoading(false);
        },
      }
    );
  };

  return (
    <Create
      saveButtonProps={{
        loading,
        onClick: () => form.submit(),
      }}
    >
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 16 }}
        />
      )}

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            {
              required: true,
              message: 'Please enter an email address',
            },
            {
              type: 'email',
              message: 'Please enter a valid email address',
            },
          ]}
        >
          <Input placeholder="Enter email address" />
        </Form.Item>

        <Form.Item
          label="Role"
          name="role"
          rules={[
            {
              required: true,
              message: 'Please select a role',
            },
          ]}
        >
          <Select placeholder="Select a role">
            {role === CMSUserRole.Admin && (
              <Select.Option value={CMSUserRole.Admin}>
                <Tag color="red">Admin</Tag>
              </Select.Option>
            )}
            <Select.Option value={CMSUserRole.BrandOwner}>
              <Tag color="blue">Brand Owner</Tag>
            </Select.Option>
            <Select.Option value={CMSUserRole.BrandEditor}>
              <Tag color="green">Brand Editor</Tag>
            </Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Brand"
          name="brandId"
          rules={[
            {
              required: true,
              message: 'Please select a brand',
            },
          ]}
          help="Select the brand this user will be associated with"
        >
          <Select
            showSearch
            placeholder="Search and select a brand..."
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={brandOptions}
            loading={brandsLoading}
            notFoundContent={brandsLoading ? 'Loading...' : 'No brands found'}
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Form>
    </Create>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/cmsuser');
};

export default BrandOwnerCreate;
