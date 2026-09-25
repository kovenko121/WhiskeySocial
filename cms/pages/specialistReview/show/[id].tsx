import { GetServerSideProps } from 'next';

import {
  DeleteButton,
  EditButton,
  Show,
  TagField,
  TextField,
} from '@refinedev/antd';
import { useShow, useTranslate } from '@refinedev/core';
import { Image, Rate, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { getObject } from '../../../src/graphql-data-provider/utils/s3';
import { handleServerSideProps } from '../../../src/utils/serverSideProps';

const { Title } = Typography;

const SpecialistReviewShow = () => {
  const translate = useTranslate();
  const { queryResult } = useShow({
    resource: 'review',
  });
  const { data, isLoading } = queryResult;
  const [specialistPicture, setSpecialistPicture] = useState<
    string | undefined
  >();

  const record = data?.data;

  const getSpecialistPicture = async (key: string) => {
    const result = await getObject(key);
    setSpecialistPicture(result);
  };

  useEffect(() => {
    if (record && record.specialistImage) {
      getSpecialistPicture(record.specialistImage.key);
    }
  }, [record]);

  return (
    <Show
      title="Specialist Review"
      isLoading={isLoading}
      headerButtons={({ editButtonProps, deleteButtonProps }) => (
        <>
          {editButtonProps && <EditButton {...editButtonProps} />}
          {deleteButtonProps && <DeleteButton {...deleteButtonProps} />}
        </>
      )}
    >
      <Title level={5}>{translate('specialistReview.fields.whiskeyId')}</Title>
      <TextField value={record?.whiskeyId} />

      <Title level={5}>Whiskey Name</Title>
      <TextField value={record?.whiskey?.fullName} />

      <Title level={5}> {translate('specialistReview.fields.rating')}</Title>
      <Rate disabled value={record?.rating} />

      <Title level={5}>{translate('specialistReview.fields.title')}</Title>
      <TextField value={record?.title} />

      <Title level={5}>{translate('specialistReview.fields.title')}</Title>
      <TextField value={record?.title} />

      <Title level={5}>
        {translate('specialistReview.fields.description')}
      </Title>
      <TextField value={record?.description} />

      <Title level={5}>
        {translate('specialistReview.fields.recommendationTags')}
      </Title>
      {record?.recommendationTags &&
        record?.recommendationTags.map((item: string | null) => (
          <TagField value={item} />
        ))}

      <Title level={5}>
        {translate('specialistReview.fields.specialistName')}
      </Title>
      <TextField value={record?.specialistName} />

      <Title level={5}>
        {translate('specialistReview.fields.specialistImage')}
      </Title>
      <Image style={{ width: '50%' }} src={specialistPicture} />
    </Show>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/specialistReview');
};

export default SpecialistReviewShow;
