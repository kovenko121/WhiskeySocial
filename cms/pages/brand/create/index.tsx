import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { getServerSession } from 'next-auth';
import { Create, useForm } from '@refinedev/antd';
import { Form, Input, InputNumber, Upload, UploadProps } from 'antd';
import { useContext } from 'react';
import { PermissionContext } from '@contexts';
import { UploadPictureMessage } from '@components/upload-picture-msg';
import { EmailField } from '../../../src/components/form-fields/EmailField';
import { UserType } from 'src/graphql-data-provider/utils/graphQlTypes';
import { authOptions } from '../../api/auth/[...nextauth]';
import { handleServerSideProps } from 'src/utils/serverSideProps';

const { TextArea } = Input;

const BrandCreate = () => {
  const { role } = useContext(PermissionContext);

  const { formProps, saveButtonProps } = useForm({
    resource: 'brand',
    action: 'create',
    redirect: 'list',
    successNotification: () => ({
      message: 'Brand user created successfully',
      description: 'Success',
      type: 'success',
    }),
    errorNotification: (error: any) => {
      // Extract a user-friendly message from the error
      let errorMessage = 'Something went wrong';

      if (error?.message) {
        // Check for common error patterns and provide friendly messages
        const msg = error.message.toLowerCase();

        // Check username BEFORE email since "username" doesn't contain "email"
        // but we want to prioritize the more specific username error
        if (msg.includes('username') && msg.includes('exists')) {
          errorMessage = 'Username already exists. Please choose a different username.';
        } else if (msg.includes('mobile app email') && msg.includes('already in use')) {
          errorMessage = 'Mobile App Email is already in use by another account';
        } else if (
          msg.includes('cms brand owner email') &&
          msg.includes('already in use')
        ) {
          errorMessage =
            'CMS Brand Owner Email is already in use by another account';
        } else if (msg.includes('email') && msg.includes('exists')) {
          errorMessage = 'An account with this email already exists';
        } else if (msg.includes('network') || msg.includes('fetch')) {
          errorMessage = 'Network error. Please try again.';
        } else if (msg.includes('unauthorized') || msg.includes('permission')) {
          errorMessage = 'You do not have permission to perform this action';
        }
      }

      return {
        message: errorMessage,
        description: 'Error',
        type: 'error',
      };
    },
  });

  // Moving this below the the react hook so the conditional hooks role isn't broken
  // Only allow Admin users to access this page
  if (role !== 'Admin') {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>Only administrators can create brand users.</p>
      </div>
    );
  }

  // Upload properties for images
  const uploadProps: UploadProps = {
    maxCount: 1,
    listType: 'picture',
    accept: 'image/png, image/jpeg, image/jpg, image/webp',
  };

  const handleSubmit = (values: any) => {
    // Add userType field for brand
    const brandData = {
      ...values,
      userType: UserType.BRAND,
    };

    // The form will handle the submission through formProps
    formProps.onFinish?.(brandData);
  };

  return (
    <Create
      saveButtonProps={saveButtonProps}
      title="Create Brand User"
    >
      <Form {...formProps} layout="vertical" onFinish={handleSubmit}>
        <h3>Brand Account</h3>

        <Form.Item
          label="Username"
          name="username"
          rules={[
            {
              required: true,
              message: 'Please enter username',
            },
            {
              min: 3,
              message: 'Username must be at least 3 characters',
            },
            {
              pattern: /^[a-zA-Z0-9_]+$/,
              message:
                'Username can only contain letters, numbers, and underscores',
            },
          ]}
          help="This will be the brand's unique identifier for login"
        >
          <Input placeholder="Enter unique username (e.g., brand_name)" />
        </Form.Item>

        <h3 style={{ marginTop: 24 }}>Brand Information</h3>

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
          <Input placeholder="Enter brand name" />
        </Form.Item>

        <Form.Item label="Brand Logo" name={['brandLogo']}>
          <Upload.Dragger name="brandLogo" {...uploadProps}>
            <UploadPictureMessage />
          </Upload.Dragger>
        </Form.Item>

        <Form.Item label="Brand Cover Image" name={['coverPicture']}>
          <Upload.Dragger name="coverPicture" {...uploadProps}>
            <UploadPictureMessage />
          </Upload.Dragger>
        </Form.Item>

        <h3 style={{ marginTop: 24 }}>Email Configuration</h3>
        <p style={{ marginBottom: 16, color: '#666' }}>
          Configure email addresses for mobile app and/or CMS access.
        </p>

        <EmailField
          label="Mobile App Email"
          name="mobileEmail"
          required={false}
          placeholder="mobile-app@example.com"
          extra="Email for the brand's mobile app login. Can be changed later using 'Transfer Mobile App Account'."
        />

        <EmailField
          label="CMS Brand Owner Email"
          name="cmsEmail"
          required={false}
          placeholder="cms-owner@example.com"
          extra="Email for CMS brand owner access. This person will receive CMS login credentials to manage the brand."
        />

        <h3 style={{ marginTop: 24 }}>Additional Information</h3>

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
          <Input placeholder="https://www.example.com" />
        </Form.Item>

        <Form.Item label="Country" name="brandCountry">
          <Input placeholder="Enter country" />
        </Form.Item>

        <Form.Item label="Founded Year" name="brandFoundedYear">
          <InputNumber
            min={1800}
            max={new Date().getFullYear()}
            style={{ width: '100%' }}
            placeholder="Enter founding year"
          />
        </Form.Item>

        <Form.Item label="Description" name="brandDescription">
          <TextArea
            rows={4}
            placeholder="Brief description of the brand"
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item label="Brand Story" name="brandStory">
          <TextArea
            rows={6}
            placeholder="Tell the brand's story..."
            maxLength={2000}
            showCount
          />
        </Form.Item>
      </Form>
    </Create>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/brand');
};

export default BrandCreate;
