import {
  useCreateUserFavoriteArticles,
  useGetUser,
  useRemoveArticleFromFavorites,
} from '@hooks';
import { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Icon } from '../Icon/Icon';

export const FavoriteButton = ({ guideId }: { guideId?: string }) => {
  const { data: myUser } = useGetUser();
  const [favoriteState, setFavoriteState] = useState(
    !!myUser?.favoriteGuides?.items.filter(
      (item) => item?.guides?.id === guideId
    ).length
  );
  const { mutate, isLoading } = useCreateUserFavoriteArticles();
  const { mutate: mutateRemove, isLoading: isLoadingRemove } =
    useRemoveArticleFromFavorites();

  useEffect(() => {
    setFavoriteState(
      !!myUser?.favoriteGuides?.items.filter(
        (item) => item?.guides?.id === guideId
      ).length
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myUser]);

  const handleFavorite = () => {
    if (favoriteState && !isLoading) {
      setFavoriteState(false);
      mutateRemove({ guideId: guideId! });
    } else if (!favoriteState && !isLoadingRemove) {
      setFavoriteState(true);
      mutate({ guideId: guideId! });
    }
  };
  return (
    <TouchableOpacity onPress={handleFavorite}>
      <Icon
        name={favoriteState ? 'favorite-filled' : 'favorite'}
        color={favoriteState ? 'primary' : 'grey200'}
        size={25}
      />
    </TouchableOpacity>
  );
};
