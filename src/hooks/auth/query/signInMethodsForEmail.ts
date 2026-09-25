import { SignInMethod } from '../../../domains/Auth/authMessages';

export type SignInMethodsResult = {
  email: string;
  methods: SignInMethod[];
  hasNativeAccount: boolean;
  nativeStatus: string | null;
};

export const SignInMethodsForEmail = /* GraphQL */ `
  query SignInMethodsForEmail($email: String!) {
    signInMethodsForEmail(email: $email) {
      email
      methods
      hasNativeAccount
      nativeStatus
    }
  }
`;
