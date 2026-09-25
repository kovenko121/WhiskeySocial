import { GetServerSideProps } from 'next';

import { ExportOutlined } from '@ant-design/icons';
import {
  CreateButton,
  DeleteButton,
  EditButton,
  SaveButton,
  Show,
  TextField,
  useModalForm,
} from '@refinedev/antd';
import { useCustomMutation, useShow, useTranslate } from '@refinedev/core';
import { Button, Form, Input, Modal, Typography } from 'antd';
import router from 'next/router';
import { handleServerSideProps } from '../../../src/utils/serverSideProps';
import { VenueRequestStatus } from '../../../src/graphql-data-provider/utils/graphQlTypes';

const { Title, Link } = Typography;

const VenueRequestShow = () => {
  const translate = useTranslate();
  const { queryResult } = useShow({
    resource: 'venueRequest',
  });
  const { data, isLoading } = queryResult;
  const { mutate, isLoading: isTranfering } = useCustomMutation();

  const record = data?.data;

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
      fullName: record?.fullName,
      email: record?.email,
      venuePhone: record?.venuePhone ? record?.venuePhone.split(' ')[1] : '',
      venueName: record?.venueName,
      username: record?.username,
      venueCountry: record?.venueAddressCountry,
      venueState: record?.venueAddressState,
      venueCity: record?.venueAddressCity,
      venueAddress: record?.venueAddressStreet,
      venueZip: record?.venueAddressNumber,
    };

    router.push({
      pathname: '/venue/create',
      query: params,
    });
  };

  return (
    <>
      <Show
        isLoading={isLoading}
        headerButtons={({ deleteButtonProps, editButtonProps }) => (
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
            {deleteButtonProps && <DeleteButton {...deleteButtonProps} />}
            {editButtonProps && <EditButton {...editButtonProps} />}
          </>
        )}
      >
        <Title level={5}>{translate('venueRequest.fields.fullName')}</Title>
        <TextField value={record?.fullName} />

        <Title level={5}>{translate('venueRequest.fields.status')}</Title>
        <TextField value={record?.status} />

        <Title level={5}>{translate('venueRequest.fields.email')}</Title>
        <TextField value={record?.email} />

        <Title level={5}>{translate('venueRequest.fields.venuePhone')}</Title>
        <TextField value={record?.venuePhone} />

        {record?.venueId && (
          <>
            <Title level={5}>{translate('venueRequest.fields.venueId')}</Title>
            <Link href={`/venue/show/${record?.venueId}`}>
              {record?.venueId}
            </Link>
          </>
        )}

        {record?.venueName && (
          <>
            <Title level={5}>
              {translate('venueRequest.fields.venueName')}
            </Title>
            <TextField value={record?.venueName} />
          </>
        )}

        {record?.username && (
          <>
            <Title level={5}>{translate('venueRequest.fields.username')}</Title>
            <TextField value={record?.username} />
          </>
        )}

        {record?.venueAddressCountry && (
          <>
            <Title level={5}>
              {translate('venueRequest.fields.venueAddressCountry')}
            </Title>
            <TextField value={record?.venueAddressCountry} />
          </>
        )}

        {record?.venueAddressState && (
          <>
            <Title level={5}>
              {translate('venueRequest.fields.venueAddressState')}
            </Title>
            <TextField value={record?.venueAddressState} />
          </>
        )}

        {record?.venueAddressCity && (
          <>
            <Title level={5}>
              {translate('venueRequest.fields.venueAddressCity')}
            </Title>
            <TextField value={record?.venueAddressCity} />
          </>
        )}

        {record?.venueAddressStreet && (
          <>
            <Title level={5}>
              {translate('venueRequest.fields.venueAddressStreet')}
            </Title>
            <TextField value={record?.venueAddressStreet} />
          </>
        )}

        {record?.venueAddressNumber && (
          <>
            <Title level={5}>
              {translate('venueRequest.fields.venueAddressNumber')}
            </Title>
            <TextField value={record?.venueAddressNumber} />
          </>
        )}
      </Show>
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

export default VenueRequestShow;
