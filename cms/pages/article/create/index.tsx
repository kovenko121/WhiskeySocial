import { Create, useForm } from '@refinedev/antd';
import { useTranslate } from '@refinedev/core';
import { ButtonProps, Flex, Form, Input } from 'antd';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { UpdatePictureContainer } from '@components/update-picture-container';
import TextArea from 'antd/lib/input/TextArea';
import { useState } from 'react';
import { authOptions } from '../../api/auth/[...nextauth]';
import { handleServerSideProps } from 'src/utils/serverSideProps';

const ArticleCreate = () => {
  const translate = useTranslate();

  const keyEmptyFile = {
    file: null,
  };

  const [body1, setBody1] = useState<string>('');
  const [body2, setBody2] = useState<string>('');
  const [body3, setBody3] = useState<string>('');

  const [photo1, setPhoto1] = useState<any>(keyEmptyFile);
  const [photo2, setPhoto2] = useState<any>(keyEmptyFile);
  const [photo3, setPhoto3] = useState<any>(keyEmptyFile);

  const { formProps, onFinish } = useForm({
    redirect: 'show',
  });

  const [saving, setIsSaving] = useState(false);

  const handleOnFinish = () => {
    setIsSaving(true);
    onFinish();
  };

  const saveButtonProps: ButtonProps = {
    onClick: () => {
      if (!formProps.form?.getFieldValue('coverPhoto')) {
        formProps.form?.setFieldValue('coverPhoto', keyEmptyFile);
      }
      if (!formProps.form?.getFieldValue('subtitle')) {
        formProps.form?.setFieldValue('subtitle', '');
      }
      formProps.form?.setFieldValue('body', [body1, body2, body3]);
      formProps.form?.setFieldValue('photos', [photo1, photo2, photo3]);
      formProps.form?.submit();
    },
    loading: saving,
  };

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} onFinish={handleOnFinish} layout="vertical">
        <Flex
          style={{
            flexDirection: 'column',
            width: '100%',
          }}
        >
          <Form.Item
            label={translate('article.fields.coverPhoto')}
            name={['coverPhoto']}
            style={{ marginBottom: 60 }}
          >
            <UpdatePictureContainer
              noCurrentPicture
              onRemoveUploadedPicture={() => {
                formProps.form?.setFieldValue('coverPhoto', keyEmptyFile);
              }}
              onChangeDragger={(e) => {
                if (e.file.status === 'uploading') {
                  formProps.form?.setFieldValue('coverPhoto', e);
                }
              }}
            />
          </Form.Item>

          <Form.Item
            label={translate('article.fields.tag')}
            name={['tag']}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={translate('article.fields.title')}
            name={['title']}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={translate('article.fields.subtitle')}
            name={['subtitle']}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Paragraphs and Pictures" name={['body']}>
            <Form.Item style={{ marginBottom: 60 }}>
              <TextArea
                defaultValue={body1}
                placeholder="Paragraph 1 content"
                rows={9}
                onChange={(e) => {
                  setBody1(e.currentTarget.value);
                }}
              />
              <br />
              <br />
              <UpdatePictureContainer
                noCurrentPicture
                onRemoveUploadedPicture={() => {
                  setPhoto1(keyEmptyFile);
                }}
                onChangeDragger={(e) => {
                  if (e.file.status === 'uploading') {
                    setPhoto1(e);
                  }
                }}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 60 }}>
              <TextArea
                defaultValue={body2}
                placeholder="Paragraph 2 content"
                rows={9}
                onChange={(e) => {
                  setBody2(e.currentTarget.value);
                }}
              />
              <br />
              <br />
              <UpdatePictureContainer
                noCurrentPicture
                onRemoveUploadedPicture={() => {
                  setPhoto2(keyEmptyFile);
                }}
                onChangeDragger={(e) => {
                  if (e.file.status === 'uploading') {
                    setPhoto2(e);
                  }
                }}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 60 }} name={['photos']}>
              <TextArea
                value={body3}
                placeholder="Paragraph 3 content"
                rows={9}
                onChange={(e) => {
                  setBody3(e.currentTarget.value);
                }}
              />
              <br />
              <br />
              <UpdatePictureContainer
                noCurrentPicture
                onRemoveUploadedPicture={() => {
                  setPhoto3(keyEmptyFile);
                }}
                onChangeDragger={(e) => {
                  if (e.file.status === 'uploading') {
                    setPhoto3(e);
                  }
                }}
              />
            </Form.Item>
          </Form.Item>
        </Flex>
      </Form>
    </Create>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/article');
};

export default ArticleCreate;
