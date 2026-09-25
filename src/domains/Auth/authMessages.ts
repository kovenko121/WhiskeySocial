export type SignInProvider = 'GOOGLE' | 'APPLE';

export type SignInMethod = SignInProvider | 'EMAIL';

const PROVIDER_LABELS: Record<SignInProvider, string> = {
  GOOGLE: 'Google',
  APPLE: 'Apple',
};

export const providerLabel = (provider: SignInProvider) =>
  PROVIDER_LABELS[provider];

export const isSignInProvider = (
  method: SignInMethod
): method is SignInProvider => method === 'GOOGLE' || method === 'APPLE';

export const authMessages = {
  existingProviderInline: (provider: SignInProvider) =>
    `You've used ${providerLabel(
      provider
    )} to sign in before. Continue with ${providerLabel(
      provider
    )} and everything you've saved is still there.`,

  blockedSignupTitle: 'You already have an account',

  blockedSignupBody: (provider: SignInProvider) =>
    `This email is set up with ${providerLabel(
      provider
    )}. Sign in that way and everything you've saved is still there.`,

  verifyEmailBody: (email: string) =>
    `We'll send a code to ${email} to confirm it's you, then connect it to your existing account.`,

  continueWithProvider: (provider: SignInProvider) =>
    `Continue with ${providerLabel(provider)}`,

  useDifferentEmail: 'Use a different email',

  sendCode: 'Send code',

  tooManyAttempts:
    'Too many attempts just now. Wait a moment and try again.',
};

const PRE_SIGN_UP_CODES = {
  useProvider: 'WHI259_USE_PROVIDER',
  verifyEmail: 'WHI259_VERIFY_EMAIL',
};

type PreSignUpRejection = {
  reason: 'USE_PROVIDER' | 'VERIFY_EMAIL';
  provider: SignInProvider;
};

export const parsePreSignUpRejection = (
  error: unknown
): PreSignUpRejection | null => {
  const message =
    typeof error === 'object' && error !== null && 'message' in error
      ? String((error as { message?: unknown }).message ?? '')
      : '';

  if (!message) {
    return null;
  }

  const match = message.match(
    /(WHI259_USE_PROVIDER|WHI259_VERIFY_EMAIL):(GOOGLE|APPLE)/
  );

  if (!match) {
    return null;
  }

  return {
    reason:
      match[1] === PRE_SIGN_UP_CODES.useProvider ? 'USE_PROVIDER' : 'VERIFY_EMAIL',
    provider: match[2] as SignInProvider,
  };
};
