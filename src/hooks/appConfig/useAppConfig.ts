import { amplifyApiKey, queryClient } from '@services';
import { AppConfig } from '@types';
import { useQuery } from '@tanstack/react-query';
import { ListAppConfigs } from './query/listAppConfigs';

const fetchAppConfig = async (): Promise<Record<string, string>> => {
  const { listAppConfigs } = await amplifyApiKey.request<{
    listAppConfigs: { items: AppConfig[] };
  }>(ListAppConfigs);

  return listAppConfigs?.items?.reduce(
    (acc, { key, value }) => ({ ...acc, [key]: value }),
    {}
  ) ?? {};
};

const useAppConfig = () =>
  useQuery({
    queryKey: ['get-app-config'],
    queryFn: fetchAppConfig,
  });

const loadAppConfig = () =>
  queryClient.fetchQuery({
    queryKey: ['get-app-config'],
    queryFn: fetchAppConfig,
  });

export { loadAppConfig, useAppConfig };
