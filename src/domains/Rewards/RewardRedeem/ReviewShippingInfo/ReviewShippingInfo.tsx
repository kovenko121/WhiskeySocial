import { Button, Header, Text, Title } from '@components';
import { capitalizeAll } from '@helpers';
import { useUpdateShippingInfo } from '@hooks';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParams } from '@types';
import { ComponentType } from 'react';
import { FlatList } from 'react-native';
import {
  ButtonsContainer,
  ContentContainer,
  Divider,
  ErrorMessageContainer,
  InfoRow,
  ItemDescription,
  ItemName,
  ItemsContainer,
  ScreenContainer,
  TitleContainer,
} from './styles';

type Props = NativeStackScreenProps<RootStackParams, 'ReviewShippingInfo'>;
const ReviewShippingInfoScreen = ({ navigation, route }: Props) => {
  const {
    mutate: updateShippingInfo,
    isLoading: isUpdatingShippingInfo,
    isError: isShippingInfoError,
  } = useUpdateShippingInfo();

  const data = [
    { text: 'Full Name', value: capitalizeAll(route.params.fullName) },
    { text: ' E-mail', value: route.params.email.toLowerCase() },
    { text: 'Address', value: capitalizeAll(route.params.addressFirst) },
    {
      text: 'Address 2',
      value: route.params.addressSecond
        ? capitalizeAll(route.params.addressSecond)
        : route.params.addressSecond,
    },
    { text: 'City', value: capitalizeAll(route.params.cityName) },
    { text: 'State', value: capitalizeAll(route.params.stateName) },
    { text: 'ZipCode', value: route.params.zipcode },
  ];

  if (route.params.shirtSize) {
    data.unshift({
      text: 'Model',
      value: route.params.shirtModel,
    });
    data.unshift({
      text: 'Shirt Size',
      value: route.params.shirtSize,
    });
  }

  const handleSubmit = async () => {
    updateShippingInfo(route.params);
  };

  return (
    <ScreenContainer>
      <ContentContainer>
        <Header title="WS Rewards" />

        <ItemsContainer>
          <TitleContainer>
            <Title size={27} align="center">
              Review Shipping Info
            </Title>
          </TitleContainer>

          <FlatList
            data={data}
            renderItem={({ item }) => (
              <InfoRow>
                <ItemName>
                  <Text size={14} bold>
                    {item.text}
                  </Text>
                </ItemName>
                <ItemDescription>
                  <Text size={14}>{item.value}</Text>
                </ItemDescription>
              </InfoRow>
            )}
            ItemSeparatorComponent={
              (<Divider />) as unknown as ComponentType<any>
            }
          />
        </ItemsContainer>
        <ButtonsContainer>
          <Button
            label="Edit Info"
            variant="outlineDefault"
            icon="edit"
            iconSize={18}
            onPress={() => navigation.goBack()}
          />

          <Button
            label="Confirm Shipping Info"
            icon="truck"
            iconSize={18}
            onPress={handleSubmit}
            mv={10}
            loading={isUpdatingShippingInfo}
          />
          {isShippingInfoError && (
            <ErrorMessageContainer>
              <Text size={9} color="red">
                Error. Please, try again later...
              </Text>
            </ErrorMessageContainer>
          )}
        </ButtonsContainer>
      </ContentContainer>
    </ScreenContainer>
  );
};
export { ReviewShippingInfoScreen };
