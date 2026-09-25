import { DeleteButton, TextField } from '@refinedev/antd';
import { useTranslate } from '@refinedev/core';
import { Flex, Typography } from 'antd';

const { Title } = Typography;
export const CommentDetails = ({
  username,
  id,
  text,
  refetch,
}: {
  username?: string | undefined;
  id: string;
  text?: string | undefined;
  refetch: () => void;
}) => {
  const translate = useTranslate();
  return (
    <>
      <Title level={5}>{translate('comment.fields.author.username')}</Title>
      <TextField value={username} />

      {text && (
        <>
          <Title level={5}>{translate('comment.fields.text')}</Title>
          <TextField value={text} />
        </>
      )}

      <Flex>
        <DeleteButton
          style={{ marginTop: 20 }}
          confirmTitle="Delete this comment?"
          resource="comment"
          recordItemId={id}
          onSuccess={() => refetch()}
        />
      </Flex>
    </>
  );
};
