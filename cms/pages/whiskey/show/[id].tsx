import { GetServerSideProps } from 'next';
import { getProofDisplayValue } from '../../../src/graphql-data-provider/utils/graphQlTypes';

import { FalseIcon } from '@components/false-icon';
import { TrueIcon } from '@components/true-icon';
import {
  BooleanField,
  DeleteButton,
  EditButton,
  Show,
  TagField,
  TextField,
} from '@refinedev/antd';
import { useShow, useTranslate } from '@refinedev/core';
import { Image, Typography, Button, Tooltip } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { getObject } from '../../../src/graphql-data-provider/utils/s3';
import { handleServerSideProps } from '../../../src/utils/serverSideProps';

const { Title } = Typography;

const WhiskeyShow = () => {
  const translate = useTranslate();
  const { queryResult } = useShow({
    resource: 'whiskey',
    meta: {
      // Force fresh data fetch when navigating to this page
      refetchOnWindowFocus: true,
    },
  });
  const { data, isLoading, refetch } = queryResult;
  const [picture, setPicture] = useState<string | undefined>();
  const [brandPicture, setBrandPicture] = useState<string | undefined>();

  const record = data?.data;

  const getPicture = async (key: string) => {
    const result = await getObject(key);
    setPicture(result);
  };

  const getBrandPicture = async (key: string) => {
    const result = await getObject(key);
    setBrandPicture(result);
  };

  useEffect(() => {
    // Clear previous images when record changes to avoid stale data
    setPicture(undefined);
    setBrandPicture(undefined);

    if (record && record.picture) {
      getPicture(record.picture.key);
    }
    if (record && record.brandPicture) {
      getBrandPicture(record.brandPicture.key);
    }
  }, [record]);

  return (
    <Show
      isLoading={isLoading}
      headerButtons={({ editButtonProps, deleteButtonProps }) => (
        <>
          <Tooltip title="Refresh data">
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                refetch();
              }}
            >
              Refresh
            </Button>
          </Tooltip>
          {editButtonProps && <EditButton {...editButtonProps} />}
          {deleteButtonProps && <DeleteButton {...deleteButtonProps} />}
        </>
      )}
    >
      <Title level={5}>{translate('whiskey.fields.picture')}</Title>
      {picture ? (
        <Image
          style={{ width: '50%', maxHeight: '300px', objectFit: 'contain' }}
          src={picture}
          alt="Whiskey Picture"
        />
      ) : record?.picture ? (
        <div>Loading image...</div>
      ) : (
        <div style={{ color: '#999' }}>No picture available</div>
      )}

      <Title level={5}>{translate('whiskey.fields.brandPicture')}</Title>
      {brandPicture ? (
        <Image
          style={{ width: '50%', maxHeight: '300px', objectFit: 'contain' }}
          src={brandPicture}
          alt="Brand Picture"
        />
      ) : record?.brandPicture ? (
        <div>Loading image...</div>
      ) : (
        <div style={{ color: '#999' }}>No brand picture available</div>
      )}

      <Title level={5}>{translate('whiskey.fields.id')}</Title>
      <TextField value={record?.id} />

      <Title level={5}>{translate('whiskey.fields.name')}</Title>
      <TextField value={record?.name} />

      <Title level={5}>{translate('whiskey.fields.brand')}</Title>
      <TextField value={record?.brandUser?.brandName} />

      <Title level={5}>{translate('whiskey.fields.description')}</Title>
      <TextField value={record?.description} />

      <Title level={5}>{translate('whiskey.fields.specialistChoice')}</Title>
      <BooleanField
        trueIcon={<TrueIcon />}
        falseIcon={<FalseIcon />}
        value={record?.specialistChoice}
      />

      <Title level={5}>{translate('whiskey.fields.starterPick')}</Title>
      <BooleanField
        trueIcon={<TrueIcon />}
        falseIcon={<FalseIcon />}
        value={record?.starterPick}
      />

      <Title level={5}>{translate('whiskey.fields.singleBarrel')}</Title>
      <BooleanField
        trueIcon={<TrueIcon />}
        falseIcon={<FalseIcon />}
        value={record?.singleBarrel}
      />

      <Title level={5}>{translate('whiskey.fields.barrel')}</Title>
      <TextField value={record?.barrel} />

      <Title level={5}>{translate('whiskey.fields.distillery')}</Title>
      <TextField value={record?.distillery} />

      <Title level={5}>{translate('whiskey.fields.origin')}</Title>
      <TextField value={record?.origin} />

      <Title level={5}>{translate('whiskey.fields.batch')}</Title>
      <TextField value={record?.batch} />

      <Title level={5}>{translate('whiskey.fields.rick')}</Title>
      <TextField value={record?.rick} />

      <Title level={5}>{translate('whiskey.fields.bottle')}</Title>
      <TextField value={record?.bottle} />

      <Title level={5}>{translate('whiskey.fields.storePick')}</Title>
      <TextField value={record?.storePick} />

      <Title level={5}>{translate('whiskey.fields.type')}</Title>

      {record?.type &&
        record?.type.map((item: string | null) => <TagField value={item} />)}

      <Title level={5}>{translate('whiskey.fields.proof')}</Title>
      <TextField value={getProofDisplayValue(record as any)} />

      <Title level={5}>{translate('whiskey.fields.calculatedRating')}</Title>
      <TextField value={record?.calculatedRating} />

      <Title level={5}>{translate('whiskey.fields.age')}</Title>
      <TextField value={record?.age} />

      <Title level={5}>{translate('whiskey.fields.distilleryTastingNotes')}</Title>
      <TextField value={record?.distilleryTastingNotes} />
    </Show>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/whiskey');
};

export default WhiskeyShow;
