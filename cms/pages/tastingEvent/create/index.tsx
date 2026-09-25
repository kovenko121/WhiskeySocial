import { Create, useForm } from '@refinedev/antd';
import { GetServerSideProps } from 'next';
import { DatePicker, Form, Input, Select, Upload, UploadProps } from 'antd';
import dayjs from 'dayjs';
import React from 'react';

import { UploadPictureMessage } from '@components/upload-picture-msg';
import { handleServerSideProps } from 'src/utils/serverSideProps';

const STATUS_OPTIONS = [
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Scheduled', value: 'SCHEDULED' },
  { label: 'Published', value: 'PUBLISHED' },
  { label: 'Archived', value: 'ARCHIVED' },
];

const uploadProps: UploadProps = {
  maxCount: 1,
  listType: 'picture',
  accept: 'image/png, image/jpeg, image/jpg, image/webp',
};

const TastingEventCreate = () => {
  const { formProps, saveButtonProps } = useForm({ redirect: 'list' });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical" initialValues={{ status: 'DRAFT' }}>
        <Form.Item label="Event Image" name={['image']}>
          <Upload.Dragger name="image" {...uploadProps}>
            <UploadPictureMessage />
          </Upload.Dragger>
        </Form.Item>

        <Form.Item
          label="Title"
          name={['title']}
          rules={[{ required: true }]}
        >
          <Input placeholder="Southern Food & Whiskey Experience" />
        </Form.Item>

        <Form.Item
          label="Description"
          name={['description']}
          help="Free text — the location line. Dates now have their own fields below."
        >
          <Input.TextArea rows={5} />
        </Form.Item>

        <Form.Item
          label="Status"
          name={['status']}
          rules={[{ required: true }]}
        >
          <Select options={STATUS_OPTIONS} />
        </Form.Item>

        <Form.Item
          label="Booth Map"
          name={['mapImage']}
          help="The venue floor plan, shown in the passport guide. Leave empty and the app shows no map section for this event."
        >
          <Upload.Dragger name="mapImage" {...uploadProps}>
            <UploadPictureMessage />
          </Upload.Dragger>
        </Form.Item>

        <Form.Item
          label="Our Booth Number"
          name={['hostBoothNumber']}
          help="Whiskey Social's own stand, called out under the map. Leave empty for no callout."
        >
          <Input placeholder="34" />
        </Form.Item>

        <Form.Item
          label="Publish At"
          name={['publishAt']}
          help="When the event becomes visible in the app. Published events are visible now and ignore it. Stamping is gated separately, by Starts At."
          getValueProps={(value) => ({
            value: value ? dayjs(value) : undefined,
          })}
        >
          {/* @ts-ignore */}
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="Starts At"
          name={['startsAt']}
          help="When the doors open. Until this time the event is listed and browsable, but nothing can be stamped. Leave blank for no gate."
          getValueProps={(value) => ({
            value: value ? dayjs(value) : undefined,
          })}
        >
          {/* @ts-ignore */}
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="Ends At"
          name={['endsAt']}
          help="When it moves to Past Events. Leave blank and a scheduled event falls back to 24 hours after its publish time."
          getValueProps={(value) => ({
            value: value ? dayjs(value) : undefined,
          })}
        >
          {/* @ts-ignore */}
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Create>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/tastingEvent');
};

export default TastingEventCreate;
