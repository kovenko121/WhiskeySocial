import * as AuthSession from 'expo-auth-session';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

export const urlOpener = async (url: string, redirectUrl: string) => {
  if (url.includes('logout')) {
    return;
  }

  const result = await WebBrowser.openAuthSessionAsync(url, redirectUrl, {
    preferEphemeralSession: true,
  });

  if (result.type === 'success') {
    const redirectUri = AuthSession.makeRedirectUri();

    Linking.openURL(result.url.replace('whiskeysocial://', redirectUri));
  }
};
