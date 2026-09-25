import { amplify, queryClient } from '@services';
import { CollectionImportResult } from '@types';
import { useMutation } from '@tanstack/react-query';
import { importUserCollectionByCSV } from '../../graphql/mutations';
import { useGetUser } from '../user/useGetUser';

const useImportUserCollection = () => {
  const { data: user } = useGetUser();

  return useMutation<CollectionImportResult, Error, { fileKey: string }>({
    mutationFn: async ({ fileKey }) => {
      const result = await amplify.request<{
        importUserCollectionByCSV: CollectionImportResult;
      }>(importUserCollectionByCSV, { fileKey });
      return result.importUserCollectionByCSV;
    },
    onSuccess() {
      queryClient.refetchQueries({ queryKey: ['get-user', user?.id] });
    },
  });
  
};

export { useImportUserCollection };
