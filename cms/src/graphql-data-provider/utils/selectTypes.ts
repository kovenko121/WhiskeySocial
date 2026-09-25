import { SelectProps } from 'antd';
import {
  AdType,
  ClubRequestStatus,
  ProofType,
  ReviewRecommendationTagsType,
  VenueRequestStatus,
  WhiskeyType,
} from './graphQlTypes';

export const WhiskeyTypes: SelectProps['options'] = [
  { label: 'American', value: WhiskeyType.AMERICAN },
  { label: 'Bourbon', value: WhiskeyType.BOURBON },
  { label: 'Canadian', value: WhiskeyType.CANADIAN },
  { label: 'Flavored', value: WhiskeyType.FLAVORED },
  { label: 'Irish', value: WhiskeyType.IRISH },
  { label: 'Japanese', value: WhiskeyType.JAPANESE },
  { label: 'Rye', value: WhiskeyType.RYE },
  { label: 'Scotch', value: WhiskeyType.SCOTCH },
  { label: 'American Single Malt', value: WhiskeyType.SINGLE_MALT_AMERICAN },
  { label: 'Single Malt Scotch', value: WhiskeyType.SINGLE_MALT_SCOTCH },
  { label: 'Blended Scotch & WO', value: WhiskeyType.BLENDED_SCOTCH_AND_WO },
  { label: 'World', value: WhiskeyType.WORLD },
  { label: 'Tennessee Whiskey', value: WhiskeyType.TN_WHISKEY },
  { label: 'Malt', value: WhiskeyType.MALT },
  { label: 'Tequila', value: WhiskeyType.TEQUILA },
  { label: 'Tequila Reposado', value: WhiskeyType.TEQUILA_REPOSADO },
  { label: 'Tequila Añejo', value: WhiskeyType.TEQUILA_ANEJO },
  { label: 'Vintage Spirits', value: WhiskeyType.VINTAGE_SPIRITS },
];

export const AdTypes: SelectProps['options'] = [
  { label: 'Home', value: AdType.ACTIVITY },
  { label: 'Discover', value: AdType.DISCOVERY },
  { label: 'App start-up', value: AdType.SPONSORED },
  { label: 'Articles', value: AdType.ARTICLE },
];

export const ReviewRecommendationTags: SelectProps['options'] = [
  { label: 'OAKY', value: ReviewRecommendationTagsType.OAKY },
  { label: 'FRUITY', value: ReviewRecommendationTagsType.FRUITY },
  { label: 'NUTTY', value: ReviewRecommendationTagsType.NUTTY },
  { label: 'BRINY', value: ReviewRecommendationTagsType.BRINY },
  { label: 'BUTTERY', value: ReviewRecommendationTagsType.BUTTERY },
  { label: 'SPICY', value: ReviewRecommendationTagsType.SPICY },
  { label: 'SMOKY', value: ReviewRecommendationTagsType.SMOKY },
  { label: 'EARTHY', value: ReviewRecommendationTagsType.EARTHY },
  { label: 'HERBAL', value: ReviewRecommendationTagsType.HERBAL },
  { label: 'RICH', value: ReviewRecommendationTagsType.RICH },
  { label: 'SILKY', value: ReviewRecommendationTagsType.SILKY },
];

export const VenueRequestStatusOptions: SelectProps['options'] = [
  { label: 'PENDING', value: VenueRequestStatus.PENDING },
  { label: 'REJECTED', value: VenueRequestStatus.REJECTED },
  { label: 'FINISHED', value: VenueRequestStatus.FINISHED },
];

export const ClubRequestStatusOptions: SelectProps['options'] = [
  { label: 'PENDING', value: ClubRequestStatus.PENDING },
  { label: 'APPROVED', value: ClubRequestStatus.APPROVED },
  { label: 'REJECTED', value: ClubRequestStatus.REJECTED },
];

export const ProofTypes: SelectProps['options'] = [
  { label: 'Proof', value: ProofType.NUMERIC },
  { label: 'Cask Strength', value: ProofType.CASK_STRENGTH },
  { label: 'Barrel Proof', value: ProofType.BARREL_PROOF },
  { label: 'Full Proof', value: ProofType.FULL_PROOF },
];
