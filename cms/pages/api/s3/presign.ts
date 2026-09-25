import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const EXPIRES_IN = 15 * 60;

const staticCredentials = () => {
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey) {
    return undefined;
  }

  return { accessKeyId, secretAccessKey };
};

const client = new S3Client({
  region: `${process.env.S3_REGION}`,
  credentials: staticCredentials(),
});

const objectKey = (key: unknown): string | null => {
  if (typeof key !== 'string') {
    return null;
  }
  const trimmed = key.replace(/^\/+/, '');
  if (!trimmed || trimmed.length > 1024 || trimmed.includes('..')) {
    return null;
  }
  return `public/${trimmed}`;
};

const uploadContentType = (contentType: unknown): string | null => {
  if (typeof contentType !== 'string') {
    return null;
  }
  if (contentType.startsWith('image/') || contentType === 'text/csv') {
    return contentType;
  }
  return null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions as any);

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const key = objectKey(req.query.key);

    if (!key) {
      return res.status(400).json({ message: 'Invalid key' });
    }

    const url = await getSignedUrl(
      client,
      new GetObjectCommand({
        Bucket: `${process.env.S3_BUCKET_NAME}`,
        Key: key,
      }),
      { expiresIn: EXPIRES_IN }
    );

    return res.status(200).json({ url });
  }

  if (req.method === 'POST') {
    const key = objectKey(req.body?.key);
    const contentType = uploadContentType(req.body?.contentType);

    if (!key) {
      return res.status(400).json({ message: 'Invalid key' });
    }

    if (!contentType) {
      return res.status(400).json({ message: 'Unsupported content type' });
    }

    const url = await getSignedUrl(
      client,
      new PutObjectCommand({
        Bucket: `${process.env.S3_BUCKET_NAME}`,
        Key: key,
        ContentType: contentType,
      }),
      { expiresIn: EXPIRES_IN }
    );

    return res.status(200).json({ url });
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ message: 'Method not allowed' });
}
