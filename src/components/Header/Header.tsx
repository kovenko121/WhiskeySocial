import { getTestId } from '@helpers';
import { useNavigation } from '@react-navigation/native';
import type { Icons as IconsNames, NavigationProps } from '@types';
import { ActivityIndicator } from 'react-native';
import { Icon } from '../Icon/Icon';
import { Title } from '../Text/Text';
import {
  ActivityIndicatorContainer,
  HeaderContainer,
  IconContainer,
  Section,
  TitleSection,
} from './styles';

type Props = {
  navBack?: () => void;
  title?: string;
  action?: () => void;
  actionIcon?: IconsNames;
  actionText?: string;
  absolute?: boolean;
  loading?: boolean;
};

export const Header = ({
  navBack,
  title,
  action = () => {},
  actionIcon,
  actionText,
  absolute = false,
  loading = false,
}: Props) => {
  const navigation = useNavigation<NavigationProps>();

  const clickBack = () => {
    if (navBack) {
      navBack();
    } else {
      navigation.goBack();
    }
  };

  return (
    <HeaderContainer absolute={absolute}>
      <Section>
        <IconContainer
          onPress={clickBack}
          testID={getTestId('Navigation Back')}
        >
          <Icon name="left" size={16} color="primary600" />
        </IconContainer>
      </Section>

      <TitleSection>
        <Title size={18} color="primary500" mv={6}>
          {title}
        </Title>
      </TitleSection>

      <Section>
        {(() => {
          if (loading) {
            return (
              <ActivityIndicatorContainer>
                <ActivityIndicator />
              </ActivityIndicatorContainer>
            );
          }
          if (actionIcon) {
            return (
              <IconContainer onPress={action}>
                <Icon
                  name={actionIcon as IconsNames}
                  size={22}
                  color="primary600"
                />
              </IconContainer>
            );
          }
          return (
            <IconContainer onPress={action}>
              {actionText && (
                <Title size={12} color="primary600">
                  {actionText}
                </Title>
              )}
            </IconContainer>
          );
        })()}
      </Section>
    </HeaderContainer>
  );
};
