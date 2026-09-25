import { Create, useForm } from '@refinedev/antd';
import { useParsed, useTranslate } from '@refinedev/core';
import {
  ButtonProps,
  Form,
  Input,
  Rate,
  Select,
  Upload,
  UploadProps,
} from 'antd';
import { GetServerSideProps } from 'next';

import { UploadPictureMessage } from '@components/upload-picture-msg';
import { useState } from 'react';
import { ReviewRecommendationTags } from 'src/graphql-data-provider/utils/selectTypes';
import { handleServerSideProps } from '../../../src/utils/serverSideProps';

const SpecialistReviewCreate = () => {
  const translate = useTranslate();

  const { params } = useParsed();

  const { formProps, onFinish } = useForm({
    redirect: 'show',
  });

  const props: UploadProps = {
    maxCount: 1,
    listType: 'picture',
    accept: 'image/png, image/jpeg, image/jpg, image/webp',
  };

  const [saving, setIsSaving] = useState(false);

  const handleOnFinish = () => {
    setIsSaving(true);
    onFinish();
  };

  const saveButtonProps: ButtonProps = {
    onClick: () => {
      if (params?.whiskeyId) {
        formProps.form?.setFieldValue('whiskeyId', params?.whiskeyId);
      }
      formProps.form?.setFieldValue('specialistReview', 1);
      formProps.form?.setFieldValue(
        'userId',
        'b79978f0-dc2c-4563-b1fd-85d5be128ea1'
      );
      formProps.form?.submit();
    },
    loading: saving,
  };

  return (
    <Create title="Specialist Review" saveButtonProps={saveButtonProps}>
      <Form {...formProps} onFinish={handleOnFinish} layout="vertical">
        <Form.Item
          label={translate('specialistReview.fields.whiskeyId')}
          name={['whiskeyId']}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input defaultValue={params?.whiskeyId || ''} />
        </Form.Item>

        <Form.Item
          label={translate('specialistReview.fields.rating')}
          name={['rating']}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Rate />
        </Form.Item>

        <Form.Item
          label={translate('specialistReview.fields.title')}
          name={['title']}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label={translate('specialistReview.fields.description')}
          name={['description']}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label={translate('specialistReview.fields.recommendationTags')}
          name={['recommendationTags']}
        >
          <Select options={ReviewRecommendationTags} />
        </Form.Item>

        <Form.Item
          label={translate('specialistReview.fields.specialistName')}
          name={['specialistName']}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label={translate('specialistReview.fields.specialistImage')}
          name={['specialistImage']}
        >
          <Upload.Dragger name="specialistImage" {...props}>
            <UploadPictureMessage />
          </Upload.Dragger>
        </Form.Item>

        <Form.Item name={['specialistReview']} />
        <Form.Item name={['userId']} />
      </Form>
    </Create>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/specialistReview');
};

export default SpecialistReviewCreate;
