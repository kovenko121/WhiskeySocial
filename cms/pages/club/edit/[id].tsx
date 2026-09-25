import { GetServerSideProps } from 'next';

import { Edit, useForm } from '@refinedev/antd';
import { Form, Input, Switch, Space, Typography } from 'antd';
import { useContext, useEffect, useState, useMemo } from 'react';
import { PermissionContext } from '@contexts';
import { ImageUploadField } from '@components/image-upload-field';
import { getObject } from '../../../src/graphql-data-provider/utils/s3';
import { handleServerSideProps } from 'src/utils/serverSideProps';
import { CMSUserRole } from '../../../src/graphql-data-provider/utils/graphQlTypes';

const { TextArea } = Input;
const { Text } = Typography;

const ClubEdit = () => {
  const { role } = useContext(PermissionContext);
  const [coverPhoto, setCoverPhoto] = useState<string | undefined>();
  const [profilePicture, setProfilePicture] = useState<string | undefined>();

  const { formProps, saveButtonProps, queryResult } = useForm({
    resource: 'club',
    redirect: 'show',
  });

  const clubData = queryResult?.data?.data;

  // Watch the form's isPrivate value for conditional UI display
  const isPrivate = Form.useWatch('isPrivate', formProps.form);

  // Check if user can edit clubs
  const canEditClubs = useMemo(() => {
    return role === CMSUserRole.Admin;
  }, [role]);

  // S3 Image loading functions
  const getCoverPhoto = async (key: string) => {
    const result = await getObject(key);
    setCoverPhoto(result);
  };

  const getProfilePicture = async (key: string) => {
    const result = await getObject(key);
    setProfilePicture(result);
  };

  // Load images when club data is available
  useEffect(() => {
    if (clubData && clubData.coverPhoto) {
      getCoverPhoto(clubData.coverPhoto);
    }
    if (clubData && clubData.profilePicture) {
      getProfilePicture(clubData.profilePicture);
    }
  }, [clubData]);

  // If user can't edit, show access denied
  if (queryResult?.data && !canEditClubs) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>You don't have permission to edit clubs.</p>
      </div>
    );
  }

  return (
    <Edit saveButtonProps={saveButtonProps} title="Edit Club">
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Club Name"
          name="clubName"
          rules={[
            {
              required: true,
              message: 'Please enter club name',
            },
            {
              min: 3,
              message: 'Club name must be at least 3 characters',
            },
            {
              max: 50,
              message: 'Club name must not exceed 50 characters',
            },
          ]}
          help="3-50 characters"
        >
          <Input placeholder="Enter club name" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="clubDetails"
          rules={[
            {
              max: 500,
              message: 'Description must not exceed 500 characters',
            },
          ]}
        >
          <TextArea
            rows={4}
            placeholder="Describe your club..."
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item label="Privacy" name="isPrivate" valuePropName="checked">
          <Space direction="vertical">
            <Switch
              checkedChildren="Private"
              unCheckedChildren="Public"
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {isPrivate ? (
                <>Private: Only members can view and post</>
              ) : (
                <>Public: Anyone can view club info, members can post</>
              )}
            </Text>
          </Space>
        </Form.Item>

        <ImageUploadField
          name="coverPhoto"
          label="Cover Photo"
          currentImageUrl={coverPhoto}
          form={formProps.form!}
          onImageRemove={() => setCoverPhoto(undefined)}
          variant="rectangle"
          previewSize={{ width: 400, height: 200 }}
          removeConfirmTitle="Remove Cover Photo"
          removeConfirmDescription="Are you sure you want to remove this cover photo?"
        />

        <ImageUploadField
          name="profilePicture"
          label="Profile Picture"
          currentImageUrl={profilePicture}
          form={formProps.form!}
          onImageRemove={() => setProfilePicture(undefined)}
          variant="circle"
          previewSize={{ width: 200, height: 200 }}
          removeConfirmTitle="Remove Profile Picture"
          removeConfirmDescription="Are you sure you want to remove this profile picture?"
        />
      </Form>
    </Edit>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/club');
};

export default ClubEdit;
