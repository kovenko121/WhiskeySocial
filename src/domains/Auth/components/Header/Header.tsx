import { Icon } from '@components';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProps } from '@types';
import LogoImg from '../../../../../assets/images/logo-dark.png';
import {
  HeaderContainer,
  IconContainer,
  LogoImageComponent,
  LogoWrapper,
} from './styles';

type LogoProps = {
  mb?: number;
  mt?: number;
  navBack?: () => void;
  noBack?: boolean;
};

export const Header = ({ mt, mb, navBack, noBack = false }: LogoProps) => {
  const navigation = useNavigation<NavigationProps>();
  const clickBack = () => {
    if (navBack) {
      navBack();
    } else {
      navigation.goBack();
    }
  };

  return (
    <HeaderContainer mt={mt} mb={mb}>
      {!noBack ? (
        <IconContainer onPress={clickBack}>
          <Icon name="left" size={18} color="primary600" />
        </IconContainer>
      ) : (
        <IconContainer />
      )}
      <LogoWrapper>
        <LogoImageComponent source={LogoImg} resizeMode="contain" />
      </LogoWrapper>
    </HeaderContainer>
  );
};
