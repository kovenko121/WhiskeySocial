import { DeleteOutlined } from '@ant-design/icons';
import { CurrentImagePreview } from '@components/current-image-preview';
import { UploadPictureMessage } from '@components/upload-picture-msg';
import { Edit, SaveButton, useForm } from '@refinedev/antd';
import { useCustomMutation, useTranslate } from '@refinedev/core';
import {
  Button,
  DatePicker,
  Form,
  Input,
  Popconfirm,
  Select,
  Upload,
  UploadProps,
} from 'antd';
import dayjs from 'dayjs';
import moment from 'moment';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useParams } from 'next/navigation';
import router from 'next/router';
import { AdTypes } from 'src/graphql-data-provider/utils/selectTypes';
import { authOptions } from '../../api/auth/[...nextauth]';
import { handleServerSideProps } from 'src/utils/serverSideProps';

const AdCampaignEdit = () => {
  const translate = useTranslate();

  const { id } = useParams();
  const { mutate: deleteMutation, isLoading: isDeleting } = useCustomMutation();

  const props: UploadProps = {
    maxCount: 1,
    listType: 'picture',
    accept: 'image/png, image/jpeg, image/jpg, image/webp',
  };

  const { formProps, saveButtonProps, queryResult } = useForm({
    redirect: 'show',
  });

  // Undefined until the record loads; the saved S3Object until a new file is picked.
  const currentPicture = Form.useWatch('picture', formProps.form);

  const disabledBeforeDays = (current: any) =>
    current && current.isBefore(moment(), 'day');

  const disabledTodayAndBeforeDays = (current: any) =>
    current &&
    (current.isSame(moment(), 'day') ||
      current.isBefore(moment().startOf('day'), 'day'));

  const disabledDateTime = () => ({
    disabledHours: () => [
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
      21, 22, 23,
    ],
    disabledMinutes: () => [
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
      21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38,
      39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56,
      57, 58, 59,
    ],
    disabledSeconds: () => [
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
      21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38,
      39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56,
      57, 58, 59,
    ],
  });

  const deleteAdCampaignMutation = `
    mutation DeleteAdCampaign($id: ID!) {
      deleteAdCampaign(input: {id: $id}) {
        id
      }
    }
  `;

  const deleteAdCampaign = async () => {
    deleteMutation(
      {
        url: '',
        method: 'post',
        meta: {
          query: deleteAdCampaignMutation,
          queryName: 'deleteAdCampaign',
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
          message: `Ad Campaign deleted succesfully`,
          description: 'Success',
          type: 'success',
        }),
        values: {},
      },
      {
        onSuccess: () => {
          router.push(`/adCampaign`);
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
            onConfirm={deleteAdCampaign}
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
        }}
      >
        <CurrentImagePreview value={currentPicture} label="Current picture" />
        <Form.Item
          label={translate('adCampaign.fields.picture')}
          name={['picture']}
        >
          <Upload.Dragger name="picture" {...props}>
            <UploadPictureMessage />
          </Upload.Dragger>
        </Form.Item>

        <Form.Item
          label={translate('adCampaign.fields.owner')}
          name={['owner']}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label={translate('adCampaign.fields.url')}
          name={['url']}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label={translate('adCampaign.fields.type')}
          name={['type']}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select options={AdTypes} />
        </Form.Item>

        <Form.Item
          label={translate('adCampaign.fields.startDate')}
          name={['startDate']}
          rules={[
            {
              required: true,
            },
          ]}
        >
          {/* @ts-ignore */}
          <DatePicker
            format="YYYY-MM-DD"
            disabledDate={disabledBeforeDays}
            disabledTime={disabledDateTime}
          />
        </Form.Item>

        <Form.Item
          label={translate('adCampaign.fields.endDate')}
          name={['endDate']}
          rules={[
            {
              required: true,
            },
          ]}
        >
          {/* @ts-ignore */}
          <DatePicker
            format="YYYY-MM-DD"
            disabledDate={disabledTodayAndBeforeDays}
            disabledTime={disabledDateTime}
          />
        </Form.Item>
      </Form>
    </Edit>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/adCampaign');
};

export default AdCampaignEdit;
