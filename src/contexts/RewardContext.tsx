import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { useUpdateIsAlreadyViewed } from '../hooks/rewards/useUpdateIsAlreadyViewed';
import { useUserRewards } from '../hooks/rewards/useUserRewards';

const RewardContext = createContext({
  rewardsCompleted: {},
  setRewardsCompleted: () => {},
});

export const useReward = () => useContext(RewardContext);

export const RewardProvider = ({ children }: { children: ReactNode }) => {
  const { data } = useUserRewards();
  const { mutate } = useUpdateIsAlreadyViewed();
  const [rewardsCompleted, setRewardsCompleted] = useState({});

  useEffect(() => {
    const rewardsCompletedAndNotReedemed =
      data?.items?.filter(
        (item: { isCompleted?: boolean; isRedeemed?: boolean; isAlreadyViewed?: boolean }) =>
          item?.isCompleted && !item?.isRedeemed && !item?.isAlreadyViewed
      ) ?? [];

    if (rewardsCompletedAndNotReedemed?.length) {
      setRewardsCompleted(rewardsCompletedAndNotReedemed[0]);
      mutate({ rewardId: rewardsCompletedAndNotReedemed[0]?.id });
    }
  }, [data?.items, mutate]);

  const contextValue = useMemo(
    () => ({ rewardsCompleted, setRewardsCompleted }),
    [rewardsCompleted, setRewardsCompleted]
  );

  return (
    <RewardContext.Provider value={contextValue}>
      {children}
    </RewardContext.Provider>
  );
};
