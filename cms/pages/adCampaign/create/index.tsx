import { Create, useForm } from '@refinedev/antd';
import { useTranslate } from '@refinedev/core';
import { DatePicker, Form, Input, Select, Upload, UploadProps } from 'antd';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { AdTypes } from 'src/graphql-data-provider/utils/selectTypes';

import { UploadPictureMessage } from '@components/upload-picture-msg';
import moment from 'moment';
import { authOptions } from '../../api/auth/[...nextauth]';
import { handleServerSideProps } from 'src/utils/serverSideProps';

const AdCampaignCreate = () => {
  const translate = useTranslate();

  const { formProps, saveButtonProps } = useForm({
    redirect: 'show',
  });

  const props: UploadProps = {
    maxCount: 1,
    listType: 'picture',
    accept: 'image/png, image/jpeg, image/jpg, image/webp',
  };

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

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label={translate('adCampaign.fields.picture')}
          name={['picture']}
        >
          <Upload.Dragger name="picture" {...props}>
            <UploadPictureMessage />
          </Upload.Dragger>
        </Form.Item>

        <Form.Item
          label={translate('adCampaign.fields.name')}
          name={['name']}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
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
    </Create>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/adCampaign');
};

export default AdCampaignCreate;
