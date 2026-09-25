import { View } from 'react-native';
import { Icon } from '../Icon/Icon';
import { Text } from '../Text/Text';
import { Row, SadContainer } from './styles';

export const NoWhiskeyInMyCollection = () => (
  <SadContainer mb={100}>
    <Icon size={30} name="sad" color="red" />
    <View>
      <Text align="center">You don't have any whiskeys yet.</Text>
      <Row>
        <Text align="center">Add whiskeys to your collection. </Text>
      </Row>
    </View>
  </SadContainer>
);
