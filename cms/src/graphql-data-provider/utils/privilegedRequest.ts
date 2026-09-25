type GraphQlErrorResponse = {
  data?: any;
  errors?: { message?: string }[];
  status: number;
};

const asClientError = (message: string, response: GraphQlErrorResponse) => {
  const error = new Error(message) as Error & {
    response: GraphQlErrorResponse;
  };
  error.response = response;
  return error;
};

export const privilegedRequest = async <T>(
  query: string,
  operationName: string,
  variables?: Record<string, any>
): Promise<T> => {
  const response = await fetch('/api/graphql/privileged', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, operationName, variables }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw asClientError(body?.message || 'Privileged request failed', {
      status: response.status,
    });
  }

  const { status, body } = await response.json();

  if (body?.errors?.length) {
    throw asClientError(body.errors[0]?.message || 'GraphQL error', {
      data: body.data,
      errors: body.errors,
      status,
    });
  }

  if (status >= 400) {
    throw asClientError(`GraphQL request failed with status ${status}`, {
      data: body?.data,
      status,
    });
  }

  return body.data as T;
};
