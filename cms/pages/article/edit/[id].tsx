import { Edit, SaveButton, useForm } from '@refinedev/antd';
import {
  useCustomMutation,
  useOne,
  useParsed,
  useTranslate,
} from '@refinedev/core';
import { Button, ButtonProps, Flex, Form, Input, Popconfirm } from 'antd';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { DeleteOutlined } from '@ant-design/icons';
import { UpdatePictureContainer } from '@components/update-picture-container';
import router from 'next/router';
import { useEffect, useState } from 'react';
import { Article } from 'src/graphql-data-provider/utils/graphQlTypes';
import { getObject } from 'src/graphql-data-provider/utils/s3';
import { authOptions } from '../../api/auth/[...nextauth]';
import { handleServerSideProps } from 'src/utils/serverSideProps';

const { TextArea } = Input;

const ArticleEdit = () => {
  const translate = useTranslate();

  const { id } = useParsed();

  const { mutate: deleteMutation, isLoading: isDeleting } = useCustomMutation();

  const { data: record, isLoading } = useOne<Article>({
    id,
    errorNotification: () => ({
      message: `Error while loading the article details`,
      description: 'Error',
      type: 'error',
    }),
  });

  const [body1, setBody1] = useState<string | null>('');
  const [body2, setBody2] = useState<string | null>('');
  const [body3, setBody3] = useState<string | null>('');

  const [paragraphPhotos, setParagraphPhotos] = useState<any>([{}, {}, {}]);

  const [coverPicture, setCoverPicture] = useState<string | undefined>();
  const [paragraphOnePicture, setParagraphOnePicture] = useState<
    string | undefined
  >();
  const [paragraphTwoPicture, setParagraphTwoPicture] = useState<
    string | undefined
  >();
  const [paragraphThreePicture, setParagraphThreePicture] = useState<
    string | undefined
  >();

  const getCoverPicture = async (key: string) => {
    const result = await getObject(key);
    setCoverPicture(result);
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
    if (record) {
      if (record.data) {
        if (record?.data.coverPhoto) {
          getCoverPicture(record?.data.coverPhoto?.key);
        }

        if (record?.data.photos !== null) {
          if (typeof record.data.photos[0] !== undefined) {
            getParagraphOnePicture(record!.data!.photos[0]!.key);
          }
          if (typeof record.data.photos[1] !== undefined) {
            getParagraphTwoPicture(record!.data!.photos[1]!.key);
          }
          if (typeof record.data.photos[2] !== undefined) {
            getParagraphThreePicture(record!.data!.photos[2]!.key);
          }
        }
        if (typeof record?.data.body !== undefined) {
          setBody1(record.data.body[0]);
          setBody2(record.data.body[1]);
          setBody3(record.data.body[2]);
        }
        if (typeof record.data.photos !== undefined) {
          setParagraphPhotos(record.data.photos);
        }
      }
    }
  }, [record, record?.data?.body]);

  const keyEmptyFile = {
    file: null,
  };

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
      formProps.form?.setFieldValue('body', [body1, body2, body3]);
      formProps.form?.setFieldValue('photos', paragraphPhotos);
      formProps.form?.submit();
    },
    loading: saving,
  };

  const deleteGuidesMutation = `
    mutation DeleteGuides($id: ID!) {
      deleteGuides(input: {id: $id}) {
        id
      }
    }
  `;

  const deleteGuides = async () => {
    deleteMutation(
      {
        url: '',
        method: 'post',
        meta: {
          query: deleteGuidesMutation,
          queryName: 'deleteGuides',
          variables: {
            id,
          },
        },
        errorNotification: () => ({
          message: `Something went wrong`,
          description: 'Error',
          type: 'error',
        }),
        successNotification: () => ({
          message: `Article deleted succesfully`,
          description: 'Success',
          type: 'success',
        }),
        values: {},
      },
      {
        onSuccess: () => {
          router.push(`/article`);
        },
      }
    );
  };

  return (
    <Edit
      title="Edit Article"
      headerButtonProps={{
        style: {
          padding: '16px',
        },
      }}
      headerButtons={() => (
        <>
          <Popconfirm
            title="Are you sure?"
            onConfirm={deleteGuides}
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
      isLoading={isLoading}
    >
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
              noCurrentPicture={record?.data?.coverPhoto?.key === ''}
              currentPicture={coverPicture}
              onDeleteCurrentPicture={() => {
                formProps.form?.setFieldValue('coverPhoto', keyEmptyFile);
                setCoverPicture(undefined);
              }}
              deleteDisabled={!coverPicture}
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

          <Form.Item label={translate('article.fields.tag')} name={['tag']}>
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

          {
            // These items must be kept here so that the form knows
            // they exist and put them in mutation variables
            <>
              <Form.Item style={{ marginBottom: 0 }} name={['photos']} />
              <Form.Item
                style={{ marginBottom: 0 }}
                label="Paragraphs and Pictures"
                name={['body']}
              />
            </>
          }

          <Form.Item style={{ marginBottom: 60 }}>
            <TextArea
              value={body1 || ''}
              placeholder="Paragraph 1 content"
              rows={9}
              onChange={(e) => {
                setBody1(e.currentTarget.value);
              }}
            />
            <br />
            <br />
            <UpdatePictureContainer
              noCurrentPicture={
                record?.data?.photos
                  ? record?.data?.photos[0]?.key === ''
                  : false
              }
              currentPicture={paragraphOnePicture}
              onDeleteCurrentPicture={() => {
                setParagraphPhotos(
                  paragraphPhotos.map((item: any) => {
                    if (item === paragraphPhotos[0]) {
                      return keyEmptyFile;
                    }
                    return item;
                  })
                );
                setParagraphOnePicture(undefined);
              }}
              deleteDisabled={!paragraphOnePicture}
              onRemoveUploadedPicture={() => {
                setParagraphPhotos(
                  paragraphPhotos.map((item: any) => {
                    if (item === paragraphPhotos[0]) {
                      return keyEmptyFile;
                    }
                    return item;
                  })
                );
              }}
              onChangeDragger={(e) => {
                if (e.file.status === 'uploading') {
                  setParagraphPhotos(
                    paragraphPhotos.map((item: any) => {
                      if (item === paragraphPhotos[0]) {
                        return e;
                      }
                      return item;
                    })
                  );
                }
              }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 60 }}>
            <TextArea
              value={body2 || ''}
              placeholder="Paragraph 2 content"
              rows={9}
              onChange={(e) => {
                setBody2(e.currentTarget.value);
              }}
            />
            <br />
            <br />
            <UpdatePictureContainer
              noCurrentPicture={
                record?.data?.photos
                  ? record?.data?.photos[1]?.key === ''
                  : false
              }
              currentPicture={paragraphTwoPicture}
              onDeleteCurrentPicture={() => {
                setParagraphPhotos(
                  paragraphPhotos.map((item: any) => {
                    if (item === paragraphPhotos[1]) {
                      return keyEmptyFile;
                    }
                    return item;
                  })
                );
                setParagraphTwoPicture(undefined);
              }}
              deleteDisabled={!paragraphTwoPicture}
              onRemoveUploadedPicture={() => {
                setParagraphPhotos(
                  paragraphPhotos.map((item: any) => {
                    if (item === paragraphPhotos[1]) {
                      return keyEmptyFile;
                    }
                    return item;
                  })
                );
              }}
              onChangeDragger={(e) => {
                if (e.file.status === 'uploading') {
                  setParagraphPhotos(
                    paragraphPhotos.map((item: any) => {
                      if (item === paragraphPhotos[1]) {
                        return e;
                      }
                      return item;
                    })
                  );
                }
              }}
            />

            <Form.Item style={{ marginBottom: 60 }}>
              <TextArea
                value={body3 || ''}
                placeholder="Paragraph 3 content"
                rows={9}
                onChange={(e) => {
                  setBody3(e.currentTarget.value);
                }}
              />
              <br />
              <br />
              <UpdatePictureContainer
                noCurrentPicture={
                  record?.data?.photos
                    ? record?.data?.photos[2]?.key === ''
                    : false
                }
                currentPicture={paragraphThreePicture}
                onDeleteCurrentPicture={() => {
                  setParagraphPhotos(
                    paragraphPhotos.map((item: any) => {
                      if (item === paragraphPhotos[2]) {
                        return keyEmptyFile;
                      }
                      return item;
                    })
                  );
                  setParagraphThreePicture(undefined);
                }}
                deleteDisabled={!paragraphThreePicture}
                onRemoveUploadedPicture={() => {
                  setParagraphPhotos(
                    paragraphPhotos.map((item: any) => {
                      if (item === paragraphPhotos[2]) {
                        return keyEmptyFile;
                      }
                      return item;
                    })
                  );
                }}
                onChangeDragger={(e) => {
                  if (e.file.status === 'uploading') {
                    setParagraphPhotos(
                      paragraphPhotos.map((item: any) => {
                        if (item === paragraphPhotos[2]) {
                          return e;
                        }
                        return item;
                      })
                    );
                  }
                }}
              />
            </Form.Item>
          </Form.Item>
        </Flex>
      </Form>
    </Edit>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/article');
};

export default ArticleEdit;
