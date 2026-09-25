// InlineTag/InlineTagInput/InlineTagType are not re-exported here: the `@types`
// barrel already star-exports them from './api', and re-exporting makes those
// names ambiguous across the barrel's star exports.
import { InlineTagType as InlineTagTypeEnum, S3Object, User } from './api';

export interface EntitySearchResult {
  id: string;
  type: InlineTagTypeEnum;
  name: string;
  username?: string;
  displayName?: string;
  profilePicture?: S3Object | null;
  logo?: S3Object | null;
  location?: string;
  // Person-specific fields
  personFirstName?: string;
  personLastName?: string;
  // Venue-specific fields
  venueName?: string;
  // Brand-specific fields
  brandName?: string;
  // Social fields
  followers?: string[];
  following?: string[];
  // Whiskey-specific fields
  whiskeyFullName?: string;
  whiskeyType?: Array<string | null> | null;
  whiskeyPicture?: S3Object | null;
  whiskeyBrandUser?: User | null;
  whiskeyCalculatedRating?: number;
}