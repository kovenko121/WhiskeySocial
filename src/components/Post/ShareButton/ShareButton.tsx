import { FC } from 'react';
import { TouchableOpacity, View } from 'react-native';
import styled from 'styled-components/native';
import { Icon } from '../../Icon/Icon';

const ShareContainer = styled(View)`
  align-items: center;
  gap: 4px;
`;

interface ShareButtonProps {
  sharesCount?: number | null;
  onPress: () => void;
  disabled?: boolean;
}

export const ShareButton: FC<ShareButtonProps> = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- consumed by the PHASE 2 block below
  sharesCount = 0,
  onPress,
  disabled = false,
}) => (
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      <ShareContainer>
        <Icon name="share" color="white" size={23} />
        {/* PHASE 2: Uncomment when IncrementPostShareCount Lambda is deployed */}
        {/* {sharesCount != null && sharesCount > 0 && (
          <Text size={12} color="grey25">
            {sharesCount}
          </Text>
        )} */}
      </ShareContainer>
    </TouchableOpacity>
  );
