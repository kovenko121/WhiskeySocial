import { DeleteOutlined } from '@ant-design/icons';
import { CurrentImagePreview } from '@components/current-image-preview';
import { UploadPictureMessage } from '@components/upload-picture-msg';
import { Edit, SaveButton, useForm } from '@refinedev/antd';
import { useCustomMutation, useTranslate } from '@refinedev/core';
import {
  Button,
  Form,
  Input,
  Popconfirm,
  Rate,
  Select,
  Upload,
  UploadProps,
} from 'antd';
import { GetServerSideProps } from 'next';
import { useParams } from 'next/navigation';
import router from 'next/router';
import { ReviewRecommendationTags } from 'src/graphql-data-provider/utils/selectTypes';
import { handleServerSideProps } from '../../../src/utils/serverSideProps';

const SpecialistReviewEdit = () => {
  const translate = useTranslate();
  const { id } = useParams();
  const { mutate: deleteMutation, isLoading: isDeleting } = useCustomMutation();

  const props: UploadProps = {
    maxCount: 1,
    listType: 'picture',
    accept: 'image/png, image/jpeg, image/jpg, image/webp',
  };

  const { formProps, saveButtonProps } = useForm({
    redirect: 'show',
  });

  // Undefined until the record loads; the saved S3Object until a new file is picked.
  const currentSpecialistImage = Form.useWatch(
    'specialistImage',
    formProps.form
  );

  const deleteReviewMutation = `
    mutation DeleteReview($id: ID!) {
      deleteReview(input: {id: $id}) {
        id
      }
    }
  `;

  const deleteReview = async () => {
    deleteMutation(
      {
        url: '',
        method: 'post',
        meta: {
          query: deleteReviewMutation,
          queryName: 'deleteReview',
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
          message: `Review deleted succesfully`,
          description: 'Success',
          type: 'success',
        }),
        values: {},
      },
      {
        onSuccess: () => {
          router.push(`/specialistReview`);
        },
      }
    );
  };

  return (
    <Edit
      title="Specialist Review"
      headerButtonProps={{
        style: {
          padding: '16px',
        },
      }}
      headerButtons={() => (
        <>
          <Popconfirm
            title="Are you sure?"
            onConfirm={deleteReview}
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
      <Form {...formProps} layout="vertical">
        <Form.Item
          label={translate('specialistReview.fields.whiskeyId')}
          name={['whiskeyId']}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
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

        <CurrentImagePreview
          value={currentSpecialistImage}
          label="Current specialist image"
        />
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
    </Edit>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/specialistReview');
};

export default SpecialistReviewEdit;
