import { PictureContainer, ProfileBackgroundImage } from './styles';

const ProfileBackgroundPicture = ({
  coverPicture,
  children,
}: {
  coverPicture?:
    | string
    | {
        uri: string;
      };
  children?: JSX.Element;
}) => (
  <PictureContainer>
    <ProfileBackgroundImage source={coverPicture}>
      {children}  
    </ProfileBackgroundImage>
  </PictureContainer>
);

export { ProfileBackgroundPicture };
