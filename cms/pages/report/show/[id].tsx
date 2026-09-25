import { GetServerSideProps } from 'next';

import { DeleteOutlined } from '@ant-design/icons';
import { CommentDetails } from '@components/comment-details';
import { PostDetails } from '@components/post-details';
import { ReviewDetails } from '@components/review-details';
import { DeleteButton, Show, TextField } from '@refinedev/antd';
import { useOne, useShow, useTranslate } from '@refinedev/core';
import { Divider, Flex, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { getObject } from 'src/graphql-data-provider/utils/s3';
import { handleServerSideProps } from '../../../src/utils/serverSideProps';

const { Title } = Typography;

const ReportShow = () => {
  const translate = useTranslate();
  const { queryResult } = useShow({
    resource: 'report',
  });

  const { data, isLoading } = queryResult;

  const record = data?.data;

  const {
    data: reportedContent,
    isLoading: isLoadingContent,
    refetch,
  } = useOne<any>({
    resource: record?.contentType.toString().toLowerCase(),
    id: record?.contentId,
    errorNotification: () => ({
      message: `Error while loading the reported content details`,
      description: 'Error',
      type: 'error',
    }),
  });

  const [reportedContentPicture, setreportedContentPicture] = useState<
    string | undefined
  >();

  const getPicture = async (key: string) => {
    const result = await getObject(key);
    setreportedContentPicture(result);
  };

  useEffect(() => {
    if (reportedContent?.data) {
      switch (record?.contentType) {
        case 'POST':
          getPicture(reportedContent?.data?.photo?.key);
          break;

        default:
          break;
      }
    }
  }, [record?.contentType, reportedContent]);

  return (
    <Show
      isLoading={isLoading || isLoadingContent}
      headerButtons={({ deleteButtonProps }) =>
        deleteButtonProps && <DeleteButton {...deleteButtonProps} />
      }
    >
      <Title level={5}>{translate('report.fields.id')}</Title>
      <TextField value={record?.id} />

      <Title level={5}>{translate('report.fields.contentType')}</Title>
      <TextField value={record?.contentType} />

      <Title level={5}>{translate('report.fields.contentId')}</Title>
      <TextField value={record?.contentId} />

      <Title level={5}>{translate('report.fields.reason')}</Title>
      <TextField value={record?.reason} />

      {record?.reason === 'Other' && record.description && (
        <>
          <Title level={5}>{translate('report.fields.description')}</Title>
          <TextField value={record?.description} />
        </>
      )}

      <Title level={5}>{translate('report.fields.reportedUserId')}</Title>
      <TextField value={record?.reportedUserId} />

      <Title level={5}>{translate('report.fields.createdAt')}</Title>
      <TextField value={record?.createdAt} />

      {reportedContent?.data ? (
        <>
          <Divider />

          <Title level={4}>{translate('report.contentDetails')}</Title>

          {record?.contentType === 'POST' && (
            <PostDetails
              username={reportedContent?.data?.author?.username}
              id={reportedContent?.data?.id}
              picture={reportedContentPicture}
              description={reportedContent?.data.description}
              refetch={refetch}
            />
          )}

          {record?.contentType === 'COMMENT' && (
            <CommentDetails
              username={reportedContent?.data?.author?.username}
              id={reportedContent?.data?.id}
              text={reportedContent?.data?.text}
              refetch={refetch}
            />
          )}

          {record?.contentType === 'REVIEW' && (
            <ReviewDetails
              username={reportedContent?.data?.user?.username}
              id={reportedContent?.data?.id}
              title={reportedContent?.data?.title}
              description={reportedContent?.data?.description}
              rating={reportedContent?.data?.rating}
              whiskeyId={reportedContent?.data?.whiskeyId}
              whiskeyFullName={reportedContent?.data.whiskey.fullName}
              refetch={refetch}
            />
          )}

          <Divider />
        </>
      ) : (
        <Flex style={{ alignItems: 'center', flexDirection: 'column' }}>
          <Title level={4}>{translate('report.contentDetails')}</Title>
          <DeleteOutlined style={{ fontSize: 30, marginTop: 30 }} />
          <Title level={5}>{translate('report.contentDeleted')}</Title>
        </Flex>
      )}
    </Show>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/report');
};

export default ReportShow;
