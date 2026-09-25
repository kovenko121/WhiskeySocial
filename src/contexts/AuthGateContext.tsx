import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import {
  createContext,
  JSX,
  useContext,
  useMemo,
  useRef,
} from 'react';
import { StyleSheet } from 'react-native';
import { Text } from '../components/Text/Text';
import { Button } from '../components/Button/Button';
import { NUDGE_COPY, NudgeIntent } from '../copy/nudges';
import {
  PendingDestination,
  savePendingDestination,
} from '../services/pendingDestination';
import { colors } from '../styles/colors';

type TriggerAuthGate = (
  intent: NudgeIntent,
  destination?: PendingDestination
) => void;

const AuthGateContext = createContext<TriggerAuthGate>(() => {});

export const useAuthGate = (): TriggerAuthGate => useContext(AuthGateContext);

const backgroundStyle = { backgroundColor: colors.grey400 };

const AuthGateSheetContent = ({
  intentRef,
  destinationRef,
  sheetRef,
  onLogin,
}: {
  intentRef: React.MutableRefObject<NudgeIntent>;
  destinationRef: React.MutableRefObject<PendingDestination | undefined>;
  sheetRef: React.RefObject<BottomSheetModal | null>;
  onLogin: () => void;
}) => {
  const copy = NUDGE_COPY[intentRef.current] ?? NUDGE_COPY.default;

  const handleSignUp = () => {
    // Recorded here rather than when the sheet opens: only someone who takes the CTA has
    // asked to be brought back, so merely peeking at the gate never redirects them later.
    if (destinationRef.current) savePendingDestination(destinationRef.current);
    sheetRef.current?.dismiss();
    onLogin();
  };

  return (
    <BottomSheetView style={styles.container}>
      <Text bold size={22} align="center" mv={4}>
        {copy.headline}
      </Text>
      <Text size={15} align="center" color="neutral300" mv={8}>
        {copy.subhead}
      </Text>
      <Button
        label={copy.cta}
        onPress={handleSignUp}
        full
        mv={16}
      />
    </BottomSheetView>
  );
};

export const AuthGateProvider = ({ children, onLogin }: { children: JSX.Element; onLogin: () => void }) => {
  const sheetRef = useRef<BottomSheetModal>(null);
  const intentRef = useRef<NudgeIntent>('default');
  const destinationRef = useRef<PendingDestination | undefined>(undefined);
  const snapPoints = useMemo(() => ['40%', '40%'], []);

  const contextValue = useMemo<TriggerAuthGate>(
    () => (intent: NudgeIntent, destination?: PendingDestination) => {
      intentRef.current = intent;
      destinationRef.current = destination;
      sheetRef.current?.present();
    },
    []
  );

  return (
    <AuthGateContext.Provider value={contextValue}>
      {children}
      <BottomSheetModal
        ref={sheetRef}
        index={1}
        snapPoints={snapPoints}
        backgroundStyle={backgroundStyle}
        enableDynamicSizing={false}
      >
        <AuthGateSheetContent
          intentRef={intentRef}
          destinationRef={destinationRef}
          sheetRef={sheetRef}
          onLogin={onLogin}
        />
      </BottomSheetModal>
    </AuthGateContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    alignItems: 'center',
  },
});
