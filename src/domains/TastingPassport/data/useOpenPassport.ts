import { useAuth, useAuthGate } from '@contexts';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps, Routes } from '@types';
import { useCallback } from 'react';

/**
 * Opens one event's Passport, raising the auth gate for a guest first so a passport
 * is only ever stamped against a real identity. Taking the sheet's CTA remembers the
 * event that was tapped, so the Passport opens by itself once the account is made —
 * nobody has to find their way back to Discover at the door.
 *
 * `useGuestGuard` fixes its destination when the component mounts, which cannot
 * describe a list where every row leads somewhere different; the gate is triggered
 * here with the row's own event instead.
 */
export const useOpenPassport = () => {
  const navigation = useNavigation<NavigationProps>();
  const { isGuest } = useAuth();
  const triggerAuthGate = useAuthGate();

  return useCallback(
    (eventId: string) => {
      if (isGuest) {
        triggerAuthGate('tasting_event', {
          name: Routes.Passport,
          params: { eventId },
        });
        return;
      }
      navigation.navigate(Routes.Passport, { eventId });
    },
    [isGuest, navigation, triggerAuthGate]
  );
};
