import { getTestId } from '@helpers';
import { useNavigation } from '@react-navigation/native';
import { Routes } from '@types';
import type { Icons as IconsNames, NavigationProps
} from '@types';
import { Icon } from '../../Icon/Icon';
import { Text } from '../../Text/Text';
import { BadgeContainer, HeaderContainer, IconContainer, RightActionsContainer } from './styles';

type Props = {
  navBack?: () => void;
  action?: () => void;
  actionIcon?: IconsNames;
  secondaryAction?: () => void;
  secondaryActionIcon?: IconsNames;
  secondaryActionBadgeCount?: number;
};

export const AbsoluteHeader = ({ navBack, action, actionIcon, secondaryAction, secondaryActionIcon, secondaryActionBadgeCount }: Props) => {
  const navigation = useNavigation<NavigationProps>();

  const clickBack = () => {
    if (navBack) {
      navBack();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate(Routes.Home);
    }
  };

  return (
    <HeaderContainer>
      <IconContainer onPress={clickBack} testID={getTestId('Navigation Back')}>
        <Icon name="left" size={16} color="primary" />
      </IconContainer>
      <RightActionsContainer>
        {actionIcon && (
          <IconContainer onPress={action} testID={getTestId('options')}>
            <Icon name={actionIcon as IconsNames} size={16} color="primary" />
          </IconContainer>
        )}
        {secondaryActionIcon && (
          <IconContainer onPress={secondaryAction} testID={getTestId('secondary-action')}>
            <Icon name={secondaryActionIcon} size={16} color="primary" />
            {!!secondaryActionBadgeCount && secondaryActionBadgeCount > 0 && (
              <BadgeContainer>
                <Text size={10} color="white" bold>
                  {secondaryActionBadgeCount > 99 ? '99+' : secondaryActionBadgeCount}
                </Text>
              </BadgeContainer>
            )}
          </IconContainer>
        )}
      </RightActionsContainer>
    </HeaderContainer>
  );
};
