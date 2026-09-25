import { gql } from 'graphql-request';

const UpdateShippingInfo = gql`
  mutation UpdateShippingInfo(
    $id: ID!
    $address: String
    $city: String
    $email: String
    $fullName: String
    $isRedeemed: Boolean
    $model: String
    $size: String
    $state: String
    $zipcode: String
  ) {
    updateUserReward(
      input: {
        id: $id
        address: $address
        city: $city
        email: $email
        fullName: $fullName
        size: $size
        model: $model
        isRedeemed: $isRedeemed
        state: $state
        zipcode: $zipcode
      }
    ) {
      address
      city
      email
      fullName
      id
      isRedeemed
      model
      size
      state
      trackingCode
      zipcode
    }
  }
`;

export { UpdateShippingInfo };
