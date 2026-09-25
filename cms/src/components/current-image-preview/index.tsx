import { Card, Image, Typography } from 'antd';
import { useEffect, useState } from 'react';

import { getObject } from '../../graphql-data-provider/utils/s3';

const { Title } = Typography;

type Props = {
  /**
   * The form value of an S3Object field, e.g. `Form.useWatch('image', form)`.
   * Only a saved S3Object renders — a fresh Upload payload has no `key`, so the
   * preview hides itself and lets AntD's own upload list show the new file.
   */
  value: unknown;
  label?: string;
  /** Bounding box for the thumbnail, in px. */
  size?: number;
};

const s3Key = (value: unknown): string | undefined => {
  if (!value || typeof value !== 'object') return undefined;
  const { key } = value as { key?: unknown };
  return typeof key === 'string' && key ? key : undefined;
};

/**
 * Shows the image currently saved on a record, above its upload field, so an
 * editor can see what was uploaded last time before deciding to replace it.
 *
 * Read-only on purpose: it never touches the form value, so it can be dropped in
 * next to any existing `Upload` without changing how that field saves. Render it
 * BEFORE the `Form.Item` — a named Form.Item injects value/onChange into its
 * child, so it must keep exactly one.
 */
export const CurrentImagePreview = ({
  value,
  label = 'Current image',
  size = 200,
}: Props) => {
  const [url, setUrl] = useState<string>();
  const key = s3Key(value);

  useEffect(() => {
    let active = true;
    if (!key) {
      setUrl(undefined);
      return undefined;
    }
    getObject(key)
      .then((signed) => {
        if (active) setUrl(signed);
      })
      .catch(() => {
        // Signing failed (missing object, expired creds) — show nothing rather
        // than a broken image.
        if (active) setUrl(undefined);
      });
    return () => {
      active = false;
    };
  }, [key]);

  if (!url) return null;

  return (
    <Card size="small" style={{ marginBottom: 12 }}>
      <Title level={5} style={{ marginTop: 0 }}>
        {label}
      </Title>
      <Image
        src={url}
        alt={label}
        style={{ maxWidth: size, maxHeight: size, objectFit: 'contain' }}
      />
    </Card>
  );
};

export default CurrentImagePreview;
