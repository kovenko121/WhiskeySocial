import {
  Icon,
  RoundedDropdown,
  TagFilter,
  Text,
  Title,
  VerticalWhiskeyCard,
} from '@components';
import { useAuth } from '@contexts';
import { setApostrophe } from '@helpers';
import { useGetUser, useHadPouredThisWhiskey } from '@hooks';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps, UserType, Whiskey, WhiskeyType,
  Routes
} from '@types';
import { useState } from 'react';
import { ActivityIndicator, Share } from 'react-native';
import {
  DropDownSection,
  Empty,
  EmptyPostList,
  HorizontalFlatList,
  IconButton,
  Link,
  WhishlistDividerView,
} from './styles';

export const UserWishList = ({ userId }: { userId: string }) => {
  const { data: user, isLoading } = useGetUser(userId);
  const {
    user: { sub },
  } = useAuth();
  const [myWishListTags, setMyWishListTags] = useState<string[]>([]);
  const navigation = useNavigation<NavigationProps>();
  const [sortType, setSortType] = useState('default');
  const { checkIfUserPoured } = useHadPouredThisWhiskey();

  const addToWishList = () => {
    navigation.navigate(Routes.AddWhiskeyToWishlist);
  };

  const handleShare = () =>
    Share.share({
      message: `Look at my Wishlist on Whiskey Social\nhttps://whiskeysocial.app/user/${user!.id}/wishlist`,
    });

  const goToWhiskey = async (id: string) => {
    navigation.navigate(Routes.WhiskeyInfo, { id });
  };

  const sortItems = (items: any) => {
    if (sortType === 'alphabetical') {
      return items.sort((a: any, b: any) => {
        const fullNameA = (a.brandUser?.brandName || '') + a.name;
        const fullNameB = (b.brandUser?.brandName || '') + b.name;
        return fullNameA.localeCompare(fullNameB);
      });
    }
    return items.sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  return (
    <>
      {user?.userType === UserType.PERSON && (
        <WhishlistDividerView>
          <Title size={18}>
            {userId === sub
              ? ' My Wishlist'
              : `${setApostrophe(user?.personFirstName)} Wishlist`}
          </Title>
          {userId === sub && (user.wishList?.items?.length ?? 0) > 0 && (
            <IconButton onPress={handleShare}>
              <Icon name="share" size={20} color="white" />
            </IconButton>
          )}
        </WhishlistDividerView>
      )}

      {isLoading ? (
        <ActivityIndicator />
      ) : (
        user?.userType === UserType.PERSON &&
        user.wishList && (
          <>
            {user.wishList.items.length > 0 && (
              <TagFilter
                tags={Object.keys(WhiskeyType)}
                selectedTags={myWishListTags}
                setSelectedTags={setMyWishListTags}
              />
            )}
            {user?.wishList?.items && user?.wishList?.items.length > 0 && (
              <DropDownSection>
                <RoundedDropdown
                  sortType={sortType}
                  setSortType={setSortType}
                />
                {userId === sub && (
                  <Link onPress={() => addToWishList()} color="primary500">
                    + Add
                  </Link>
                )}
              </DropDownSection>
            )}

            <HorizontalFlatList
              data={sortItems(
                user.wishList.items
                  .filter(
                    (item): item is NonNullable<typeof item> => item != null
                  )
                  .map((item) => ({ ...item.whiskey, createdAt: item.createdAt }))
                  .filter(
                    (whiskey) =>
                      !myWishListTags.length ||
                      (!!whiskey.type?.[0] &&
                        myWishListTags.includes(whiskey.type[0]))
                  )
              )}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={({ id }: { id: string }, index: number) => id + index}
              renderItem={({ item }: { item: Whiskey }) => (
                <VerticalWhiskeyCard
                  whiskey={item}
                  userPicture={user.profilePictureLoaded}
                  onPress={({ id }) => goToWhiskey(id)}
                  pour={checkIfUserPoured(item.id)}
                />
              )}
              ListFooterComponent={<Empty />}
              ListEmptyComponent={
                <EmptyPostList>
                  {userId === sub ? (
                    <>
                      <Text size={13} color="white" align="center">
                        You don't have any Whiskeys yet.
                      </Text>
                      <Link
                        bold
                        onPress={() => addToWishList()}
                        color="primary500"
                      >
                        + Add a Whiskey
                      </Link>
                    </>
                  ) : (
                    <Text size={13} color="white" align="center">
                      {`${user?.personFirstName
                          ? user?.personFirstName
                          : user?.venueName
                        } doesn't have`}
                      {myWishListTags.length
                        ? `${'\n'}this type of whiskey yet.`
                        : `${' '}any Whiskeys yet.`}
                    </Text>
                  )}
                </EmptyPostList>
              }
            />
          </>
        )
      )}
    </>
  );
};
