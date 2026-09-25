import { GetServerSideProps } from 'next';

import { ExportOutlined } from '@ant-design/icons';
import {
  EditButton,
  SaveButton,
  Show,
  ShowButton,
  TextField,
  useModalForm,
} from '@refinedev/antd';
import {
  useCustomMutation,
  useOne,
  useShow,
  useTranslate,
} from '@refinedev/core';
import { Button, Form, Image, Input, Modal, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { EmailField } from '../../../src/components/form-fields/EmailField';
import { getObject } from '../../../src/graphql-data-provider/utils/s3';
import { handleServerSideProps } from '../../../src/utils/serverSideProps';

const { Title } = Typography;

const VenueShow = () => {
  const translate = useTranslate();
  const { queryResult } = useShow({
    resource: 'venue',
  });
  const { data, isLoading } = queryResult;
  const { mutate, isLoading: isTranfering } = useCustomMutation();
  const [profilePicture, setProfilePicture] = useState<string | undefined>();
  const [coverPicture, setCoverPicture] = useState<string | undefined>();

  const record = data?.data;

  const { data: brandData } = useOne({
    resource: 'brand',
    id: record?.brandId,
    queryOptions: {
      enabled: !!record?.brandId,
    },
  });

  const parentBrand = brandData?.data;

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
            id: record?.id,
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

  const getPicture = async (key: string) => {
    const result = await getObject(key);
    setProfilePicture(result);
  };

  const getCoverPicture = async (key: string) => {
    const result = await getObject(key);
    setCoverPicture(result);
  };

  useEffect(() => {
    if (record && record.profilePicture) {
      getPicture(record.profilePicture.key);
    }
    if (record && record.coverPicture) {
      getCoverPicture(record.coverPicture.key);
    }
  }, [record]);

  return (
    <>
      <Show
        headerButtons={() => (
          <>
            {data && data?.data?.toBeRedeemed && (
              <Button onClick={() => showTransferModal()}>
                <ExportOutlined /> Transfer Venue
              </Button>
            )}
            <EditButton />
          </>
        )}
        isLoading={isLoading}
      >
        <Title level={5}>{translate('venue.fields.profilePicture')}</Title>
        <Image style={{ width: '50%' }} src={profilePicture} />

        <Title level={5}>{translate('venue.fields.coverPicture')}</Title>
        <Image style={{ width: '50%' }} src={coverPicture} />

        <Title level={5}>{translate('venue.fields.id')}</Title>
        <TextField value={record?.id} />

        <Title level={5}>{translate('venue.fields.externalId')}</Title>
        <TextField value={record?.externalId} />

        <Title level={5}>{translate('venue.fields.venueName')}</Title>
        <TextField value={record?.venueName} />

        <Title level={5}>{translate('venue.fields.username')}</Title>
        <TextField value={record?.userame} />

        <Title level={5}>{translate('venue.fields.bio')}</Title>
        <TextField value={record?.bio} />

        <Title level={5}>{translate('venue.fields.venuePhone')}</Title>
        <TextField value={record?.venuePhone} />

        <Title level={5}>{translate('venue.fields.venueAddressCountry')}</Title>
        <TextField value={record?.venueAddressCountry} />

        <Title level={5}>{translate('venue.fields.venueAddressState')}</Title>
        <TextField value={record?.venueAddressState} />

        <Title level={5}>{translate('venue.fields.venueAddressCity')}</Title>
        <TextField value={record?.venueAddressCity} />

        <Title level={5}>{translate('venue.fields.venueAddressStreet')}</Title>
        <TextField value={record?.venueAddressStreet} />

        <Title level={5}>{translate('venue.fields.venueAddressNumber')}</Title>
        <TextField value={record?.venueAddressNumber} />

        <Title level={5}>{translate('venue.fields.venueCheckinsCount')}</Title>
        <TextField value={record?.venueCheckinsCount} />

        <Title level={5}>{translate('venue.fields.brand')}</Title>
        {!record?.brandId && <TextField value="—" />}
        {record?.brandId && (
          <div>
            <ShowButton
              size="small"
              resource="brand"
              recordItemId={record.brandId}
            >
              {parentBrand?.brandName || parentBrand?.username || record.brandId}
            </ShowButton>
          </div>
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
                transferVenue(createFormProps.form?.getFieldValue('email'));
              }}
            >
              Transfer
            </SaveButton>
          </>
        }
      >
        <Form {...createFormProps} layout="vertical">
          <EmailField
            label="Email"
            name="email"
            required={true}
            placeholder="owner@example.com"
          />
        </Form>
      </Modal>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/venue');
};

export default VenueShow;
