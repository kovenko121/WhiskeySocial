import { Button, Header, Text, Title } from '@components';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParams,
  Routes
} from '@types';
import * as WebBrowser from 'expo-web-browser';

import {
  AddressContainer,
  ContentContainer,
  Divider,
  InfoRow,
  ItemDescription,
  ItemName,
  RewardItemImage,
  Row,
  ScreenContainer,
  TrackingInfoContainer,
} from './styles';

type Props = NativeStackScreenProps<RootStackParams, 'TrackingInfo'>;
const goToGoogleSearch = (
  code: string | undefined | null,
  service: string | undefined | null
) => {
  if (code) {
    WebBrowser.openBrowserAsync(
      `https://www.google.com/search?q=${`${code} ${service}`}`
    );
  }
};
const TrackingInfoScreen = ({ navigation, route }: Props) => (
  <ScreenContainer>
    <ContentContainer>
      <TrackingInfoContainer>
        <Header title="WS Rewards" />
        <Title mt={50} mb={40} size={27} bold align="center">
          Tracking Info
        </Title>
        <Row>
          <RewardItemImage source={route.params.rewardImage} />

          <AddressContainer>
            <Text size={14}> {route.params.address || ''}</Text>

            <Row>
              <Text size={14}>
                {route.params.shirtSize
                  ? `Size: ${route.params.shirtSize}`
                  : ''}{' '}
              </Text>

              <Text size={14}>
                {route.params.shirtModel
                  ? `Gender: ${route.params.shirtModel}`
                  : ''}
              </Text>
            </Row>
          </AddressContainer>
        </Row>

        <InfoRow>
          <ItemName>
            <Text size={14} bold>
              Tracking Code
            </Text>
          </ItemName>
          <ItemDescription>
            <Text
              bold
              color="primary"
              size={14}
              onPress={() =>
                goToGoogleSearch(
                  route.params.trackingCode,
                  route.params.service
                )
              }
            >
              {route.params.trackingCode || 'pending'}
            </Text>
          </ItemDescription>
        </InfoRow>
        <Divider />
        <InfoRow>
          <ItemName>
            <Text size={14} bold>
              Service
            </Text>
          </ItemName>
          <ItemDescription>
            <Text size={14}>{route.params.service || 'pending'}</Text>
          </ItemDescription>
        </InfoRow>
        <Divider />
      </TrackingInfoContainer>
      <Button
        label="Return to Rewards"
        icon="trophy"
        iconSize={18}
        onPress={() => {
          navigation.navigate(Routes.ActiveRewards);
        }}
      />
    </ContentContainer>
  </ScreenContainer>
);
export { TrackingInfoScreen };
