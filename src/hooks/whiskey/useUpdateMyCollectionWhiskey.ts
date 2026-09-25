import { amplify, queryClient } from '@services';
import { UserWhiskeys, ProofType } from '@types';
import { useMutation } from '@tanstack/react-query';
import { useGetUser } from '../user/useGetUser';
import { UpdateMyCollectionWhiskey } from './mutation/updateMyCollectionWhiskey';

const useUpdateMyCollectionWhiskey = (
  onSuccess: () => void,
  bottleId: string
) => {
  const { data: user } = useGetUser();
  return useMutation<
    UserWhiskeys,
    unknown,
    {
      bottleId: string;
      age?: string | undefined;
      batch?: string | undefined;
      proof?: string | null;
      proofType?: ProofType | undefined;
      bottle?: string | undefined;
      barrel?: string | undefined;
      rick?: string | undefined;
      warehouse?: string | undefined;
      storePick?: string | undefined;
      singleBarrel?: boolean | undefined;
      purchaseYear?: string | undefined;
      style?: string | undefined;
      notes?: string | undefined;
    }
  >({
    mutationFn: async (data) => {
      const { updateUserWhiskeys } = await amplify.request<{
        updateUserWhiskeys: UserWhiskeys;
      }>(UpdateMyCollectionWhiskey, {
        ...data,
        // A cleared field has to travel as an explicit null. `undefined` is
        // dropped at serialization, which leaves the stored value in place.
        proof: data?.proof != null ? parseFloat(data.proof) : null,
        singleBarrel: data?.singleBarrel !== undefined ? data.singleBarrel : null,
      });

      return updateUserWhiskeys;
    },
    onSuccess() {
      queryClient.refetchQueries({
        queryKey: ['get-user-whiskey', bottleId],
      });
      queryClient.refetchQueries({ queryKey: ['get-user', user?.id] });
      onSuccess();
    },
  });
};

export { useUpdateMyCollectionWhiskey };
