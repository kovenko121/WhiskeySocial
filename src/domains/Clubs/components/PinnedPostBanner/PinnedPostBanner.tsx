import { Icon } from '@components';
import { Container, PinnedText } from './styles';

const PinnedPostBanner = () => (
    <Container>
      <Icon materialIcon="pin" size={14} color="primary500" />
      <PinnedText>Pinned</PinnedText>
    </Container>
  );

export { PinnedPostBanner };
