import { getTestId } from '@helpers';
import { theme } from '@theme';
import { DefaultTheme } from 'styled-components/native';
import { Icon } from '../Icon/Icon';
import {
  FallbackContainer,
  IconContainer,
  Picture,
  PictureClick,
  PictureContainer,
  PictureRound,
} from './styles';

type Props = {
  image: any;
  editable?: boolean;
  border?: boolean;
  disabled?: boolean;
  size?: 'large' | 'normal' | 'small' | 'x-small' | 'xx-small';
  absolute?: number | null;
  borderColor?: keyof DefaultTheme['colors'];
  onPress?: () => void;
};

const ProfilePicture = ({
  image,
  editable = false,
  size = 'normal',
  border = false,
  absolute = null,
  disabled = false,
  borderColor = 'primary500',
  onPress,
}: Props) => {
  const iconSizes: { [key: string]: number } = {
    large: 13,
    normal: 8,
    small: 4,
  };

  const fallbackIconSizes: { [key: string]: number } = {
    large: 48,
    normal: 24,
    small: 20,
    'x-small': 12,
    'xx-small': 10,
  };

  return (
    <PictureContainer absolute={absolute}>
      <PictureClick
        testID={getTestId('profile-image')}
        size={size}
        border={border}
        onPress={onPress}
        disabled={disabled}
      >
        <PictureRound
          size={size}
          border={border}
          borderColor={theme.colors[borderColor]}
        >
          {image ? (
            <Picture source={image} size={size} />
          ) : (
            <FallbackContainer size={size}>
              <Icon name="user" size={fallbackIconSizes[size] || 16} color="grey200" />
            </FallbackContainer>
          )}
        </PictureRound>

        {editable && (
          <IconContainer size={size}>
            <Icon name="edit" size={iconSizes[size]} />
          </IconContainer>
        )}
      </PictureClick>
    </PictureContainer>
  );
};

export { ProfilePicture };
