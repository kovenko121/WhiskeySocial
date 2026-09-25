import { FC } from 'react';
import { ModalBottom } from '../../ModalBottom/ModalBottom';
import { Icon } from '../../Icon/Icon';
import { Text } from '../../Text/Text';
import {
  OptionButton,
  OptionContent,
  OptionIconContainer,
  OptionTextContainer,
  OptionsContainer,
} from './styles';

interface ShareOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onQuickShare: () => void;
  onShareWithComment: () => void;
}

export const ShareOptionsModal: FC<ShareOptionsModalProps> = ({
  visible,
  onClose,
  onQuickShare,
  onShareWithComment,
}) => (
    <ModalBottom visible={visible} onBackButtonPress={onClose}>
      <OptionsContainer>
        <Text bold size={16} align="center" style={{ paddingTop: 8 }}>
          Share Post
        </Text>
        <OptionButton onPress={onQuickShare}>
          <OptionContent>
            <OptionIconContainer>
              <Icon name="share" color="primary500" size={24} />
            </OptionIconContainer>
            <OptionTextContainer>
              <Text bold size={14}>
                Share to Activity
              </Text>
              <Text size={12} color="grey100">
                Quickly share to your feed
              </Text>
            </OptionTextContainer>
          </OptionContent>
        </OptionButton>

        <OptionButton onPress={onShareWithComment}>
          <OptionContent>
            <OptionIconContainer>
              <Icon name="message" color="primary500" size={24} />
            </OptionIconContainer>
            <OptionTextContainer>
              <Text bold size={14}>
                Share with Comment
              </Text>
              <Text size={12} color="grey100">
                Add your thoughts
              </Text>
            </OptionTextContainer>
          </OptionContent>
        </OptionButton>
      </OptionsContainer>
    </ModalBottom>
  );
