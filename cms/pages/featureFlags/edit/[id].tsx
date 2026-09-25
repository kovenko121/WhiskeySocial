import { DeleteOutlined } from '@ant-design/icons';
import { Edit, SaveButton, useForm } from '@refinedev/antd';
import { useCustomMutation, useTranslate } from '@refinedev/core';
import { Button, Checkbox, Form, Input, Popconfirm, Select } from 'antd';
import dayjs from 'dayjs';
import { GetServerSideProps } from 'next';
import { useParams } from 'next/navigation';
import router from 'next/router';
import { handleServerSideProps } from '../../../src/utils/serverSideProps';

const FeatureFlagsEdit = () => {
  const translate = useTranslate();
  const { id } = useParams();
  const { mutate: deleteMutation, isLoading: isDeleting } = useCustomMutation();

  const { formProps, saveButtonProps, queryResult } = useForm({
    redirect: 'show',
  });

  const currentAllowlist: string[] =
    queryResult?.data?.data?.allowedUserIds ?? [];

  const deleteFeatureFlagsMutation = `
  mutation DeleteFeatureFlags($id: ID!) {
    deleteFeatureFlags(input: {id: $id}) {
      id
    }
  }
`;

  const deleteFeatureFlags = async () => {
    deleteMutation(
      {
        url: '',
        method: 'post',
        meta: {
          query: deleteFeatureFlagsMutation,
          queryName: 'deleteFeatureFlags',
          variables: {
            id,
          },
        },
        errorNotification: () => ({
          message: `Something went wrong`,
          description: 'Error',
          type: 'error',
        }),
        successNotification: () => ({
          message: `Feature Flag deleted succesfully`,
          description: 'Success',
          type: 'success',
        }),
        values: {},
      },
      {
        onSuccess: () => {
          router.push(`/featureFlags`);
        },
      }
    );
  };

  return (
    <Edit
      headerButtonProps={{
        style: {
          padding: '16px',
        },
      }}
      headerButtons={() => (
        <>
          <Popconfirm
            title="Are you sure?"
            onConfirm={deleteFeatureFlags}
            okText="Delete"
            cancelText="Cancel"
          >
            <Button
              loading={isDeleting}
              style={{ borderColor: '#ff4d4f', color: '#ff4d4f' }}
            >
              <DeleteOutlined style={{ color: '#ff4d4f' }} /> Delete
            </Button>
          </Popconfirm>
          <SaveButton {...saveButtonProps} />
        </>
      )}
      saveButtonProps={saveButtonProps}
    >
      <Form
        {...formProps}
        layout="vertical"
        initialValues={{
          ...queryResult?.data?.data,
          startDate: dayjs(queryResult?.data?.data?.startDate),
          endDate: dayjs(queryResult?.data?.data?.endDate),
          value: queryResult?.data?.data?.value === 'true',
          allowedUserIds: currentAllowlist,
        }}
      >
        <Form.Item
          label={translate('featureFlags.fields.id')}
          name={['id']}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input readOnly disabled />
        </Form.Item>

        <Form.Item
          label={translate('featureFlags.fields.key')}
          name={['key']}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input readOnly disabled />
        </Form.Item>

        <Form.Item
          label={translate('featureFlags.fields.value')}
          name={['value']}
          valuePropName="checked"
          help="Global on/off for everyone. Ignored when an allowlist is set below."
        >
          <Checkbox>Enabled for all users</Checkbox>
        </Form.Item>

        <Form.Item
          label="Allowlist (optional)"
          name={['allowedUserIds']}
          help="Paste one or more User IDs (the Cognito sub — the same value shown as the username in the Cognito console). The flag is then ON only for these users and the global toggle is ignored. Leave empty to use the global toggle."
        >
          <Select
            mode="tags"
            allowClear
            tokenSeparators={[',', ' ', '\n', '\t']}
            placeholder="Paste User IDs (Cognito sub), Enter after each"
            open={false}
          />
        </Form.Item>
      </Form>
    </Edit>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/featureFlags');
};

export default FeatureFlagsEdit;
