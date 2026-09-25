import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { getServerSession } from 'next-auth';

import { Edit, useForm } from '@refinedev/antd';
import {
  Form,
  Input,
  InputNumber,
  Upload,
  UploadProps,
  Image,
  Card,
  Typography,
  Button,
  Popconfirm,
  Tooltip,
} from 'antd';
import { useContext, useEffect, useState, useMemo } from 'react';
import { useTranslate } from '@refinedev/core';
import { PermissionContext } from '@contexts';
import { UploadPictureMessage } from '@components/upload-picture-msg';
import { DeleteOutlined } from '@ant-design/icons';
import { getObject } from '../../../src/graphql-data-provider/utils/s3';
import { authOptions } from '../../api/auth/[...nextauth]';
import { SoftDeleteButton } from '../components/SoftDeleteButton';
import { handleServerSideProps } from 'src/utils/serverSideProps';
import { useCognitoUserEmail } from '../../../src/hooks/useCognitoUserEmail';
import { CMSUserRole } from '../../../src/graphql-data-provider/utils/graphQlTypes';

const { TextArea } = Input;
const { Title } = Typography;

const BrandEdit = () => {
  const { role, brandUserIds } = useContext(PermissionContext);
  const [brandLogo, setBrandLogo] = useState<string | undefined>();
  const [coverPicture, setCoverPicture] = useState<string | undefined>();

  const { formProps, saveButtonProps, queryResult, onFinish } = useForm({
    resource: 'brand',
    redirect: 'show',
  });

  /**
   * Filter out null/undefined values from form submission.
   *
   * This is a workaround for an Amplify limitation. Amplify's @auth directive
   * only populates `nullAllowedFields` when a group has ALL CRUD operations
   * (create, read, update, delete). If you only grant read+update, the resolver
   * sets nullAllowedFields to an empty array, blocking any field from being set
   * to null - even though update permission is granted.
   *
   * There's no way to configure nullAllowedFields separately in the schema.
   * Amplify is a garbage tool that forces you to either over-provision permissions
   * or implement workarounds like this.
   *
   * By filtering out null values here, BrandOwner/BrandEditor can update brands
   * without needing full CRUD permissions on the User type.
   */
  const handleFinish = (values: any) => {
    const filteredValues = Object.fromEntries(
      Object.entries(values).filter(
        ([_, value]) => value !== null && value !== undefined
      )
    );
    onFinish(filteredValues);
  };

  const brandData = queryResult?.data?.data;

  // Fetch current owner's email from Cognito
  const {
    email: currentOwnerEmail,
    loading: ownerEmailLoading,
    error: ownerEmailError,
  } = useCognitoUserEmail(brandData?.owner);

  // Get brand images from S3
  const getBrandLogo = async (key: string) => {
    const result = await getObject(key);
    setBrandLogo(result);
  };

  const getCoverPicture = async (key: string) => {
    const result = await getObject(key);
    setCoverPicture(result);
  };

  // Check if user can edit this brand
  const canEdit = useMemo(() => {
    if (role === CMSUserRole.Admin) return true;
    if (
      (role === CMSUserRole.BrandOwner || role === CMSUserRole.BrandEditor) &&
      brandUserIds &&
      brandData?.id
    ) {
      return brandUserIds.includes(String(brandData.id));
    }
    return false;
  }, [role, brandUserIds, brandData?.id]);

  // Check if user can edit brand identity (username/name)
  const canEditBrandIdentity = useMemo(() => {
    if (role === CMSUserRole.Admin) return true;
    if (role === CMSUserRole.BrandOwner && brandUserIds && brandData?.id) {
      return brandUserIds.includes(String(brandData.id));
    }
    return false;
  }, [role, brandUserIds, brandData?.id]);

  // Upload properties for images
  const uploadProps: UploadProps = {
    maxCount: 1,
    listType: 'picture',
    accept: 'image/png, image/jpeg, image/jpg, image/webp',
  };

  // Handle image removal
  const handleRemoveBrandLogo = () => {
    setBrandLogo(undefined);
    // Set the form field to null to indicate removal
    formProps.form?.setFieldsValue({
      brandLogo: null,
    });
  };

  const handleRemoveCoverPicture = () => {
    setCoverPicture(undefined);
    // Set the form field to null to indicate removal
    formProps.form?.setFieldsValue({
      coverPicture: null,
    });
  };

  // Load images when brand data is available
  useEffect(() => {
    if (brandData && brandData.brandLogo) {
      getBrandLogo(brandData.brandLogo.key);
    }
    if (brandData && brandData.coverPicture) {
      getCoverPicture(brandData.coverPicture.key);
    }
  }, [brandData]);

  // If user can't edit, show access denied
  if (queryResult?.data && !canEdit) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>You don't have permission to edit this brand.</p>
      </div>
    );
  }

  return (
    <Edit
      saveButtonProps={saveButtonProps}
      headerButtons={() => (
        <>
          {role === CMSUserRole.Admin && brandData && brandData.id && (
            <SoftDeleteButton
              brandId={brandData.id}
              brandName={brandData.brandName || brandData.username}
            />
          )}
        </>
      )}
    >
      <Form {...formProps} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          label="Username"
          name="username"
          rules={[
            {
              required: true,
              message: 'Please enter username',
            },
          ]}
        >
          <Input disabled={!canEditBrandIdentity} />
        </Form.Item>

        <Form.Item
          label="Brand Name"
          name="brandName"
          rules={[
            {
              required: true,
              message: 'Please enter brand name',
            },
          ]}
        >
          <Input disabled={!canEditBrandIdentity} />
        </Form.Item>

        <Form.Item label="Brand Logo" name={['brandLogo']}>
          {brandLogo && (
            <Card
              style={{ marginBottom: 16 }}
              actions={[
                <Popconfirm
                  title="Remove Logo"
                  description="Are you sure you want to remove this logo?"
                  onConfirm={handleRemoveBrandLogo}
                  okText="Yes"
                  cancelText="No"
                  key="remove"
                >
                  <Button type="text" danger icon={<DeleteOutlined />}>
                    Remove Logo
                  </Button>
                </Popconfirm>,
              ]}
            >
              <Title level={5}>Current Logo</Title>
              <Image
                src={brandLogo}
                alt="Current Brand Logo"
                style={{ maxWidth: 200, maxHeight: 200, objectFit: 'contain' }}
              />
            </Card>
          )}
          <Upload.Dragger name="brandLogo" {...uploadProps}>
            <UploadPictureMessage />
          </Upload.Dragger>
        </Form.Item>

        <Form.Item label="Brand Cover Image" name={['coverPicture']}>
          {coverPicture && (
            <Card
              style={{ marginBottom: 16 }}
              actions={[
                <Popconfirm
                  title="Remove Cover Image"
                  description="Are you sure you want to remove this cover image?"
                  onConfirm={handleRemoveCoverPicture}
                  okText="Yes"
                  cancelText="No"
                  key="remove"
                >
                  <Button type="text" danger icon={<DeleteOutlined />}>
                    Remove Cover
                  </Button>
                </Popconfirm>,
              ]}
            >
              <Title level={5}>Current Cover Image</Title>
              <Image
                src={coverPicture}
                alt="Current Brand Cover"
                style={{ maxWidth: 400, maxHeight: 200, objectFit: 'cover' }}
              />
            </Card>
          )}
          <Upload.Dragger name="coverPicture" {...uploadProps}>
            <UploadPictureMessage />
          </Upload.Dragger>
        </Form.Item>

        <Form.Item
          label="Mobile App User Email"
          help="To change this email address, use the 'Transfer Mobile App Account' button on the brand details page. Note: This is separate from CMS Brand Owner access."
        >
          {ownerEmailLoading ? (
            <Input disabled placeholder="Loading..." />
          ) : ownerEmailError ? (
            <Tooltip title={ownerEmailError}>
              <Input disabled placeholder="Error loading email" />
            </Tooltip>
          ) : (
            <Input disabled value={currentOwnerEmail || 'Not available'} />
          )}
        </Form.Item>

        <Form.Item
          label="Website"
          name="brandWebsite"
          rules={[
            {
              type: 'url',
              message: 'Please enter a valid URL',
            },
          ]}
        >
          <Input placeholder="https://..." />
        </Form.Item>

        <Form.Item label="Country" name="brandCountry">
          <Input />
        </Form.Item>

        <Form.Item label="Founded Year" name="brandFoundedYear">
          <InputNumber
            min={1800}
            max={new Date().getFullYear()}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item label="Description" name="brandDescription">
          <TextArea rows={4} />
        </Form.Item>

        <Form.Item label="Brand Story" name="brandStory">
          <TextArea rows={6} />
        </Form.Item>
      </Form>
    </Edit>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/brand');
};

export default BrandEdit;
