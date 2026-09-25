import { Edit, useForm, useModalForm } from '@refinedev/antd';
import { useCustomMutation, useList, useShow } from '@refinedev/core';
import {
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Switch,
  Tag,
  Table,
  Card,
  Alert,
  message,
} from 'antd';
import { GetServerSideProps } from 'next';
import { useSession } from 'next-auth/react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useContext, useEffect, useMemo, useState } from 'react';

import {
  DeleteOutlined,
  KeyOutlined,
  PlusOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { useParams, useRouter } from 'next/navigation';
import { PermissionContext } from '@contexts/index';
import { handleServerSideProps } from 'src/utils/serverSideProps';
import { CMSUserRole, UserType } from '../../../src/graphql-data-provider/utils/graphQlTypes';
import { useCMSUserAdminActions } from '../../../src/hooks/useCMSUserAdminActions';

const deletedTextRGBA = 'rgba(255, 255, 255, 0.2)';
const addedTextColor = '#52c41a'; // Green for newly added brands

const CMSUserEdit = () => {
  const { role } = useContext(PermissionContext);
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const currentUserId = (session as any)?.user?.id;
  const {
    resetPassword,
    deleteUser,
    isResetting,
    isDeleting,
  } = useCMSUserAdminActions();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { mutate } = useCustomMutation();

  // WHI-112: Admins can reset passwords + delete users; BrandOwners can reset
  // passwords for their own brand users (enforced again server-side).
  const canResetPassword =
    role === CMSUserRole.Admin || role === CMSUserRole.BrandOwner;
  const canDelete = role === CMSUserRole.Admin;

  const handleDeleteUser = async () => {
    const ok = await deleteUser(id as string);
    if (ok) {
      router.push('/CMSUser');
    }
  };

  // State to track which brands are removed (grayed out)
  const [removedBrandIds, setRemovedBrandIds] = useState<string[]>([]);
  // State to track form brand IDs for triggering re-renders
  const [formBrandIds, setFormBrandIds] = useState<string[]>([]);

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    message.error(errorMessage);
  };

  // Query the CMSUser record by ID using useShow
  const { queryResult } = useShow({
    resource: 'CMSUser',
    id: id as string,
  });
  const { data: cmsUserQueryResponse } = queryResult;
  const cmsUserData = cmsUserQueryResponse?.data;

  // Brand assignments are now available directly from cmsUserData.brands.items

  // Get all available brands for the multi-select (filter for BRAND userType only)
  const { data: allBrandsData, isLoading: allBrandsLoading } = useList({
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
    pagination: {
      mode: 'off',
    },
  });

  // Modal form for adding brand assignments
  const {
    modalProps: addBrandsModalProps,
    formProps: addBrandsFormProps,
    show: showAddBrandsModal,
    close: closeAddBrandsModal,
  } = useModalForm({
    action: 'create', // We're creating new associations
    warnWhenUnsavedChanges: false,
  });

  // Use regular useForm for the form handling
  const { formProps } = useForm({
    resource: 'CMSUser',
    redirect: 'list',
    id: id as string,
    queryOptions: {
      enabled: false, // We handle the query manually
    },
    onMutationSuccess: () => {
      // Refresh data after successful update
      router.push('/CMSUser');
    },
  });

  // Handle form submission using Lambda function
  const handleFormSubmit = (values: any) => {
    setLoading(true);
    setError(null);

    mutate(
      {
        url: '',
        method: 'post',
        meta: {
          query: updateCMSUserMutation,
          queryName: 'updateCMSUserWithAuth',
          variables: {
            userId: cmsUserData?.id,
            email: values.email,
            role: values.role,
            isActive: values.isActive,
            brandIds: formBrandIds, // Current form state - Lambda handles the sync
          },
        },
        values: {},
      },
      {
        onSuccess: (data) => {
          if (data?.data?.success) {
            message.success('CMS User updated successfully!');
            router.push('/CMSUser');
          } else {
            let errorMessage = 'Failed to update CMS User';

            if (data?.data?.message) {
              errorMessage = data.data?.message;
            } else if (data?.data?.errors?.length > 0) {
              errorMessage = data.data.errors[0].message;
            }

            handleError(errorMessage);
          }
          setLoading(false);
        },
        onError: (err: any) => {
          handleError(err.message || 'An unexpected error occurred');
          setLoading(false);
        },
      }
    );
  };

  // Handle removing a brand (gray it out)
  const handleRemoveBrand = (brandUserId: string) => {
    setRemovedBrandIds((prev) => [...prev, brandUserId]);
    // Also remove from formBrandIds
    const updatedBrandIds = formBrandIds.filter(
      (brandId) => brandId !== brandUserId
    );
    setFormBrandIds(updatedBrandIds);
  };

  // Handle re-adding a brand (un-gray it)
  const handleReAddBrand = (brandUserId: string) => {
    setRemovedBrandIds((prev) =>
      prev.filter((brandId) => brandId !== brandUserId)
    );
    // Also add back to formBrandIds
    const updatedBrandIds = [...formBrandIds, brandUserId];
    setFormBrandIds(updatedBrandIds);
  };

  // Handle removing a pending (temporary) brand
  const handleRemovePendingBrand = (brandUserId: string) => {
    // Remove from formBrandIds state
    const updatedBrandIds = formBrandIds.filter(
      (brandIdToRemove) => brandIdToRemove !== brandUserId
    );
    setFormBrandIds(updatedBrandIds);
  };

  // Handle adding brands from modal
  const handleAddBrands = async () => {
    try {
      const modalValues: { brandIds?: string[] } =
        (await addBrandsFormProps.form?.validateFields()) || {};

      if (!modalValues?.brandIds || modalValues.brandIds.length === 0) {
        return;
      }

      // Get current brandIds from state (not form, since we manage this separately)
      const currentBrandIds = formBrandIds || [];

      // Add new brands to the array (avoiding duplicates)
      const newBrandIds = modalValues.brandIds.filter(
        (brandId: string) => !currentBrandIds.includes(brandId)
      );

      if (newBrandIds.length > 0) {
        const updatedBrandIds = [...currentBrandIds, ...newBrandIds];

        // Update state to trigger re-render (we don't store brandIds in form anymore)
        setFormBrandIds(updatedBrandIds);

        // Close modal and reset
        closeAddBrandsModal();
        addBrandsFormProps.form?.resetFields();
      } else {
        console.log('All selected brands were already assigned');
      }
    } catch (error) {
      console.error('Error adding brands:', error);
    }
  };

  // Memoize brand assignments to prevent unnecessary re-renders
  const allBrandAssignments = useMemo(
    () => cmsUserData?.brands?.items || [],
    [cmsUserData?.brands?.items]
  );

  // Calculate available brand options (exclude already assigned)
  const availableBrandOptions = useMemo(() => {
    if (allBrandsLoading || !allBrandsData?.data) return [];

    // Get current brand IDs from state (includes newly added ones)
    const currentBrandIds = formBrandIds || [];

    // Filter out brands that are already assigned or added
    const availableBrands = allBrandsData.data.filter(
      (brand: any) => !currentBrandIds.includes(brand.id)
    );

    // Map to Select options format
    return availableBrands.map((brand: any) => ({
      label: brand.name || brand.brandName || brand.username || 'Unknown Brand',
      value: brand.id,
    }));
  }, [allBrandsData, allBrandsLoading, formBrandIds]);

  // Enhanced table data source (combines actual assignments with newly added ones)
  const tableDataSource = useMemo(() => {
    const actualAssignments = allBrandAssignments || [];

    // Find newly added brand IDs (in state but not in actual assignments)
    const actualBrandIds = actualAssignments.map(
      (item: any) => item.brandUserId
    );
    const newBrandIds = formBrandIds.filter(
      (brandId: string) => !actualBrandIds.includes(brandId)
    );

    // Create temporary records for new assignments
    const newAssignments = newBrandIds.map((brandId: string) => {
      const brand = allBrandsData?.data?.find((b: any) => b.id === brandId);
      return {
        id: 'temp', // Simple temporary ID
        brandUserId: brandId,
        cmsUserId: cmsUserData?.id,
        assignedAt: new Date().toISOString(),
        assignedBy: 'Pending',
        brandUser: {
          id: brandId,
          brandName: brand?.name || brand?.brandName,
          username: brand?.username,
        },
        isTemporary: true, // Flag for styling
      };
    });

    // Combine actual and new assignments
    return [...actualAssignments, ...newAssignments];
  }, [allBrandAssignments, allBrandsData, formBrandIds, cmsUserData]);

  // Update form with data when loaded
  useEffect(() => {
    if (cmsUserData && formProps.form) {
      const brandIds = allBrandAssignments.map((item: any) => item.brandUserId);
      formProps.form.setFieldsValue({
        email: cmsUserData.email,
        role: cmsUserData.role,
        isActive: cmsUserData.isActive,
      });
      // Update state for table rendering (we don't store brandIds in the form anymore)
      setFormBrandIds(brandIds);
    }
  }, [cmsUserData, allBrandAssignments, formProps.form]);

  // Initialize modal form's brandIds field to prevent undefined/null issues
  // Note: refinedev/core v4 only supports default values on "Create" forms,
  // so we need to manually initialize the form field to avoid blank values in Select
  // The CMSUser.brandIds field can be null, which renders as gray squares in multi-select
  useEffect(() => {
    if (addBrandsFormProps.form) {
      addBrandsFormProps.form.setFieldsValue({
        brandIds: [], // Always initialize as empty array, never null
      });
    }
  }, [addBrandsFormProps.form]);

  const updateCMSUserMutation = `
    mutation UpdateCMSUserWithAuth($userId: String!, $email: String, $role: String, $isActive: Boolean, $brandIds: [String]) {
      updateCMSUserWithAuth(userId: $userId, email: $email, role: $role, isActive: $isActive, brandIds: $brandIds) {
        statusCode
        success
        message
        updatedUser {
          id
          email
          role
          isActive
          brands {
            items {
              id
              brandUserId
              cmsUserId
            }
          }
        }
      }
    }
  `;

  // Delete functionality is disabled as per requirements
  // Will be implemented in future updates

  return (
    <Edit
      headerButtonProps={{
        style: {
          padding: '16px',
        },
      }}
      canDelete={false}
      headerButtons={({ defaultButtons }) => (
        <>
          {defaultButtons}
          {canResetPassword && (
            <Popconfirm
              title="Reset password?"
              description={`Email a new temporary password to ${
                cmsUserData?.email || 'this user'
              }?`}
              okText="Reset"
              cancelText="Cancel"
              okButtonProps={{ loading: isResetting }}
              onConfirm={() => resetPassword(id as string)}
            >
              <Button icon={<KeyOutlined />} loading={isResetting}>
                Reset Password
              </Button>
            </Popconfirm>
          )}
          {canDelete && id !== currentUserId && (
            <Popconfirm
              title="Delete user?"
              description={`Permanently remove ${
                cmsUserData?.email || 'this user'
              } and revoke CMS access. This cannot be undone.`}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true, loading: isDeleting }}
              onConfirm={handleDeleteUser}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                loading={isDeleting}
              >
                Delete
              </Button>
            </Popconfirm>
          )}
        </>
      )}
      saveButtonProps={{
        loading,
        onClick: () => formProps.form?.submit(),
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

      <Form {...formProps} layout="vertical" onFinish={handleFormSubmit}>
        <Form.Item
          label="Email"
          name={['email']}
          rules={[
            {
              required: true,
            },
            {
              type: 'email',
              message: 'Please enter a valid email address',
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Role"
          name={['role']}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select>
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
          label="Is Active"
          name={['isActive']}
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>

      {/* Brand Assignments Table */}
      <Card
        title="Brand Assignments"
        style={{ marginTop: 24 }}
        extra={
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => {
              // Reset form to ensure clean state, especially to clear any null brandIds
              addBrandsFormProps.form?.resetFields();
              addBrandsFormProps.form?.setFieldsValue({
                brandIds: [], // Explicitly set as empty array to prevent null rendering
              });
              showAddBrandsModal();
            }}
          >
            Add Brands
          </Button>
        }
      >
        {tableDataSource.length > 0 ? (
          <Table
            dataSource={tableDataSource}
            loading={allBrandsLoading}
            rowKey={(record) => record.id || `temp-${record.brandUserId}`}
            pagination={false}
          >
            <Table.Column
              title="Brand Name"
              render={(_, brandRecord: any) => {
                const isRemoved = removedBrandIds.includes(
                  brandRecord.brandUserId
                );
                const { isTemporary } = brandRecord;

                let textStyle: React.CSSProperties = {};
                if (isRemoved) {
                  textStyle = { color: deletedTextRGBA };
                } else if (isTemporary) {
                  textStyle = { color: addedTextColor, fontStyle: 'italic' };
                }

                return (
                  <strong style={textStyle}>
                    {brandRecord.brandUser?.brandName ||
                      brandRecord.brandUser?.username ||
                      'N/A'}
                  </strong>
                );
              }}
            />
            <Table.Column
              title="Brand ID"
              dataIndex="brandUserId"
              render={(value, record: any) => {
                const isRemoved = removedBrandIds.includes(record.brandUserId);
                const { isTemporary } = record;

                let textStyle: React.CSSProperties = {};
                if (isRemoved) {
                  textStyle = { color: deletedTextRGBA };
                } else if (isTemporary) {
                  textStyle = { color: addedTextColor, fontStyle: 'italic' };
                }

                return <span style={textStyle}>{value}</span>;
              }}
            />
            <Table.Column
              title="Assigned At"
              dataIndex="assignedAt"
              render={(date: string, record: any) => {
                const isRemoved = removedBrandIds.includes(record.brandUserId);
                const { isTemporary } = record;

                let textStyle: React.CSSProperties = {};
                if (isRemoved) {
                  textStyle = { color: deletedTextRGBA };
                } else if (isTemporary) {
                  textStyle = { color: addedTextColor, fontStyle: 'italic' };
                }

                const displayDate = date
                  ? new Date(date).toLocaleDateString()
                  : 'N/A';

                return <span style={textStyle}>{displayDate}</span>;
              }}
            />
            <Table.Column
              title="Assigned By"
              dataIndex="assignedBy"
              render={(assignedBy: string, record: any) => {
                const isRemoved = removedBrandIds.includes(record.brandUserId);
                const { isTemporary } = record;

                let textStyle: React.CSSProperties = {};
                if (isRemoved) {
                  textStyle = { color: deletedTextRGBA };
                } else if (isTemporary) {
                  textStyle = { color: addedTextColor, fontStyle: 'italic' };
                }

                const displayValue = assignedBy || 'System';

                return <span style={textStyle}>{displayValue}</span>;
              }}
            />
            <Table.Column
              title="Actions"
              render={(_, brandRecord: any) => {
                const isRemoved = removedBrandIds.includes(
                  brandRecord.brandUserId
                );
                const { isTemporary } = brandRecord;

                // Temporary records show remove button with different styling
                if (isTemporary) {
                  return (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <Tag color="green" style={{ fontStyle: 'italic' }}>
                        Pending Save
                      </Tag>
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() =>
                          handleRemovePendingBrand(brandRecord.brandUserId)
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  );
                }

                return (
                  <div>
                    {!isRemoved ? (
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() =>
                          handleRemoveBrand(brandRecord.brandUserId)
                        }
                      >
                        Remove
                      </Button>
                    ) : (
                      <Button
                        type="text"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() =>
                          handleReAddBrand(brandRecord.brandUserId)
                        }
                        style={{ color: '#52c41a' }}
                      >
                        Re-add
                      </Button>
                    )}
                  </div>
                );
              }}
            />
          </Table>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
            No brand assignments yet. Click "Add Brands" to assign brands to
            this user.
          </div>
        )}
      </Card>

      {/* Add Brands Modal */}
      <Modal
        {...addBrandsModalProps}
        title="Add Brand Assignments"
        onCancel={handleAddBrands}
        footer={
          <>
            <Button onClick={closeAddBrandsModal}>Cancel</Button>
            <Button type="primary" onClick={handleAddBrands}>
              Add Selected Brands
            </Button>
          </>
        }
      >
        <Form {...addBrandsFormProps} layout="vertical">
          <Form.Item
            label="Select Brands to Add"
            name="brandIds"
            rules={[
              {
                required: true,
                message: 'Please select at least one brand',
              },
            ]}
          >
            <Select
              mode="multiple"
              showSearch
              placeholder="Search and select brands to add..."
              filterOption={(input, option) =>
                (option?.label ?? '')
                  .toString()
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={availableBrandOptions}
              loading={allBrandsLoading}
              notFoundContent={
                allBrandsLoading ? 'Loading...' : 'No available brands'
              }
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Edit>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/cmsuser');
};

export default CMSUserEdit;
