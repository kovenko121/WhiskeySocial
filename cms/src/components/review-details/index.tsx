import { DeleteButton, TextField } from '@refinedev/antd';
import { useTranslate } from '@refinedev/core';
import { Flex, Rate, Typography } from 'antd';

const { Title } = Typography;
export const ReviewDetails = ({
  username,
  id,
  description,
  title,
  whiskeyId,
  whiskeyFullName,
  rating,
  refetch,
}: {
  username?: string | undefined;
  id: string;
  description?: string | undefined;
  whiskeyId?: string | undefined;
  whiskeyFullName?: string | undefined;
  title?: string | undefined;
  rating?: number | undefined;
  refetch: () => void;
}) => {
  const translate = useTranslate();
  return (
    <>
      <Title level={5}>{translate('review.fields.user.username')}</Title>
      <TextField value={username} />

      {rating && (
        <>
          <Title level={5}>{translate('review.fields.rating')}</Title>
          <Rate disabled value={rating} />
        </>
      )}

      {title && (
        <>
          <Title level={5}>{translate('review.fields.title')}</Title>
          <TextField value={title} />
        </>
      )}

      {description && (
        <>
          <Title level={5}>{translate('review.fields.description')}</Title>
          <TextField value={description} />
        </>
      )}

      {whiskeyId && (
        <>
          <Title level={5}>{translate('review.fields.whiskeyId')}</Title>
          <TextField value={whiskeyId} />
        </>
      )}

      {whiskeyFullName && (
        <>
          <Title level={5}>{translate('review.fields.whiskey.fullName')}</Title>
          <TextField value={whiskeyFullName} />
        </>
      )}

      <Flex>
        <DeleteButton
          style={{ marginTop: 20 }}
          confirmTitle="Delete this review?"
          resource="review"
          recordItemId={id}
          onSuccess={() => refetch()}
        />
      </Flex>
    </>
  );
};
