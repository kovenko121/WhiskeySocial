import { Icon, Text } from '@components';
import { View } from 'react-native';
import { Row, SadContainer } from './styles';

export const NoPours = () => (
  <SadContainer mb={100}>
    <Icon size={30} name="sad" color="red" />
    <View>
      <Text align="center">You don't have any pours yet.</Text>
      <Row>
        <Text align="center">Add pours to your collection. </Text>
      </Row>
    </View>
  </SadContainer>
);
