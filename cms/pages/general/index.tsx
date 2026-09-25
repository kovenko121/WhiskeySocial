import { DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import { useCustomMutation, useList } from '@refinedev/core';
import { Button, Card, Form, Input, Space, Spin, Typography } from 'antd';
import { GetServerSideProps } from 'next';
import { useContext, useEffect, useState } from 'react';
import { PermissionContext } from '@contexts';
import { CMSUserRole } from 'src/graphql-data-provider/utils/graphQlTypes';
import { handleServerSideProps } from '../../src/utils/serverSideProps';

interface IAppConfig {
  id: string;
  key: string;
  value: string;
}

interface IGeneralSettingsFormValues {
  createPostPlaceholder?: string;
}

const { Title, Text } = Typography;

const DEFAULT_POST_PROMPT = 'What are you drinking today?';

const createAppConfigMutation = `
  mutation CreateAppConfig($input: CreateAppConfigInput!) {
    createAppConfig(input: $input) {
      id
      key
      value
    }
  }
`;

const updateAppConfigMutation = `
  mutation UpdateAppConfig($input: UpdateAppConfigInput!) {
    updateAppConfig(input: $input) {
      id
      key
      value
    }
  }
`;

const deleteAppConfigMutation = `
  mutation DeleteAppConfig($input: DeleteAppConfigInput!) {
    deleteAppConfig(input: $input) {
      id
    }
  }
`;

const GeneralSettings = () => {
  const { role } = useContext(PermissionContext);
  const [form] = Form.useForm();
  const [existingRecordId, setExistingRecordId] = useState<string | null>(null);

  const { data: appConfigData, isLoading } = useList<IAppConfig>({
    resource: 'appConfig',
    pagination: { mode: 'off' },
  });

  const { mutate: saveMutation, isLoading: isSaving } = useCustomMutation<IAppConfig>();

  useEffect(() => {
    if (appConfigData?.data) {
      const postPromptRecord = appConfigData.data.find(
        (item) => item.key === 'createPostPlaceholder'
      );
      if (postPromptRecord) {
        setExistingRecordId(postPromptRecord.id);
        form.setFieldsValue({
          createPostPlaceholder: postPromptRecord.value,
        });
      }
    }
  }, [appConfigData, form]);

  const deleteRecord = (callbacks?: { onSuccess?: () => void }) => {
    saveMutation(
      {
        url: '',
        method: 'post',
        meta: {
          query: deleteAppConfigMutation,
          queryName: 'deleteAppConfig',
          variables: {
            input: { id: existingRecordId },
          },
        },
        errorNotification: () => ({
          message: 'Something went wrong',
          description: 'Error',
          type: 'error',
        }),
        successNotification: () => ({
          message: 'Post prompt text reset to default',
          description: 'Success',
          type: 'success',
        }),
        values: {},
      },
      {
        onSuccess: () => {
          setExistingRecordId(null);
          callbacks?.onSuccess?.();
        },
      }
    );
  };

  const onSave = (values: IGeneralSettingsFormValues) => {
    const value = values.createPostPlaceholder?.trim() || '';

    // Empty value: delete the existing record or no-op
    if (!value) {
      if (existingRecordId) {
        deleteRecord();
      }
      return;
    }

    // Non-empty value: create or update
    const isUpdate = existingRecordId !== null;
    const query = isUpdate ? updateAppConfigMutation : createAppConfigMutation;
    const queryName = isUpdate ? 'updateAppConfig' : 'createAppConfig';
    const variables = isUpdate
      ? {
          input: {
            id: existingRecordId,
            key: 'createPostPlaceholder',
            value,
          },
        }
      : {
          input: {
            key: 'createPostPlaceholder',
            value,
          },
        };

    saveMutation(
      {
        url: '',
        method: 'post',
        meta: {
          query,
          queryName,
          variables,
        },
        errorNotification: () => ({
          message: 'Something went wrong',
          description: 'Error',
          type: 'error',
        }),
        successNotification: () => ({
          message: 'Settings saved successfully',
          description: 'Success',
          type: 'success',
        }),
        values: {},
      },
      {
        onSuccess: (data) => {
          if (!isUpdate && data?.data?.id) {
            setExistingRecordId(data.data.id);
          }
        },
      }
    );
  };

  const onResetToDefault = () => {
    if (existingRecordId) {
      deleteRecord({
        onSuccess: () => {
          form.setFieldsValue({ createPostPlaceholder: '' });
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (role !== CMSUserRole.Admin) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>Only administrators can access general settings.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>General Settings</Title>
      <Card>
        <Form form={form} layout="vertical" onFinish={onSave}>
          <Title level={5}>Post Prompt Text</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            This text appears as the placeholder in the post creation button on
            the home screen. Leave empty to use the default: &quot;
            {DEFAULT_POST_PROMPT}&quot;
          </Text>

          <Form.Item
            label="Create Post Placeholder"
            name="createPostPlaceholder"
            rules={[
              {
                max: 100,
                message: 'Post prompt text must be 100 characters or less',
              },
            ]}
          >
            <Input
              placeholder={DEFAULT_POST_PROMPT}
              maxLength={100}
              showCount
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={isSaving}
                icon={<SaveOutlined />}
              >
                Save
              </Button>
              <Button
                danger
                disabled={!existingRecordId || isSaving}
                loading={isSaving}
                icon={<DeleteOutlined />}
                onClick={onResetToDefault}
              >
                Reset to Default
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/general');
};

export default GeneralSettings;
