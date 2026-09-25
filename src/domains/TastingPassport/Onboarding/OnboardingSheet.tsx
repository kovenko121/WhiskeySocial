/**
 * Onboarding bottom sheet shown the first time a user opens the Passport (and again from the "?"
 * button). Three tips, a "Start Tasting" button, and a reopen hint. Built on the app's shared
 * gorhom BottomSheet primitive: a drag-down handle and a backdrop tap both dismiss it, and the
 * sheet sizes to its content. The provider owns the seen flag via `visible`/`onClose`; we bridge
 * that declarative pair to the sheet's imperative present/dismiss and treat `onDismiss` — fired by
 * the handle, the backdrop, the ✕, or "Start Tasting" — as the single close path. (The flow-map
 * doc says 4 tips; it is stale — 3.)
 */
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { ImageSourcePropType } from 'react-native';
import { Button, Icon, Switch } from '@components';
import { getTestId } from '@helpers';
import { theme } from '@theme';
import { useCallback, useEffect, useRef } from 'react';
import { usePassport } from '../PassportProvider';
import { TileKind } from '../types';
import { TipTilePreview } from './TipTilePreview';
import wildTurkeyLogo from '../../../../assets/images/tasting-passport/brand-logos/wild-turkey.png';
import buffaloTraceLogo from '../../../../assets/images/tasting-passport/brand-logos/buffalo-trace.png';
import newRiffLogo from '../../../../assets/images/tasting-passport/brand-logos/new-riff.png';
import {
  CloseChip,
  CloseChipText,
  Consent,
  ConsentBody,
  ConsentCopy,
  ConsentEmail,
  ConsentTitle,
  Content,
  Footer,
  FooterHint,
  HeaderRow,
  MapAction,
  MapActionBody,
  MapActionCopy,
  MapActionTitle,
  Tip,
  TipText,
  TipTextBold,
  Tips,
  Title,
} from './styles';

type Props = {
  visible: boolean;
  onClose: () => void;
  onOpenBoothMap: () => void;
};

type TipData = {
  kind: TileKind;
  logo: ImageSourcePropType;
  glassLevel?: 1 | 2 | 3;
  fav?: boolean;
  lead: string;
  body: string;
};

// Each tip's icon is a miniature passport tile in the state that tip teaches — mirroring the grid
// tiles so the guide previews the real thing, with a real brand logo inside.
const TIPS: TipData[] = [
  {
    kind: 'notyet',
    logo: wildTurkeyLogo,
    lead: 'Tap any distiller',
    body: ' to open their booth and see what they’re pouring.',
  },
  {
    kind: 'visited',
    logo: buffaloTraceLogo,
    glassLevel: 2,
    lead: 'Mark pours “Tasted”',
    body: ' as you drink — each one stamps that booth. Didn’t taste? Tap “Visited” instead.',
  },
  {
    kind: 'togo',
    logo: newRiffLogo,
    fav: true,
    lead: 'Plan and remember',
    body: ' — tag booths “Want” to route your night, and “Favorite” the ones you loved.',
  },
];

const sheetBackground = { backgroundColor: theme.colors.grey600 };
const handleIndicator = {
  width: theme.metrics.px(36),
  height: theme.metrics.px(4),
  backgroundColor: theme.colors.grey400,
};

const renderBackdrop = (props: BottomSheetBackdropProps) => (
  <BottomSheetBackdrop
    {...props}
    appearsOnIndex={0}
    disappearsOnIndex={-1}
    opacity={0.7}
  />
);

export const OnboardingSheet = ({ visible, onClose, onOpenBoothMap }: Props) => {
  const sheetRef = useRef<BottomSheetModal>(null);
  const { shareContact, setShareContact, contact, showBoothMap } = usePassport();
  const boothMapPending = useRef(false);

  // Bridge the provider's declarative `visible` to the sheet's imperative API.
  useEffect(() => {
    if (visible) sheetRef.current?.present();
    else sheetRef.current?.dismiss();
  }, [visible]);

  // Single close path: the handle, backdrop, ✕, "Start Tasting" and "Booth Map" all funnel
  // through dismiss(), which fires onDismiss.
  const dismiss = useCallback(() => sheetRef.current?.dismiss(), []);

  // The sheet is a modal over the whole stack, so it has to be gone before the push — navigating
  // out from under it leaves it floating on top of the map.
  const openBoothMap = useCallback(() => {
    boothMapPending.current = true;
    dismiss();
  }, [dismiss]);

  const handleDismiss = useCallback(() => {
    onClose();
    if (!boothMapPending.current) return;
    boothMapPending.current = false;
    onOpenBoothMap();
  }, [onClose, onOpenBoothMap]);

  return (
    <BottomSheetModal
      ref={sheetRef}
      enableDynamicSizing
      enablePanDownToClose
      onDismiss={handleDismiss}
      backdropComponent={renderBackdrop}
      backgroundStyle={sheetBackground}
      handleIndicatorStyle={handleIndicator}
    >
      <BottomSheetView>
        <Content>
          <HeaderRow>
            <Title>How Your Passport Works</Title>
            <CloseChip onPress={dismiss} testID={getTestId('onboarding-close')}>
              <CloseChipText>✕</CloseChipText>
            </CloseChip>
          </HeaderRow>
          <Tips>
            {TIPS.map((tip) => (
              <Tip key={tip.lead}>
                <TipTilePreview
                  kind={tip.kind}
                  logo={tip.logo}
                  glassLevel={tip.glassLevel}
                  fav={tip.fav}
                />
                <TipText>
                  <TipTextBold>{tip.lead}</TipTextBold>
                  {tip.body}
                </TipText>
              </Tip>
            ))}
          </Tips>
          {showBoothMap && (
            <MapAction onPress={openBoothMap} testID={getTestId('onboarding-booth-map')}>
              <Icon materialIcon="map-outline" size={22} color="primary500" />
              <MapActionCopy>
                <MapActionTitle>Booth Map</MapActionTitle>
                <MapActionBody>
                  See the floor plan and every booth number, so you know where to head next.
                </MapActionBody>
              </MapActionCopy>
              <Icon materialIcon="chevron-right" size={20} color="grey200" />
            </MapAction>
          )}
          {contact && (
            <Consent>
              <ConsentCopy>
                <ConsentTitle>Share my details with distillers</ConsentTitle>
                <ConsentBody>
                  Favorite a booth or one of its bottles and that distiller gets your name
                  and <ConsentEmail>{contact.email}</ConsentEmail> so they can follow up —
                  favoriting switches this back on if you had turned it off. Visiting and
                  tasting share nothing. Turn it off here for the whole event, or booth by
                  booth.
                </ConsentBody>
              </ConsentCopy>
              <Switch
                initValue={shareContact}
                showText={false}
                onValueChange={setShareContact}
              />
            </Consent>
          )}
          <Footer>
            <Button label="Start Tasting" full onPress={dismiss} testID="onboarding-start" />
            <FooterHint>
              Reopen this guide anytime — tap the ? at the top of your passport.
            </FooterHint>
          </Footer>
        </Content>
      </BottomSheetView>
    </BottomSheetModal>
  );
};
