import { FadeIn, FadeOut } from 'react-native-reanimated';
import { Icon } from '../Icon/Icon';
import { Text } from '../Text/Text';
import {
  AnimatedView,
  IconContainer,
  Tail,
  TextContainer,
  TipDialogContainer,
} from './styles';

const TipDialog = ({
  message,
  onClose = () => {},
}: {
  message: string;
  onClose: () => void;
}) => (
    <AnimatedView  entering={FadeIn} exiting={FadeOut} >
      <TipDialogContainer>
        <Icon size={14} color="white" name="info" />
        <TextContainer>
          <Text size={10}>{message}</Text>
        </TextContainer>
        <IconContainer
          onPress={() => {
            onClose();
          }}
        >
          <Icon size={12} name="close" color="white" />
        </IconContainer>
        <Tail />
      </TipDialogContainer>
    </AnimatedView>
  );
export { TipDialog };
