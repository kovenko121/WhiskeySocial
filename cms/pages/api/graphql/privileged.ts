import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { PRIVILEGED_OPERATIONS } from '../../../src/graphql-data-provider/utils/privilegedOperations';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = (await getServerSession(req, res, authOptions as any)) as any;

  if (!session?.idToken) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { query, operationName, variables } = req.body ?? {};
  const tokenTarget = PRIVILEGED_OPERATIONS[operationName];

  if (typeof query !== 'string' || !tokenTarget) {
    return res.status(400).json({ message: 'Unsupported operation' });
  }

  const withToken =
    tokenTarget === 'root'
      ? { ...variables, token: process.env.VENUE_TOKEN }
      : {
          ...variables,
          input: { ...(variables?.input ?? {}), token: process.env.VENUE_TOKEN },
        };

  const upstream = await fetch(process.env.API_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: session.idToken,
    },
    body: JSON.stringify({ query, variables: withToken }),
  });

  const body = await upstream.json().catch(() => ({}));

  return res.status(200).json({ status: upstream.status, body });
}
