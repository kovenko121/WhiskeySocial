import { gql } from 'graphql-request';

const ChoiceOfTheWeek = gql`
  query ChoiceOfTheWeek {
    searchWhiskeys(filter: {specialistChoice: {eq: true}}) {
      nextToken
      items {
        id
        age
        name
        type
        picture {
          bucket
          key
          region
        }
        brandId
        brandUser {
          id
          brandName
          brandSearchName
          brandDescription
          brandLogo {
            bucket
            key
            region
          }
          brandCoverImage {
            bucket
            key
            region
          }
          brandWebsite
          brandCountry
          brandFoundedYear
          brandStory
          userType
          username
          profilePicture {
            bucket
            key
            region
          }
          coverPicture {
            bucket
            key
            region
          }
          bio
        }
        brand
        brandPicture {
          bucket
          key
          region
        }
        calculatedRating
        distilleryTastingNotes
      }
    }
  }
`;

export { ChoiceOfTheWeek };
