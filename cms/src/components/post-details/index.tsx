import { DeleteButton, TextField } from '@refinedev/antd';
import { useTranslate } from '@refinedev/core';
import { Flex, Image, Typography } from 'antd';

const { Title } = Typography;
export const PostDetails = ({
  picture,
  username,
  id,
  description,
  refetch,
}: {
  picture?: string | undefined;
  username?: string | undefined;
  id: string;
  description?: string | undefined;
  refetch: () => void;
}) => {
  const translate = useTranslate();
  return (
    <>
      <Title level={5}>{translate('post.fields.author.username')}</Title>
      <TextField value={username} />

      {description && (
        <>
          <Title level={5}>{translate('post.fields.description')}</Title>
          <TextField value={description} />
        </>
      )}

      <Title level={5}>{translate('post.fields.photo')}</Title>
      {picture && (
        <Flex style={{ justifyContent: 'center', flexDirection: 'column' }}>
          <Image
            wrapperStyle={{
              maxWidth: '60%',
              alignSelf: 'center',
              marginBottom: 20,
            }}
            src={picture}
          />
        </Flex>
      )}

      <DeleteButton
        confirmTitle="Delete this post?"
        resource="post"
        recordItemId={id}
        onSuccess={refetch}
      />
    </>
  );
};
