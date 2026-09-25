import { Icon, ProfilePicture } from '@components';
import { useGetUser } from '@hooks';
import { UserType } from '@types';
import { Container, IconContainer, PlaceholderText, TextContainer } from './styles';

interface CreatePostButtonProps {
  onPress: () => void;
}

const CreatePostButton = ({ onPress }: CreatePostButtonProps) => {
  const { data: user } = useGetUser();

  const profileImage =
    user?.userType === UserType.BRAND
      ? user?.brandLogoLoaded || user?.profilePictureLoaded
      : user?.profilePictureLoaded;

  return (
    <Container onPress={onPress} activeOpacity={0.7}>
      <ProfilePicture image={profileImage} size="small" border disabled />
      <TextContainer>
        <PlaceholderText>What are you drinking?</PlaceholderText>
      </TextContainer>
      <IconContainer>
        <Icon name="picture" size={18} color="grey100" />
      </IconContainer>
    </Container>
  );
};

export { CreatePostButton };
