import { gql } from 'graphql-request';

const CreateReport = gql`
  mutation CreateReport(
    $contentId: String!
    $contentType: ReportContentType!
    $reason: String!
    $reportedUserId: ID!
    $description: String
  ) {
    createReport(
      input: {
        contentId: $contentId
        contentType: $contentType
        reason: $reason
        reportedUserId: $reportedUserId
        description: $description
      }
    ) {
      id
    }
  }
`;

export { CreateReport };
