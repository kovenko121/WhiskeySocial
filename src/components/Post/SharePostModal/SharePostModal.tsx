import { FC, useState } from 'react';
import { Keyboard } from 'react-native';
import { Post, UserType } from '@types';
import { ModalBottom } from '../../ModalBottom/ModalBottom';
import { Input } from '../../Input/Input';
import { Text } from '../../Text/Text';
import {
  Container,
  InputContainer,
  PreviewContainer,
  PreviewHeader,
  PreviewContent,
  AuthorInfo,
  SubmitButton,
  ButtonContainer,
} from './styles';

interface SharePostModalProps {
  visible: boolean;
  onClose: () => void;
  post: Post;
  onSubmit: (comment: string) => void;
}

export const SharePostModal: FC<SharePostModalProps> = ({
  visible,
  onClose,
  post,
  onSubmit,
}) => {
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    onSubmit(comment);
    setComment('');
    Keyboard.dismiss();
  };

  const handleClose = () => {
    setComment('');
    onClose();
  };

  const getAuthorName = () => {
    if (!post.author) return 'Unknown';

    if (post.author.userType === UserType.PERSON) {
      return `${post.author.personFirstName} ${post.author.personLastName}`;
    }
    if (post.author.userType === UserType.BRAND) {
      return post.author.brandName;
    }
    return post.author.venueName;
  };

  const getPostTitle = () => {
    if (!post.title || !post.references || post.references.length === 0) {
      return post.title || '';
    }

    return post.title.split(' ').map((word) => {
      if (word.startsWith('$')) {
        const referenceIndex = parseInt(word.substring(1), 10);
        const reference = post.references?.[referenceIndex];
        return reference?.name || word;
      }
      return word;
    }).join(' ');
  };

  return (
    <ModalBottom visible={visible} onBackButtonPress={handleClose}>
      <Container>
        <Text bold size={16} align="center" style={{ paddingTop: 8 }}>
          Share with Comment
        </Text>

        <InputContainer>
          <Input
            placeholder="Add your thoughts (optional)"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
        </InputContainer>

        <PreviewContainer>
          <PreviewHeader>
            <Text size={12} color="grey100">
              Original Post
            </Text>
          </PreviewHeader>
          <PreviewContent>
            <AuthorInfo>
              <Text bold size={12}>
                {getAuthorName()}
              </Text>
            </AuthorInfo>
            {post.description && (
              <Text size={12} color="grey25" numberOfLines={3}>
                {post.description}
              </Text>
            )}
            {post.title && (
              <Text size={12} color="grey25" numberOfLines={2}>
                {getPostTitle()}
              </Text>
            )}
          </PreviewContent>
        </PreviewContainer>

        <ButtonContainer>
          <SubmitButton onPress={handleSubmit}>
            <Text bold size={14} color="white">
              Share
            </Text>
          </SubmitButton>
        </ButtonContainer>
      </Container>
    </ModalBottom>
  );
};
