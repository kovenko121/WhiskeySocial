import { useSelect } from '@refinedev/antd';
import { useOne } from '@refinedev/core';
import {
  Button,
  Form,
  FormInstance,
  Input,
  Select,
  Space,
  Upload,
  UploadProps,
  message,
} from 'antd';
import React, { useEffect } from 'react';

import { CurrentImagePreview } from '@components/current-image-preview';
import { UploadPictureMessage } from '@components/upload-picture-msg';
import { UserType } from 'src/graphql-data-provider/utils/graphQlTypes';

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

const LAST_EVENT_ID_KEY = 'tastingBooth:lastEventId';

/**
 * Shared booth form. A booth is either brand-linked (pick a brand, then "Sync
 * from brand" to auto-fill the snapshot text fields) or fully custom (leave the
 * brand empty and type the fields). The snapshot fields are what the app reads,
 * so they stay editable after syncing.
 *
 * There is no position field: the app's brand list sorts A→Z by booth name, so a
 * number here would promise a reordering it can no longer deliver. `TastingBooth.order`
 * still exists in the schema and on already-saved rows — it just drives nothing.
 */
export const BoothFormFields: React.FC<Props> = ({ form, isCreate }) => {
  // Undefined on create; the saved S3Object on edit until a new file is picked.
  const currentLogo = Form.useWatch('logo', form);
  const { selectProps: eventSelectProps } = useSelect({
    resource: 'tastingEvent',
    optionLabel: 'title',
    optionValue: 'id',
  });

  // Curators add several booths to the same event in a row — start the next
  // create from the last event picked rather than making them reselect it.
  useEffect(() => {
    if (!isCreate) return;
    const lastEventId = window.localStorage.getItem(LAST_EVENT_ID_KEY);
    if (lastEventId) {
      form.setFieldValue('eventId', lastEventId);
    }
    // Only on mount: this seeds the initial value, it does not track changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Brands share the User table, so without the userType filter this lists every
  // person and venue too — and any legacy record missing a required User field
  // fails the whole query on a non-nullable error.
  const { selectProps: brandSelectProps } = useSelect({
    resource: 'brand',
    optionLabel: 'brandName',
    optionValue: 'id',
    filters: [{ field: 'userType', operator: 'eq', value: UserType.BRAND }],
  });

  const brandRefId = Form.useWatch('brandRefId', form);

  const { refetch: refetchBrand, isFetching } = useOne({
    resource: 'brand',
    id: brandRefId,
    queryOptions: { enabled: false },
  });

  const onSyncFromBrand = async () => {
    if (!brandRefId) {
      message.warning('Pick a brand first.');
      return;
    }
    const { data } = await refetchBrand();
    const brand = data?.data as
      | {
          brandName?: string;
          brandDescription?: string;
          brandCountry?: string;
        }
      | undefined;
    if (!brand) {
      message.error('Could not load that brand.');
      return;
    }
    form.setFieldsValue({
      name: brand.brandName,
      description: brand.brandDescription,
      location: brand.brandCountry,
    });
    message.success('Filled booth details from the brand. Edit as needed.');
  };

  return (
    <>
      <Form.Item label="Event" name={['eventId']} rules={[{ required: true }]}>
        <Select
          {...eventSelectProps}
          onSearch={undefined}
          filterOption={filterByLabel}
          showSearch
          onChange={(value) => {
            if (typeof value === 'string') {
              window.localStorage.setItem(LAST_EVENT_ID_KEY, value);
            }
          }}
          placeholder="Select the event this booth belongs to"
        />
      </Form.Item>

      <Form.Item
        label="Brand (booth source)"
        name={['brandRefId']}
        help="Leave empty for a custom booth not tied to a brand account."
      >
        <Select
          {...brandSelectProps}
          onSearch={undefined}
          filterOption={filterByLabel}
          allowClear
          showSearch
          placeholder="Select a brand to base this booth on"
        />
      </Form.Item>

      <Form.Item>
        <Button onClick={onSyncFromBrand} loading={isFetching}>
          Sync details from brand
        </Button>
      </Form.Item>

      <Form.Item
        label="Booth Name"
        name={['name']}
        rules={[{ required: true }]}
      >
        <Input placeholder="Display name (falls back to this if no logo)" />
      </Form.Item>

      <CurrentImagePreview value={currentLogo} label="Current booth logo" />
      <Form.Item label="Booth Logo" name={['logo']}>
        <Upload.Dragger name="logo" {...uploadProps}>
          <UploadPictureMessage />
        </Upload.Dragger>
      </Form.Item>

      <Form.Item label="Description" name={['description']}>
        <Input.TextArea rows={3} />
      </Form.Item>

      <Form.Item label="Location" name={['location']}>
        <Input placeholder="Home location, when known" />
      </Form.Item>

      <Form.Item
        label="Booth Number"
        name={['boothNumber']}
        help="This stand's number on the printed floor plan. Booths with a number make up the directory under the map; leave it empty and the booth is not listed there."
      >
        <Input placeholder="34" />
      </Form.Item>
    </>
  );
};

export default BoothFormFields;
