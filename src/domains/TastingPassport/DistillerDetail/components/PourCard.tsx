/**
 * One bottle at a booth: name, brand, style chip, rating/proof, with Tasted and Favorite toggles
 * styled like the booth toggles. Marking Tasted auto-stamps the booth (handled in the store).
 *
 * The card opens the app's bottle page when the pour maps to a catalogue whiskey. A hand-added
 * pour has no page to open, so it stays inert rather than leading somewhere empty.
 */
import { CrownIcon, Icon, Tag } from '@components';
import { getTestId } from '@helpers';
import { useSignedImage } from '../../data/useSignedImage';
import { Pour, PourStatus } from '../../types';
import { ToggleButton } from './ToggleButton';
import {
  PourBody,
  PourCardContainer,
  PourCardWrapper,
  PourHeading,
  PourImage,
  PourInfo,
  PourMeta,
  PourName,
  PourRating,
  PourStat,
  PourStatLabel,
  PourStatValue,
  PourTagRow,
  PourThumb,
  PourToggleRow,
} from './styles';

type Props = {
  pour: Pour;
  status: PourStatus;
  onTasted: (value: boolean) => void;
  onFav: (value: boolean) => void;
  onOpen?: () => void;
  /** The event has closed: the bottle still opens, its toggles no longer move. */
  disabled?: boolean;
};

/**
 * Absent OR zero prints nothing: no spirit is 0 proof and no bottle scores 0, so a 0
 * already sitting in the CMS is bad data rather than a value worth showing. A barrel-proof
 * release carries "Barrel Proof" in its style chip, which is the honest statement anyway.
 */
const statLabel = (value: number | null | undefined, suffix: string): string =>
  typeof value === 'number' && value > 0 ? `${value}${suffix}` : '';

export const PourCard = ({
  pour,
  status,
  onTasted,
  onFav,
  onOpen,
  disabled = false,
}: Props) => {
  const bottle = useSignedImage(pour.image);
  const proofLabel = statLabel(pour.proof, ' proof');
  const ratingLabel =
    typeof pour.rating === 'number' && pour.rating > 0 ? pour.rating.toFixed(1) : '';

  return (
    <PourCardWrapper>
      <PourCardContainer
        onPress={onOpen}
        disabled={!onOpen}
        testID={getTestId(`pour-open-${pour.id}`)}
      >
        <PourThumb>
          {bottle.source && (
            <PourImage source={bottle.source} onError={bottle.clear} />
          )}
          {!bottle.source && <Icon name="wine" size={36} color="grey400" />}
        </PourThumb>
        <PourBody>
          <PourInfo>
            <PourHeading>
              <PourName>{pour.name}</PourName>
              {Boolean(pour.brand) && (
                <PourMeta numberOfLines={1}>{pour.brand}</PourMeta>
              )}
            </PourHeading>
            {Boolean(pour.tag) && (
              <PourTagRow>
                <Tag text={pour.tag} ellipsis />
              </PourTagRow>
            )}
          </PourInfo>
          <PourStat>
            {Boolean(ratingLabel) && (
              <PourRating>
                <CrownIcon size={16} color="warning" />
                <PourStatValue>{ratingLabel}</PourStatValue>
              </PourRating>
            )}
            {Boolean(proofLabel) && <PourStatLabel>{proofLabel}</PourStatLabel>}
          </PourStat>
        </PourBody>
      </PourCardContainer>
      <PourToggleRow>
        <ToggleButton
          icon="check"
          label="Tasted"
          active={status.tasted}
          activeColor="warning"
          onPress={() => onTasted(!status.tasted)}
          disabled={disabled}
          testID={`pour-tasted-${pour.id}`}
        />
        <ToggleButton
          icon="heart"
          label="Favorite"
          active={status.fav}
          activeColor="red"
          onPress={() => onFav(!status.fav)}
          disabled={disabled}
          testID={`pour-fav-${pour.id}`}
        />
      </PourToggleRow>
    </PourCardWrapper>
  );
};
