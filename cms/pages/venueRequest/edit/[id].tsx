import { DeleteOutlined, ExportOutlined } from '@ant-design/icons';
import {
  CreateButton,
  Edit,
  SaveButton,
  useForm,
  useModalForm,
} from '@refinedev/antd';
import { useCustomMutation, useShow, useTranslate } from '@refinedev/core';
import { Button, Form, Input, Modal, Popconfirm, Select, Typography } from 'antd';
import { GetServerSideProps } from 'next';
import { useParams } from 'next/navigation';
import router from 'next/router';
import { VenueRequestStatusOptions } from 'src/graphql-data-provider/utils/selectTypes';
import { handleServerSideProps } from '../../../src/utils/serverSideProps';
import { VenueRequestStatus } from '../../../src/graphql-data-provider/utils/graphQlTypes';

const { Link } = Typography;

const VenueRequestEdit = () => {
  const translate = useTranslate();
  const { id } = useParams();

  const { formProps, saveButtonProps } = useForm({
    redirect: 'show',
  });

  const { queryResult } = useShow({
    resource: 'venueRequest',
  });
  const { data } = queryResult;

  const { mutate, isLoading: isTranfering } = useCustomMutation();
  const { mutate: deleteMutation, isLoading: isDeleting } = useCustomMutation();

  const record = data?.data;

  const deleteVenueRequestMutation = `
    mutation DeleteVenueRequest($id: ID!) {
      deleteVenueRequest(input: {id: $id}) {
        id
      }
    }
  `;

  const deleteVenueRequest = () => {
    deleteMutation(
      {
        url: '',
        method: 'post',
        meta: {
          query: deleteVenueRequestMutation,
          queryName: 'deleteVenueRequest',
          variables: {
            id,
          },
        },
        errorNotification: () => ({
          message: 'Something went wrong',
          description: 'Error',
          type: 'error',
        }),
        successNotification: () => ({
          message: 'Venue request deleted successfully',
          description: 'Success',
          type: 'success',
        }),
        values: {},
      },
      {
        onSuccess: () => {
          router.push('/venueRequest');
        },
      }
    );
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

  const transferVenue = async (email: string, venueId: string) => {
    mutate(
      {
        url: '',
        method: 'post',
        meta: {
          query: transferVenueMutation,
          queryName: 'transferVenue',
          variables: {
            id: venueId,
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

  const createVenue = () => {
    const params = {
      fullName: createFormProps.form?.getFieldValue('fullName'),
      email: createFormProps.form?.getFieldValue('email'),
      venuePhone: createFormProps.form?.getFieldValue('venuePhone')
        ? createFormProps.form?.getFieldValue('venuePhone').split(' ')[1]
        : '',
      venueName: createFormProps.form?.getFieldValue('venueName'),
      username: createFormProps.form?.getFieldValue('username'),
      venueCountry: createFormProps.form?.getFieldValue('venueAddressCountry'),
      venueState: createFormProps.form?.getFieldValue('venueAddressState'),
      venueCity: createFormProps.form?.getFieldValue('venueAddressCity'),
      venueAddress: createFormProps.form?.getFieldValue('venueAddressStreet'),
      venueZip: createFormProps.form?.getFieldValue('venueAddressNumber'),
    };

    router.push({
      pathname: '/venue/create',
      query: params,
    });
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
            {record && record?.status === VenueRequestStatus.PENDING && (
              <>
                <Button
                  icon={<ExportOutlined />}
                  onClick={() => showTransferModal()}
                >
                  Transfer Venue
                </Button>
                {!record?.venueId && (
                  <CreateButton onClick={createVenue}>
                    Create Venue
                  </CreateButton>
                )}
              </>
            )}
            <Popconfirm
              title="Are you sure?"
              onConfirm={deleteVenueRequest}
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
            label={translate('venueRequest.fields.status')}
            name={['status']}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Select options={VenueRequestStatusOptions} />
          </Form.Item>

          <Form.Item label={translate('venueRequest.fields.fullName')}>
            <Input readOnly value={record?.fullName} disabled />
          </Form.Item>

          <Form.Item label={translate('venueRequest.fields.email')}>
            <Input readOnly value={record?.email} disabled />
          </Form.Item>

          <Form.Item label={translate('venueRequest.fields.venuePhone')}>
            <Input readOnly value={record?.venuePhone} disabled />
          </Form.Item>

          {record?.venueId && (
            <Form.Item label={translate('venueRequest.fields.venueId')}>
              <Link href={`/venue/show/${record?.venueId}`}>
                {record?.venueId}
              </Link>
            </Form.Item>
          )}

          {record?.venueName && (
            <Form.Item label={translate('venueRequest.fields.venueName')}>
              <Input readOnly value={record?.venueName} disabled />
            </Form.Item>
          )}

          {record?.username && (
            <Form.Item label={translate('venueRequest.fields.username')}>
              <Input readOnly value={record?.username} disabled />
            </Form.Item>
          )}

          {record?.venueAddressCountry && (
            <Form.Item
              label={translate('venueRequest.fields.venueAddressCountry')}
            >
              <Input readOnly value={record?.venueAddressCountry} disabled />
            </Form.Item>
          )}

          {record?.venueAddressState && (
            <Form.Item
              label={translate('venueRequest.fields.venueAddressState')}
            >
              <Input readOnly value={record?.venueAddressState} disabled />
            </Form.Item>
          )}

          {record?.venueAddressCity && (
            <Form.Item
              label={translate('venueRequest.fields.venueAddressCity')}
            >
              <Input readOnly value={record?.venueAddressCity} disabled />
            </Form.Item>
          )}

          {record?.venueAddressStreet && (
            <Form.Item
              label={translate('venueRequest.fields.venueAddressStreet')}
            >
              <Input readOnly value={record?.venueAddressStreet} disabled />
            </Form.Item>
          )}

          {record?.venueAddressNumber && (
            <Form.Item
              label={translate('venueRequest.fields.venueAddressNumber')}
            >
              <Input readOnly value={record?.venueAddressNumber} disabled />
            </Form.Item>
          )}
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
                transferVenue(
                  createFormProps.form?.getFieldValue('email'),
                  createFormProps.form?.getFieldValue('venueId')
                );
              }}
            >
              Transfer
            </SaveButton>
          </>
        }
      >
        <Form {...createFormProps} layout="vertical">
          <Form.Item
            label="Venue Id"
            name="venueId"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input defaultValue={record?.venueId} />
          </Form.Item>
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
            <Input defaultValue={record?.email} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/venueRequest');
};

export default VenueRequestEdit;
