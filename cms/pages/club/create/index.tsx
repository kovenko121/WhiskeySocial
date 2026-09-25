import { GetServerSideProps } from 'next';
import { Create, useForm, useSelect } from '@refinedev/antd';
import {
  Form,
  Input,
  Upload,
  UploadProps,
  message,
  Switch,
  Typography,
  Space,
  Select,
  Avatar,
} from 'antd';
import { useContext, useState } from 'react';
import { PermissionContext } from '@contexts';
import { UploadPictureMessage } from '@components/upload-picture-msg';
import { handleServerSideProps } from 'src/utils/serverSideProps';
import { CMSUserRole, UserType } from 'src/graphql-data-provider/utils/graphQlTypes';

const { TextArea } = Input;
const { Text } = Typography;

const ClubCreate = () => {
  const { role } = useContext(PermissionContext);
  const [isPrivate, setIsPrivate] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { formProps, saveButtonProps, formLoading } = useForm({
    resource: 'club',
    action: 'create',
    redirect: 'list',
    onMutationSuccess: () => {
      message.success('Club created successfully!');
      setIsSubmitting(false);
    },
    onMutationError: (error: any) => {
      message.error(error?.message || 'Failed to create club');
      setIsSubmitting(false);
    },
  });

  // User search select for initial admin
  const { selectProps: userSelectProps, queryResult } = useSelect({
    resource: 'user',
    optionLabel: 'username',
    optionValue: 'id',
    debounce: 500,
    filters: [
      {
        field: 'userType',
        operator: 'eq',
        value: UserType.PERSON,
      },
    ],
    onSearch: (value) => [
      {
        field: 'userType',
        operator: 'eq',
        value: UserType.PERSON,
      },
      {
        field: 'username',
        operator: 'contains',
        value,
      },
    ],
  });

  // Only allow Admin users to access this page
  if (role !== CMSUserRole.Admin) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>Only administrators can create clubs.</p>
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
    // Prevent double submission
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    // Prepare club data with searchName (lowercase for searching)
    const clubData = {
      ...values,
      searchName: values.clubName?.toLowerCase() || '',
      isPrivate: isPrivate,
      createdBy: values.initialAdminId, // Set createdBy to the initial club owner
      memberCount: 0, // Lambda function will update this to 1
      whiskeyCount: 0,
    };

    // The form will handle the submission through formProps
    formProps.onFinish?.(clubData);
  };

  return (
    <Create
      saveButtonProps={{
        ...saveButtonProps,
        disabled: saveButtonProps.disabled || formLoading || isSubmitting,
        loading: saveButtonProps.loading || isSubmitting,
      }}
      title="Create New Club"
    >
      <Form {...formProps} layout="vertical" onFinish={handleSubmit}>
        <h3>Basic Information</h3>

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

        <h3 style={{ marginTop: 24 }}>Images</h3>

        <Form.Item
          label="Cover Photo"
          name={['coverPhoto']}
          help="Recommended: 1200x400px, Max: 5MB, Formats: JPG, PNG, WEBP"
        >
          <Upload.Dragger name="coverPhoto" {...uploadProps}>
            <UploadPictureMessage />
          </Upload.Dragger>
        </Form.Item>

        <Form.Item
          label="Profile Picture"
          name={['profilePicture']}
          help="Recommended: 400x400px (square), Max: 2MB, Formats: JPG, PNG, WEBP"
        >
          <Upload.Dragger name="profilePicture" {...uploadProps}>
            <UploadPictureMessage />
          </Upload.Dragger>
        </Form.Item>

        <h3 style={{ marginTop: 24 }}>Settings</h3>

        <Form.Item label="Privacy">
          <Space direction="vertical">
            <Switch
              checked={isPrivate}
              onChange={setIsPrivate}
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

        <h3 style={{ marginTop: 24 }}>Initial Admin</h3>

        <Form.Item
          label="Initial Club Owner"
          name="initialAdminId"
          rules={[
            {
              required: true,
              message: 'Please select an initial club owner',
            },
          ]}
          help="This user will be the first owner of the club with full management permissions"
        >
          <Select
            {...userSelectProps}
            showSearch
            placeholder="Search for user by username or full name..."
            filterOption={false}
            loading={queryResult?.isLoading}
            optionLabelProp="label"
          >
            {queryResult?.data?.data?.map((user: any) => {
                // Get the display name based on user type
                const displayName = user.personFullName || user.venueName || user.brandName || user.username;

                return (
                  <Select.Option
                    key={user.id}
                    value={user.id}
                    label={`@${user.username}`}
                  >
                    <Space>
                      <Avatar
                        src={user.profilePicture?.key ?
                          `https://${user.profilePicture.bucket}.s3.${user.profilePicture.region}.amazonaws.com/${user.profilePicture.key}`
                          : undefined
                        }
                        size="small"
                      >
                        {user.username?.charAt(0).toUpperCase()}
                      </Avatar>
                      <span>
                        <strong>@{user.username}</strong>
                        {displayName !== user.username && (
                          <span style={{ color: '#666', marginLeft: 8 }}>({displayName})</span>
                        )}
                      </span>
                    </Space>
                  </Select.Option>
                );
              })}
          </Select>
        </Form.Item>

        <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: -16, marginBottom: 16 }}>
          Start typing to search for users by username or full name. The selected user will have full club owner permissions.
        </Text>
      </Form>
    </Create>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/club');
};

export default ClubCreate;
