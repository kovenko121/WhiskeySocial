import { View } from 'react-native';
import { Icon } from '../Icon/Icon';
import { Link, Text } from '../Text/Text';
import { Row, SadContainer } from './styles';

export const NoWhiskeyFound = ({
  goSuggestWhiskeyScreen,
  addSuggestionLink = true,
  marginRight = false,
}: {
  goSuggestWhiskeyScreen: () => void;
  addSuggestionLink?: boolean;
  marginRight?: boolean;
}) => (
  <SadContainer mb={100} marginRight={marginRight}>
    <Icon size={30} name="sad" color="red" />
    <View>
      <Text align="center">
        We couldn't find anything related to your search.
      </Text>
      {addSuggestionLink && (
        <Row>
          <Text align="center">Try to refine it or </Text>
          <Link color="primary" onPress={goSuggestWhiskeyScreen}>
            Suggest New Whiskey.
          </Link>
        </Row>
      )}
    </View>
  </SadContainer>
);
