import { useSelect } from '@refinedev/antd';
import { useList, useOne } from '@refinedev/core';
import {
  Alert,
  Button,
  Form,
  FormInstance,
  Input,
  InputNumber,
  Select,
  Upload,
  UploadProps,
  message,
} from 'antd';
import React, { useEffect } from 'react';

import { CurrentImagePreview } from '@components/current-image-preview';
import { UploadPictureMessage } from '@components/upload-picture-msg';

import { filterByLabel } from './filterByLabel';

const uploadProps: UploadProps = {
  maxCount: 1,
  listType: 'picture',
  accept: 'image/png, image/jpeg, image/jpg, image/webp',
};

type Props = {
  form: FormInstance;
  isCreate?: boolean;
};

const LAST_BOOTH_ID_KEY = 'tastingPour:lastBoothId';

/**
 * The catalogue holds the bottle's style as a `type` array ("American", "Bourbon",
 * "Rye"); the pour carries it as one free-text tag, so join rather than take the first.
 */
const joinTypes = (types?: (string | null)[] | null): string =>
  (types ?? []).filter((entry): entry is string => Boolean(entry)).join(', ');

/**
 * Shared pour form. Pick the booth, then either pick one of that booth's brand
 * bottles from the catalogue ("Fill from bottle") or type a custom bottle the
 * brand is only pouring at this event. The leaderboard identity (bottleKey) is
 * derived server-side from the linked bottle or the brand+name.
 */
export const PourFormFields: React.FC<Props> = ({ form, isCreate }) => {
  // Undefined on create; the saved S3Object on edit until a new file is picked.
  const currentPicture = Form.useWatch('picture', form);
  const { selectProps: boothSelectProps } = useSelect({
    resource: 'tastingBooth',
    optionLabel: 'name',
    optionValue: 'id',
  });

  const boothId = Form.useWatch('boothId', form);

  // Curators add several pours to the same booth in a row — start the next
  // create from the last booth picked rather than making them reselect it.
  useEffect(() => {
    if (!isCreate) return;
    const lastBoothId = window.localStorage.getItem(LAST_BOOTH_ID_KEY);
    if (lastBoothId) {
      form.setFieldValue('boothId', lastBoothId);
    }
    // Only on mount: this seeds the initial value, it does not track changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data: boothData } = useOne({
    resource: 'tastingBooth',
    id: boothId,
    queryOptions: { enabled: !!boothId },
  });
  const brandRefId = (boothData?.data as { brandRefId?: string } | undefined)
    ?.brandRefId;

  const { selectProps: whiskeySelectProps, queryResult: whiskeyQueryResult } =
    useSelect({
      resource: 'whiskey',
      optionLabel: 'name',
      optionValue: 'id',
      filters: brandRefId
        ? [{ field: 'brandId', operator: 'eq', value: brandRefId }]
        : [],
      queryOptions: { enabled: !!brandRefId },
    });

  // Every option already belongs to the booth's brand, so the bottle name alone
  // identifies it. `fullName` is a normalized search key — lowercased, accents
  // stripped, "&" stored as "ëéèê" — so it only stands in when a name is missing.
  const whiskeyOptions = (
    (whiskeyQueryResult.data?.data ?? []) as {
      id: string;
      name?: string;
      fullName?: string;
    }[]
  ).map((whiskey) => ({
    value: whiskey.id,
    label: whiskey.name || (whiskey.fullName ?? '').replace(/ëéèê/g, '&'),
  }));

  // Filled in rather than left to the curator, so pours keep a deliberate sequence.
  const order = Form.useWatch('order', form);
  const { data: boothPours } = useList({
    resource: 'tastingPour',
    filters: [{ field: 'boothId', operator: 'eq', value: boothId }],
    pagination: { mode: 'off' },
    queryOptions: { enabled: !!boothId },
  });

  useEffect(() => {
    if (!boothId || !boothPours || typeof order === 'number') return;
    form.setFieldValue('order', boothPours.data.length + 1);
  }, [boothId, boothPours, order, form]);

  const whiskeyRefId = Form.useWatch('whiskeyRefId', form);

  const { refetch: refetchWhiskey, isFetching } = useOne({
    resource: 'whiskey',
    id: whiskeyRefId,
    queryOptions: { enabled: false },
  });

  const onFillFromBottle = async () => {
    if (!whiskeyRefId) {
      message.warning('Pick a bottle first.');
      return;
    }
    const { data } = await refetchWhiskey();
    const w = data?.data as
      | {
          name?: string;
          brand?: string;
          proof?: number;
          calculatedRating?: number;
          type?: (string | null)[];
        }
      | undefined;
    if (!w) {
      message.error('Could not load that bottle.');
      return;
    }
    // Not the bottle shot: a linked pour reads that live, so a copy would go stale.
    form.setFieldsValue({
      name: w.name,
      brand: w.brand,
      proof: w.proof,
      rating: w.calculatedRating,
      tag: joinTypes(w.type),
    });
    message.success('Filled pour details from the bottle. Edit as needed.');
  };

  return (
    <>
      <Form.Item label="Booth" name={['boothId']} rules={[{ required: true }]}>
        <Select
          {...boothSelectProps}
          onSearch={undefined}
          filterOption={filterByLabel}
          showSearch
          onChange={(value) => {
            form.setFieldsValue({ whiskeyRefId: undefined });
            if (typeof value === 'string') {
              window.localStorage.setItem(LAST_BOOTH_ID_KEY, value);
            }
          }}
          placeholder="Select the booth pouring this bottle"
        />
      </Form.Item>

      {!boothId && (
        <Alert
          style={{ marginBottom: 16 }}
          type="info"
          message="Pick a booth to load its brand's catalogue bottles."
        />
      )}

      {boothId && !brandRefId && (
        <Alert
          style={{ marginBottom: 16 }}
          type="warning"
          message="This booth has no linked brand — add the bottle as a custom pour below."
        />
      )}

      <Form.Item
        label="Catalogue Bottle"
        name={['whiskeyRefId']}
        help="Leave empty for a custom bottle only poured at this event."
      >
        <Select
          {...whiskeySelectProps}
          options={whiskeyOptions}
          onSearch={undefined}
          filterOption={filterByLabel}
          allowClear
          showSearch
          disabled={!brandRefId}
          placeholder="Pick one of this brand's bottles"
        />
      </Form.Item>

      <Form.Item>
        <Button onClick={onFillFromBottle} loading={isFetching}>
          Fill from bottle
        </Button>
      </Form.Item>

      <Form.Item label="Name" name={['name']} rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item label="Brand" name={['brand']}>
        <Input />
      </Form.Item>

      <Form.Item
        label="Tag"
        name={['tag']}
        help='Style shown on the pour card. Free text — use "Other" for gin, vodka, and anything else that is not a whiskey style.'
      >
        <Input placeholder="e.g. Bourbon, Rye, Single Barrel, Other" />
      </Form.Item>

      <Form.Item
        label="Proof"
        name={['proof']}
        help="Leave blank for barrel proof and cask strength — the app then prints no proof at all rather than 0."
      >
        <InputNumber min={0} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item label="Rating" name={['rating']}>
        <InputNumber min={0} max={100} style={{ width: '100%' }} />
      </Form.Item>

      <CurrentImagePreview
        value={currentPicture}
        label="Current bottle image"
      />
      <Form.Item
        label="Bottle Image"
        name={['picture']}
        help="Only needed to override the catalogue bottle's shot, or for a custom pour with no bottle linked."
      >
        <Upload.Dragger name="picture" {...uploadProps}>
          <UploadPictureMessage />
        </Upload.Dragger>
      </Form.Item>

      <Form.Item
        label="Order"
        name={['order']}
        help="Position in the booth's pour list. Filled in for you; edit to reorder."
      >
        <InputNumber min={0} style={{ width: '100%' }} />
      </Form.Item>
    </>
  );
};

export default PourFormFields;
