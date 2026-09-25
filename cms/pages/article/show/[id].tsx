import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { getServerSession } from 'next-auth';

import {
  DeleteButton,
  EditButton,
  Show,
  TagField,
  TextField,
} from '@refinedev/antd';
import { useShow } from '@refinedev/core';
import { Flex, Image, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { getObject } from '../../../src/graphql-data-provider/utils/s3';
import { authOptions } from '../../api/auth/[...nextauth]';
import { handleServerSideProps } from 'src/utils/serverSideProps';

const { Title } = Typography;

const ArticleShow = () => {
  const { queryResult } = useShow({
    resource: 'article',
  });
  const { data, isLoading } = queryResult;
  const [coverPhoto, setCoverPhoto] = useState<string | undefined>();
  const [paragraphOnePicture, setParagraphOnePicture] = useState<
    string | undefined
  >();
  const [paragraphTwoPicture, setParagraphTwoPicture] = useState<
    string | undefined
  >();
  const [paragraphThreePicture, setParagraphThreePicture] = useState<
    string | undefined
  >();

  const record = data?.data;

  const getCoverPicture = async (key: string) => {
    const result = await getObject(key);
    setCoverPhoto(result);
  };

  const getParagraphOnePicture = async (key: string) => {
    const result = await getObject(key);
    setParagraphOnePicture(result);
  };
  const getParagraphTwoPicture = async (key: string) => {
    const result = await getObject(key);
    setParagraphTwoPicture(result);
  };
  const getParagraphThreePicture = async (key: string) => {
    const result = await getObject(key);
    setParagraphThreePicture(result);
  };

  useEffect(() => {
    if (record && record.coverPhoto) {
      getCoverPicture(record.coverPhoto.key);
    }
    if (record && record.photos[0]) {
      getParagraphOnePicture(record.photos[0].key);
    }
    if (record && record.photos[1]) {
      getParagraphTwoPicture(record.photos[1].key);
    }
    if (record && record.photos[2]) {
      getParagraphThreePicture(record.photos[2].key);
    }
  }, [record]);

  return (
    <Show
      title="Article"
      headerButtons={({ deleteButtonProps, editButtonProps }) => (
        <>
          {editButtonProps && (
            <EditButton {...editButtonProps} meta={{ foo: 'bar' }} />
          )}
          {deleteButtonProps && (
            <DeleteButton {...deleteButtonProps} meta={{ foo: 'bar' }} />
          )}
        </>
      )}
      isLoading={isLoading}
    >
      <Flex
        style={{
          flexDirection: 'column',
          width: '100%',
        }}
      >
        {record?.coverPhoto?.key && (
          <Image
            wrapperStyle={{
              maxWidth: '60%',
              alignSelf: 'center',
              marginBottom: 20,
            }}
            src={coverPhoto}
          />
        )}

        {record?.tag && (
          <TagField
            style={{ alignSelf: 'flex-start', marginBottom: 20 }}
            value={record?.tag}
          />
        )}

        <Title style={{ textAlign: 'center' }} level={3}>
          {record?.title}
        </Title>

        <Title style={{ textAlign: 'center', marginBottom: 30 }} level={5}>
          {record?.subtitle}
        </Title>

        {record?.body[0] && (
          <TextField
            style={{
              textAlign: 'justify',
              marginBottom: 20,
              whiteSpace: 'pre-line',
            }}
            value={record?.body[0]}
          />
        )}

        {record?.photos[0].key && (
          <Image
            wrapperStyle={{
              maxWidth: '60%',
              alignSelf: 'center',
              marginBottom: 20,
            }}
            src={paragraphOnePicture}
          />
        )}

        {record?.body[1] && (
          <TextField
            style={{
              textAlign: 'justify',
              marginBottom: 20,
              whiteSpace: 'pre-line',
            }}
            value={record?.body[1]}
          />
        )}

        {record?.photos[1]?.key && (
          <Image
            wrapperStyle={{
              maxWidth: '60%',
              alignSelf: 'center',
              marginBottom: 20,
            }}
            src={paragraphTwoPicture}
          />
        )}

        {record?.body[2] && (
          <TextField
            style={{
              textAlign: 'justify',
              marginBottom: 20,
              whiteSpace: 'pre-line',
            }}
            value={record?.body[2]}
          />
        )}

        {record?.photos[2]?.key && (
          <Image
            wrapperStyle={{
              maxWidth: '60%',
              alignSelf: 'center',
              marginBottom: 20,
            }}
            src={paragraphThreePicture}
          />
        )}
      </Flex>
    </Show>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/article');
};

export default ArticleShow;
