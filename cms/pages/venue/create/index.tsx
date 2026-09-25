import { Create, useForm } from '@refinedev/antd';
import { useTranslate } from '@refinedev/core';
import { Form, Input, Upload, UploadProps } from 'antd';
import { GetServerSideProps } from 'next';

import { ParentBrandField } from '@components/form-fields/ParentBrandField';
import { UploadPictureMessage } from '@components/upload-picture-msg';
import router from 'next/router';
import { handleServerSideProps } from '../../../src/utils/serverSideProps';

const VenueCreate = () => {
  const translate = useTranslate();
  const {
    venuePhone,
    venueName,
    username,
    venueAddress,
    venueCity,
    venueState,
    venueZip,
    venueCountry,
    brandId,
  } = router.query;

  const { formProps, saveButtonProps } = useForm({
    redirect: 'show',
    onMutationSuccess: (data) => {
      console.log('Venue Create - Success response:', data);
    },
    onMutationError: (error) => {
      console.log('Venue Create - Error response:', error);
    },
  });

  // Log form submission
  const originalOnFinish = formProps.onFinish;
  formProps.onFinish = (values) => {
    console.log('Venue Create - Form values:', values);
    console.log('Venue Create - Using standard useForm with GraphQL data provider');
    if (originalOnFinish) {
      return originalOnFinish(values);
    }
  };

  const props: UploadProps = {
    maxCount: 1,
    listType: 'picture',
    accept: 'image/png, image/jpeg, image/jpg, image/webp',
  };

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label={translate('venue.fields.profilePicture')}
          name={['profilePicture']}
        >
          <Upload.Dragger name="profilePicture" {...props}>
            <UploadPictureMessage />
          </Upload.Dragger>
        </Form.Item>

        <Form.Item
          label={translate('venue.fields.coverPicture')}
          name={['coverPicture']}
        >
          <Upload.Dragger name="coverPicture" {...props}>
            <UploadPictureMessage />
          </Upload.Dragger>
        </Form.Item>

        <Form.Item
          label={translate('venue.fields.externalId')}
          name={['externalId']}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label={translate('venue.fields.venueName')}
          name={['venueName']}
          initialValue={venueName}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label={translate('venue.fields.username')}
          name={['username']}
          initialValue={username}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item label={translate('venue.fields.bio')} name={['bio']}>
          <Input />
        </Form.Item>

        <Form.Item
          label={translate('venue.fields.venuePhone')}
          name={['venuePhone']}
          initialValue={venuePhone}
          rules={[
            {
              required: true,
            },
            {
              validator: (_, value) => {
                if (!value || /^\d+$/.test(value)) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error(
                    `${translate(
                      'venue.fields.venuePhone'
                    )} is not a valid phone number`
                  )
                );
              },
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label={translate('venue.fields.venueAddressCountry')}
          name={['venueAddressCountry']}
          initialValue={venueCountry}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label={translate('venue.fields.venueAddressState')}
          name={['venueAddressState']}
          initialValue={venueState}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label={translate('venue.fields.venueAddressCity')}
          name={['venueAddressCity']}
          initialValue={venueCity}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label={translate('venue.fields.venueAddressStreet')}
          name={['venueAddressStreet']}
          initialValue={venueAddress}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label={translate('venue.fields.venueAddressNumber')}
          name={['venueAddressNumber']}
          initialValue={venueZip}
          rules={[
            {
              required: true,
              validator: (_, value) => {
                if (!value || /^\d+$/.test(value)) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error(
                    `${translate(
                      'venue.fields.venueAddressNumber'
                    )} is not a valid number`
                  )
                );
              },
            },
          ]}
        >
          <Input />
        </Form.Item>

        <ParentBrandField
          label={translate('venue.fields.brand')}
          initialValue={brandId}
        />
      </Form>
    </Create>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/venue');
};

export default VenueCreate;
