import { useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { Icon } from '../Icon/Icon';
import { Text } from '../Text/Text';
import {
  ActivityIndicatorContainer,
  Button,
  ButtonContainer,
  ButtonSection,
  IconContainer,
  TextContainer,
} from './styles';

type Props = {
  options: {
    id: string;
    title: string;
    icon: string;
    action: () => void;
  }[];
  alignItems: string;
  paddingBottom?: number;
  paddingLeft?: number;
  setVisibleStatus: (newValue: boolean) => void;
  setIsClosingStatus?: (newValue: boolean) => void;
  reverse?: boolean;
  width?: number;
  showLoading?: boolean;
};

const PopUpMenu = ({
  options,
  alignItems,
  paddingBottom = 200,
  paddingLeft = 0,
  setVisibleStatus,
  setIsClosingStatus,
  reverse = false,
  width = 50,
  showLoading = true,
}: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const handlePress = (action: () => void) => {
    if (isLoading === false && action !== undefined && action !== null) {
      if (showLoading) setIsLoading(true);
      action();
    }
  };

  const closeMenu = () => {
    if (setIsClosingStatus) {
      setIsClosingStatus(true);
      setVisibleStatus(false);
      setTimeout(() => setIsClosingStatus(false), 100);
    } else {
      setVisibleStatus(false);
    }
  };

  return (
    <ButtonSection
      alignItems={alignItems}
      paddingBottom={paddingBottom}
      paddingLeft={paddingLeft}
    >
      <ButtonContainer onOutsidePress={closeMenu} width={width}>
        {options.map(({ id, title, icon, action }) => (
          <Button
            reverse={reverse}
            key={title}
            onPress={() => handlePress(action)}
            testID={id}
          >
            {isLoading ? (
              <ActivityIndicatorContainer>
                <ActivityIndicator />
              </ActivityIndicatorContainer>
            ) : (
              <TextContainer reverse={reverse}>
                <IconContainer testID={id}>
                  <Icon name={icon} color="white" size={16} />
                </IconContainer>
                <Text color="white" bold>
                  {title}
                </Text>
              </TextContainer>
            )}
          </Button>
        ))}
      </ButtonContainer>
    </ButtonSection>
  );
};

export { PopUpMenu };
