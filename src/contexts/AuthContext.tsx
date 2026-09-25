/* eslint-disable no-case-declarations */
import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { amplify, amplifyApiKey, queryClient } from '@services';
import { CodeOperations, User, UserType } from '@types';
import { CognitoUser } from 'amazon-cognito-identity-js';
import { Auth, Hub } from 'aws-amplify';
import * as Crypto from 'expo-crypto';
import {
  createContext,
  JSX,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as Notifications from 'expo-notifications';
import awsmobile from '../config/aws';
import { buildCioIdentity } from '../utils/buildCioIdentity';
import { buildPhIdentity } from '../utils/buildPhIdentity';
import {
  sendConfirmationCode as SendConfirmationCode,
  verifyConfirmationCode as VerifyConfirmationCode,
  updateUser,
} from '../graphql/mutations';
import {
  SignInMethodsForEmail,
  SignInMethodsResult,
} from '../hooks/auth/query/signInMethodsForEmail';
import { loadAuth } from '../hooks/loadAuth';
import { loadToken } from '../hooks/loadToken';
import { setSentryUser, clearSentryUser } from '../config/sentry';
import { groupPostHogBrand, groupPostHogVenue, posthogIdentity, resetPostHogUser } from '../config/posthog';
import { cioIdentify, cioReset, cioRegisterPushToken } from '../config/customerio';
import { createLogger } from '../services/logger';
import { getValueIfDefined } from '../utils/common';

const logger = createLogger('AuthContext');

export type AuthState = {
  user: any;
  isAuthenticated: boolean;
  isGuest: boolean;
  finishedOnboarding: boolean;
  socialLogin: boolean;
  isLoading: boolean;
};

type AuthContextData = {
  signOut: () => Promise<void>;
  googleLogin: () => Promise<any>;
  appleLogin: () => Promise<any>;
  emailSignup: (email: string) => Promise<CognitoUser>;
  loginCodeConfirmation: (emailOrPhone: string, code: string) => Promise<void>;
  emailSignin: (email: string, password: string) => Promise<void>;
  handleFinishOnboarding: () => Promise<void>;
  sendCode: (email: string, type: CodeOperations) => Promise<Boolean>;
  verifyCode: (
    email: string,
    code: string,
    type: CodeOperations
  ) => Promise<Boolean>;
  changeEmail: (email: string) => Promise<Boolean>;
  deleteUser: () => Promise<Boolean>;
  deleteUserOnboarding: () => Promise<Boolean>;
  resendConfirmationCode: (email: string) => Promise<void>;
  signInMethodsForEmail: (
    email: string
  ) => Promise<SignInMethodsResult | 'RATE_LIMITED' | null>;
  continueAsGuest: () => void;
  exitGuestMode: () => void;
} & AuthState;

const AuthContext = createContext({} as AuthContextData);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({
  initalValue,
  children,
}: {
  initalValue: any;
  children: JSX.Element;
}) => {
  const [authState, setAuthState] = useState<AuthState>(initalValue);
  // Track whether the user was previously authenticated so we can distinguish
  // a real logout (authenticated → unauthenticated) from intermediate
  // unauthenticated states during the signup flow. Calling posthog.reset()
  // during signup would generate a new anonymous ID and break the
  // install → signup funnel by discarding the original anonymous session.
  const wasAuthenticated = useRef(false);

  useEffect(() => {
    (async () => {
      const pushTokenSent = await AsyncStorage.getItem('pushTokenSent');

      if (authState.isAuthenticated && authState.user) {
        wasAuthenticated.current = true;
        const { sub } = authState.user;
        // loadAuth now fetches DynamoDB user before setting auth state, so the
        // cache is guaranteed to be populated here for returning users.
        const dbUser = queryClient.getQueryData<User>(['get-user', sub]);

        setSentryUser({
          id: sub,
          email: authState.user.email,
          username: dbUser?.username,
          accountType: dbUser?.userType,
        });
        const phIdentity = buildPhIdentity(
          sub,
          authState.user.email,
          dbUser,
          authState.socialLogin,
          authState.finishedOnboarding
        );
        const isNewUser = !authState.finishedOnboarding;
        posthogIdentity(phIdentity, isNewUser);
        if (dbUser?.userType === UserType.BRAND) groupPostHogBrand(sub, getValueIfDefined(dbUser?.brandName, 'string'));
        if (dbUser?.userType === UserType.VENUE) groupPostHogVenue(sub, getValueIfDefined(dbUser?.venueName, 'string'));

        const custIdentity = await buildCioIdentity(
          sub,
          authState.user.email,
          dbUser,
          pushTokenSent === 'true',
          authState.finishedOnboarding
        );
        cioIdentify(sub, custIdentity);

        // Register native device token with CIO each session — tokens can rotate.
        // Only attempt if push permission was already granted.
        if (pushTokenSent === 'true') {
          try {
            const { status } = await Notifications.getPermissionsAsync();
            if (status === 'granted') {
              const deviceToken = await Notifications.getDevicePushTokenAsync();
              if (deviceToken?.data) {
                cioRegisterPushToken(deviceToken.data as string);
              }
            }
          } catch {
            // Not on a physical device or permissions revoked.
          }
        }
      } else {
        clearSentryUser();
        cioReset();
        // Only reset PostHog when transitioning from authenticated → unauthenticated
        // (real logout). Resetting during intermediate signup states would discard
        // the anonymous session and break cross-session install→signup funnels.
        if (wasAuthenticated.current) {
          resetPostHogUser();
          wasAuthenticated.current = false;
        }
      }

      if (authState.finishedOnboarding && !pushTokenSent) {
        const token = await loadToken();

        if (token) {
          await amplify.request(updateUser, {
            input: {
              id: authState.user.sub,
              expoTokens: [token],
            },
          });
          await AsyncStorage.setItem('pushTokenSent', 'true');

          // Update CIO push status and register native device token.
          cioIdentify(authState.user.sub, {
            push_enabled: true,
            expo_token_count: 1,
          });
          
          try {
            const deviceToken = await Notifications.getDevicePushTokenAsync();
            if (deviceToken?.data) {
              cioRegisterPushToken(deviceToken.data as string);
            }
          } catch {
            // Not on a physical device.
          }
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState.user, authState.isAuthenticated]);
  const defaultPassword = async (email: string) => {
    const digest = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA512,
      `${process.env.SECRETKEY} ${email}`
    );

    if (digest.length > 98) {
      return digest.slice(98);
    }

    return digest;
  };

  const contextValue = useMemo(() => {
    const googleLogin = () =>
      Auth.federatedSignIn({
        provider: CognitoHostedUIIdentityProvider.Google,
      });

    const appleLogin = () =>
      Auth.federatedSignIn({ provider: CognitoHostedUIIdentityProvider.Apple });

    const loginCodeConfirmation = async (
      phoneOrEmail: string,
      code: string
    ) => {
      await Auth.confirmSignUp(phoneOrEmail, code);
    };

    const handleFinishOnboarding = async () => {
      const user = await Auth.currentAuthenticatedUser();
      await Auth.updateUserAttributes(user, { 'custom:onboarding': 'true' });
      setAuthState((prevState) => ({ ...prevState, finishedOnboarding: true }));
    };

    const emailSignup = async (email: string) => {
      const password = await defaultPassword(email);
      const { user } = await Auth.signUp({
        username: email.toLowerCase(),
        password,
        autoSignIn: {
          enabled: true,
        },
      });
      return user;
    };

    const resendConfirmationCode = async (email: string) => {
      Auth.resendSignUp(email);
    };

    const emailSignin = async (email: string, password: string) => {
      const hashPassword = await defaultPassword(password);
      const user = await Auth.signIn(email, hashPassword);
      return user;
    };

    const signOut = async () => {
      try {
        await amplify.request(updateUser, {
          input: {
            id: authState.user.sub,
            expoTokens: [],
          },
        });
        await AsyncStorage.removeItem('pushTokenSent');
        await AsyncStorage.removeItem('viewedDeleteCommentHint');
      } catch (err) {
        logger.error('Error during sign out:', err as Error);
      } finally {
        // Clear user context on sign out
        clearSentryUser();
        resetPostHogUser();
        cioReset();
        await Auth.signOut();
        queryClient.clear();
      }
    };

    const changeEmail = async (email: string) => {
      const user = await Auth.currentAuthenticatedUser();
      try {
        await Auth.updateUserAttributes(user, { email });
        return true;
      } catch (err) {
        return false;
      }
    };

    const sendCode = async (email: string, operation: CodeOperations) => {
      try {
        switch (operation) {
          case CodeOperations.SIGN_UP:
            return await Auth.resendSignUp(email);
          default:
            return await amplifyApiKey.request(SendConfirmationCode, {
              email,
              operation,
            });
        }
      } catch (err) {
        return false;
      }
    };

    const deleteUser = async () => {
      try {
        await amplify.request(updateUser, {
          input: {
            id: authState.user.sub,
            venueName: '',
            personFirstName: 'Deleted',
            personLastName: 'User',
            userType: UserType.PERSON,
            expoTokens: [],
            deleted: true,
            profilePicture: {
              bucket: awsmobile.aws_user_files_s3_bucket,
              key: 'deleted_user.png',
              region: awsmobile.aws_user_files_s3_bucket_region,
            },
          },
        });
        // @TODO delete user images on s3
        await AsyncStorage.removeItem('pushTokenSent');
        await AsyncStorage.removeItem('viewedDeleteCommentHint');
        // Suppress all future CIO sends immediately (PRD constraint).
        cioIdentify(authState.user.sub, { deleted: true });
        clearSentryUser();
        resetPostHogUser();
        cioReset();
        queryClient.clear();
        await Auth.deleteUser();
        return true;
      } catch (error) {
        return false;
      }
    };

    const deleteUserOnboarding = async () => {
      try {
        try {
          await amplify.request(updateUser, {
            input: {
              id: authState.user.sub,
              venueName: '',
              personFirstName: 'Deleted',
              personLastName: 'User',
              userType: UserType.PERSON,
              expoTokens: [],
              deleted: true,
              profilePicture: {
                bucket: awsmobile.aws_user_files_s3_bucket,
                key: 'deleted_user.png',
                region: awsmobile.aws_user_files_s3_bucket_region,
              },
            },
          });
        } catch (dbError) {
          logger.warn('DB user not found, continuing with Cognito delete...');
        }

        await AsyncStorage.removeItem('pushTokenSent');
        await AsyncStorage.removeItem('viewedDeleteCommentHint');
        // Suppress all future CIO sends immediately (PRD constraint).
        cioIdentify(authState.user.sub, { deleted: true });
        clearSentryUser();
        resetPostHogUser();
        cioReset();
        queryClient.clear();
        await Auth.deleteUser();

        return true;
      } catch (error) {
        return false;
      }
    };

    const verifyCode = async (
      email: string,
      code: string,
      operation: CodeOperations
    ) => {
      switch (operation) {
        case CodeOperations.EMAIL_CHANGE:
          const user = await Auth.currentAuthenticatedUser();
          const result = await Auth.verifyUserAttributeSubmit(
            user,
            'email',
            code
          );
          if (result) {
            const oldPassword = await defaultPassword(authState.user.email);
            const newPassword = await defaultPassword(email);
            await Auth.changePassword(user, oldPassword, newPassword);
          }
          return result;
        case CodeOperations.SIGN_UP:
          return Auth.confirmSignUp(email, code);
        default:
          // @ts-ignore
          const { verifyConfirmationCode } = await amplifyApiKey.request(
            VerifyConfirmationCode,
            {
              email,
              code,
              operation,
            }
          );

          if (!verifyConfirmationCode) {
            throw new Error(
              'Invalid verification code provided, please try again.'
            );
          }
          return verifyConfirmationCode;
      }
    };

    const signInMethodsForEmail = async (email: string) => {
      try {
        const { signInMethodsForEmail: result } = await amplifyApiKey.request<{
          signInMethodsForEmail: SignInMethodsResult | null;
        }>(SignInMethodsForEmail, { email: email.trim().toLowerCase() });

        return result;
      } catch (err) {
        if (JSON.stringify(err ?? '').includes('RATE_LIMITED')) {
          return 'RATE_LIMITED' as const;
        }

        logger.error('Sign-in method lookup failed:', err as Error);
        return null;
      }
    };

    const continueAsGuest = () =>
      setAuthState((prev) => ({ ...prev, isGuest: true }));

    const exitGuestMode = () =>
      setAuthState((prev) => ({ ...prev, isGuest: false }));

    return {
      ...authState,
      googleLogin,
      appleLogin,
      loginCodeConfirmation,
      handleFinishOnboarding,
      emailSignup,
      resendConfirmationCode,
      signInMethodsForEmail,
      emailSignin,
      signOut,
      changeEmail,
      sendCode,
      deleteUser,
      deleteUserOnboarding,
      verifyCode,
      continueAsGuest,
      exitGuestMode,
    };
  }, [authState]);

  useEffect(() => {
    const unsubscribe = Hub.listen('auth', ({ payload: { event } }) => {
      if (event === 'codeFlow') {
        setAuthState({
          isAuthenticated: false,
          isGuest: false,
          user: {} as any,
          finishedOnboarding: false,
          socialLogin: false,
          isLoading: true,
        });
      }

      loadAuth(setAuthState);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
