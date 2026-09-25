import { Icons } from '@types';
import { Icon } from '../Icon/Icon';
import { Text, Title } from '../Text/Text';
import { ContentContainer, SubtitleContainer } from './styles';

export const ConfirmationContainer = ({
  icon,
  title,
  subtitle,
}: {
  icon: Icons;
  title: string;
  subtitle: string;
}) => (
  <ContentContainer>
    <Icon name={icon} color="primary500" size={62} />
    <Title color="primary">{title}</Title>

    <SubtitleContainer>
      <Text align="center">{subtitle}</Text>
    </SubtitleContainer>
  </ContentContainer>
);
