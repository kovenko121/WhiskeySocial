import { CurrentImagePreview } from '@components/current-image-preview';
import { Edit, SaveButton, useForm, useModalForm } from '@refinedev/antd';
import { useCustomMutation, useOne, useTranslate } from '@refinedev/core';
import {
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Upload,
  UploadProps,
} from 'antd';
import { GetServerSideProps } from 'next';

import { DeleteOutlined, ExportOutlined } from '@ant-design/icons';
import { ParentBrandField } from '@components/form-fields/ParentBrandField';
import { UploadPictureMessage } from '@components/upload-picture-msg';
import { useParams, useRouter } from 'next/navigation';
import { handleServerSideProps } from '../../../src/utils/serverSideProps';

const VenueEdit = () => {
  const translate = useTranslate();
  const { mutate, isLoading: isTranfering } = useCustomMutation();
  const { mutate: deleteMutation, isLoading: isDeleting } = useCustomMutation();
  const { id } = useParams();
  const { data } = useOne({ resource: 'venue', id: id as string });
  const router = useRouter();
  const { formProps, saveButtonProps } = useForm({
    redirect: 'show',
  });

  // Undefined until the record loads; the saved S3Object until a new file is picked.
  const currentProfilePicture = Form.useWatch('profilePicture', formProps.form);
  const currentCoverPicture = Form.useWatch('coverPicture', formProps.form);

  const props: UploadProps = {
    maxCount: 1,
    listType: 'picture',
    accept: 'image/png, image/jpeg, image/jpg, image/webp',
  };

  const {
    modalProps: createModalProps,
    formProps: createFormProps,
    show: showTransferModal,
    close: closeTransferModal,
  } = useModalForm({
    action: 'create',
    warnWhenUnsavedChanges: false,
  });

  const transferVenueMutation = `
    mutation TransferVenue($id: ID!, $email: String!, $token: String!) {
      transferVenue(id: $id, email: $email, token: $token)
    }
  `;

  const transferVenue = async (email: string) => {
    mutate(
      {
        url: '',
        method: 'post',
        meta: {
          query: transferVenueMutation,
          queryName: 'transferVenue',
          variables: {
            id,
            email,
          },
        },
        errorNotification: () => ({
          message: `Something went wrong`,
          description: 'Error',
          type: 'error',
        }),
        successNotification: () => ({
          message: `Venue transfered succesfully`,
          description: 'Success',
          type: 'success',
        }),
        values: {},
      },
      {
        onSuccess: () => {
          closeTransferModal();
        },
      }
    );
  };

  const deleteVenueMutation = `
    mutation DeleteVenue($id: ID!, $token: String!) {
      deleteVenue(input: {id: $id, token: $token}) {
        id
      }
    }
  `;

  const deleteVenue = async () => {
    deleteMutation(
      {
        url: '',
        method: 'post',
        meta: {
          query: deleteVenueMutation,
          queryName: 'deleteVenue',
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
          message: `Venue deleted succesfully`,
          description: 'Success',
          type: 'success',
        }),
        values: {},
      },
      {
        onSuccess: () => {
          router.push(`/venue`);
        },
      }
    );
  };

  return (
    <>
      <Edit
        headerButtonProps={{
          style: {
            padding: '16px',
          },
        }}
        headerButtons={() => (
          <>
            {data && data?.data?.toBeRedeemed && (
              <Button onClick={() => showTransferModal()}>
                <ExportOutlined /> Transfer Venue
              </Button>
            )}
            <Popconfirm
              title="Are you sure?"
              onConfirm={deleteVenue}
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
          <CurrentImagePreview
            value={currentProfilePicture}
            label="Current profile picture"
          />
          <Form.Item
            label={translate('venue.fields.profilePicture')}
            name={['profilePicture']}
          >
            <Upload.Dragger name="profilePicture" {...props}>
              <UploadPictureMessage />
            </Upload.Dragger>
          </Form.Item>

          <CurrentImagePreview
            value={currentCoverPicture}
            label="Current cover picture"
          />
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
                      )} is not a valid number`
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
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={translate('venue.fields.venueAddressState')}
            name={['venueAddressState']}
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

          <ParentBrandField label={translate('venue.fields.brand')} />
        </Form>
      </Edit>
      <Modal
        {...createModalProps}
        title="Transfer Venue to"
        footer={
          <>
            <Button
              onClick={() => {
                closeTransferModal();
              }}
            >
              Cancel
            </Button>
            <SaveButton
              loading={isTranfering}
              icon={false}
              onClick={() => {
                transferVenue(createFormProps.form?.getFieldValue('email'));
              }}
            >
              Transfer
            </SaveButton>
          </>
        }
      >
        <Form {...createFormProps} layout="vertical">
          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                required: true,
              },
              {
                pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}$/i,
                message: 'Invalid email address.',
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/venue');
};

export default VenueEdit;
