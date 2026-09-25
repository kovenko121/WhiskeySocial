import { getTestId } from '@helpers';
import { Icons } from '@types';
import { Icon } from '../../Icon/Icon';
import { ProfilePicture } from '../../ProfilePicture/ProfilePicture';
import { CardTitle, Secondary } from '../../Text/Text';
import {
  CardButtonContainer,
  IconWrapper,
  ProfilePictureContainer,
  TextWrapper,
} from './styles';

const CardButton = ({
  icon,
  profilePicture,
  title,
  content,
  active,
  onPress,
  mv,
  disabled,
  variant,
}: {
  icon?: Icons;
  profilePicture?: { uri: string } | undefined;
  title: string;
  content: string;
  active?: boolean;
  onPress?: () => void;
  mv?: number;
  disabled?: boolean;
  variant?: string;
}) => (
  <CardButtonContainer
    onPress={onPress || (() => {})}
    active={active}
    mv={mv}
    disabled={disabled}
    testID={getTestId(title)}
    variant={variant}
    activeOpacity={onPress ? 0.3 : 1}
  >
    {icon && (
      <IconWrapper>
        <Icon name={icon} color={variant || 'primary500'} size={30} />
      </IconWrapper>
    )}
    {profilePicture && (
      <ProfilePictureContainer>
        <ProfilePicture image={profilePicture} size="small" />
      </ProfilePictureContainer>
    )}
    <TextWrapper>
      <CardTitle>{title}</CardTitle>
      <Secondary color={variant || 'neutral300'}>{content}</Secondary>
    </TextWrapper>
  </CardButtonContainer>
);

export { CardButton };
