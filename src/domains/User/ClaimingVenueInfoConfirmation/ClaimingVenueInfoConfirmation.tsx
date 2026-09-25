import { Button, Divider, Header, SubTitle, Text } from '@components';
import { useAuth } from '@contexts';
import { useCreateVenueRequest } from '@hooks';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParams,
  Routes
} from '@types';
import {
  ButtonContainer,
  ContentContainer,
  Empty,
  HeaderConteiner,
  Item,
  ItemWrapper,
  Items,
  ScreenContainer,
  TitleWrapper,
} from './styles';

type Props = NativeStackScreenProps<
  RootStackParams,
  'ClaimingVenueInfoConfirmation'
>;

const ClaimingVenueInfoConfirmationScreen = ({ navigation, route }: Props) => {
  const { params } = route;
  const {
    user: { sub },
  } = useAuth();
  const data = Object.entries(params).map(([field, value]) => ({
    field,
    value:
      field === 'phone' ? `${params.countryCode || 1} ${params.phone}` : value,
  }));

  const { mutate, isLoading } = useCreateVenueRequest();

  const orderedFields = ['fullName', 'email', 'phone'];

  const fieldsNames = {
    fullName: 'Full Name',
    email: 'Email',
    phone: 'Phone',
  };

  const orderedData = orderedFields
    .map((field) => {
      const obj = data.find((item) => item.field === field);
      return obj;
    })
    .filter((obj) => obj !== undefined);

  const onSubmit = async () => {
    mutate(
      {
        fullName: params.fullName,
        email: params.email,
        venuePhone: `${params.countryCode || '1'} ${params.phone}`,
        venueId: params.venueId,
        userId: sub,
      },
      {
        onSuccess: () => {
          navigation.navigate(Routes.VenueRedeemConfirmation, {
            venueId: params.venueId,
          });
        },
      }
    );
  };

  return (
    <ScreenContainer>
      <HeaderConteiner>
        <Header title="Claiming Venue" />
      </HeaderConteiner>

      <ContentContainer>
        <SubTitle color="primary500" center size={27} mt={32}>
          Review Info
        </SubTitle>
        <Text align="center" mv={16}>
          Before submitting your request,{'\n'}check if every field is correct.
        </Text>
        <Items>
          {orderedData.map((item, index) => (
            <ItemWrapper key={item?.field}>
              <Item>
                <TitleWrapper>
                  <Text bold key={item?.field} size={13}>
                    {fieldsNames[item?.field]}
                  </Text>
                </TitleWrapper>
                <Text key={item?.field} size={13}>
                  {item?.value}
                </Text>
              </Item>
              {index !== orderedData.length - 1 && <Divider />}
              {index === orderedData.length - 1 && <Empty />}
            </ItemWrapper>
          ))}
        </Items>
      </ContentContainer>
      <ButtonContainer>
        <Button
          label="Send Claiming"
          loading={isLoading}
          iconSize={22}
          onPress={onSubmit}
          mh={24}
          icon="venue"
        />
      </ButtonContainer>
    </ScreenContainer>
  );
};

export { ClaimingVenueInfoConfirmationScreen };
