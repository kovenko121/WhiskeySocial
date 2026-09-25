import { capturePostHogEvent, groupPostHogBrand, groupPostHogVenue } from '../../config/posthog';
import { cioTrack } from '../../config/customerio';
import { createLogger } from '../../services/logger';

const logger = createLogger('composerAnalytics');

export const COMPOSER_EVENT_VERSION = 2;
export const COMPOSER_EVENT_MIGRATED_AT = '2026-09-04';

type ComposerEvent = {
  postId: string;
  userId: string;
  sourceScreen: string;
  photoAttached: boolean;
  noteLength: number;
  venueId?: string;
  venueName?: string;
  clubId?: string;
};

export type PourCreatedEvent = ComposerEvent & {
  pourId: string;
  pourRecordId: string;
  bottleId: string;
  bottleName?: string;
  brandId?: string;
  brandName?: string;
};

export type PostCreatedEvent = ComposerEvent & {
  inlineWhiskeyTagCount: number;
};

const versionProperties = {
  event_version: COMPOSER_EVENT_VERSION,
  event_migrated_at: COMPOSER_EVENT_MIGRATED_AT,
};

export const trackPourCreated = (event: PourCreatedEvent): void => {
  try {
    if (event.brandId) groupPostHogBrand(event.brandId, event.brandName || '');
    if (event.venueId) groupPostHogVenue(event.venueId, event.venueName || '');

    const properties = {
      pour_id: event.pourId,
      bottle_id: event.bottleId,
      pour_record_id: event.pourRecordId,
      post_id: event.postId,
      bottle_name: event.bottleName,
      brand_id: event.brandId,
      brand_name: event.brandName,
      venue_id: event.venueId,
      club_id: event.clubId,
      user_id: event.userId,
      source_screen: event.sourceScreen,
      timestamp: new Date().toISOString(),
      photo_attached: event.photoAttached,
      note_length: event.noteLength,
      ...versionProperties,
    };

    capturePostHogEvent(
      'pour_created',
      { ...properties, $set_once: { first_checkin_date: new Date().toISOString() } },
      { brand: event.brandId, venue: event.venueId }
    );

    cioTrack('pour_created', properties);
  } catch (err) {
    logger.error('Error tracking pour_created', err as Error);
  }
};

export const trackPostCreated = (event: PostCreatedEvent): void => {
  try {
    if (event.venueId) groupPostHogVenue(event.venueId, event.venueName || '');

    capturePostHogEvent(
      'post_created',
      {
        post_id: event.postId,
        venue_id: event.venueId,
        club_id: event.clubId,
        user_id: event.userId,
        source_screen: event.sourceScreen,
        timestamp: new Date().toISOString(),
        photo_attached: event.photoAttached,
        note_length: event.noteLength,
        inline_whiskey_tag_count: event.inlineWhiskeyTagCount,
        ...versionProperties,
      },
      { venue: event.venueId }
    );
  } catch (err) {
    logger.error('Error tracking post_created', err as Error);
  }
};
