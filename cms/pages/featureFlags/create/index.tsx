import { Create, useForm } from '@refinedev/antd';
import { useTranslate } from '@refinedev/core';
import { Checkbox, Form, Input, Select } from 'antd';
import { GetServerSideProps } from 'next';
import { handleServerSideProps } from '../../../src/utils/serverSideProps';

const FeatureFlagsCreate = () => {
  const translate = useTranslate();

  const { formProps, saveButtonProps } = useForm({
    resource: 'featureFlags',
    action: 'create',
    redirect: 'list',
  });

  const handleFinish = (values: any) => {
    // value is a String! in the schema; the create path does not coerce booleans,
    // so normalise here before submitting.
    formProps.onFinish?.({
      ...values,
      value: values.value ? 'true' : 'false',
      allowedUserIds: (values.allowedUserIds ?? []).map((id: string) =>
        id.trim()
      ),
    });
  };

  return (
    <Create saveButtonProps={saveButtonProps} title="Create Feature Flag">
      <Form
        {...formProps}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ value: false, allowedUserIds: [] }}
      >
        <Form.Item
          label={translate('featureFlags.fields.key')}
          name={['key']}
          rules={[{ required: true, message: 'Please enter a flag key' }]}
          help="The identifier the app reads, e.g. tastingPassport"
        >
          <Input placeholder="tastingPassport" />
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
    </Create>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/featureFlags');
};

export default FeatureFlagsCreate;
