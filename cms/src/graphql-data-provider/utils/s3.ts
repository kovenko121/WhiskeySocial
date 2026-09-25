const PICTURE_CONTENT_TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
};

const toBlob = (file: any): Blob => file?.originFileObj ?? file;

const pictureContentType = (file: any, blob: Blob): string => {
  const declared = blob?.type || file?.type;

  if (typeof declared === 'string' && declared.startsWith('image/')) {
    return declared;
  }

  const extension = `${file?.name ?? ''}`.split('.').pop()?.toLowerCase();

  return PICTURE_CONTENT_TYPES[`${extension}`] ?? 'image/jpeg';
};

const presignUpload = async (key: string, contentType: string) => {
  const response = await fetch('/api/s3/presign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, contentType }),
  });

  if (!response.ok) {
    throw new Error(`Could not sign the upload of ${key}`);
  }

  const { url } = await response.json();

  return url as string;
};

const putObject = async (key: string, blob: Blob, contentType: string) => {
  const url = await presignUpload(key, contentType);

  const response = await fetch(url, {
    method: 'PUT',
    body: blob,
    headers: { 'Content-Type': contentType },
  });

  if (!response.ok) {
    throw new Error(`Could not upload ${key}`);
  }

  return response;
};

export const uploadCSVFile = async ({
  key,
  file,
}: {
  key: string;
  file: any;
}) => putObject(`${key}.csv`, toBlob(file), 'text/csv');

export const uploadPicture = async ({
  key,
  file,
}: {
  key: string;
  file: any;
}) => {
  const blob = toBlob(file);

  return putObject(key, blob, pictureContentType(file, blob));
};

export const getObject = async (key: string) => {
  const response = await fetch(
    `/api/s3/presign?key=${encodeURIComponent(key)}`
  );

  if (!response.ok) {
    throw new Error(`Could not sign the download of ${key}`);
  }

  const { url } = await response.json();

  return url as string;
};
