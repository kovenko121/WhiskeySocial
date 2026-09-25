import Modal from 'react-native-modal';
import { isIos } from '@helpers';
import {
  ActiveBar,
  ActiveBarContainer,
  ContentContainer,
  ModalVariants,
} from './styles';

type ModalBottomProps = {
  visible: boolean;
  onBackButtonPress?: () => void;
  children?: JSX.Element;
  variant?: ModalVariants;
  onModalShow?: () => void;
};

const ModalBottom = ({
  visible,
  onBackButtonPress,
  children,
  variant = 'default',
  onModalShow,
}: ModalBottomProps) => (
  <Modal
    isVisible={visible}
    swipeDirection="down"
    onSwipeComplete={onBackButtonPress}
    onBackdropPress={onBackButtonPress}
    onModalShow={onModalShow}
    scrollHorizontal
    propagateSwipe
    statusBarTranslucent={isIos ? undefined : true}
    style={{
      width: '100%',
      justifyContent: 'flex-end',
      margin: 0,
    }}
  >
    <ContentContainer variant={variant}>
      <ActiveBarContainer>
        <ActiveBar />
      </ActiveBarContainer>
      {children}
    </ContentContainer>
  </Modal>
);

export { ModalBottom };
