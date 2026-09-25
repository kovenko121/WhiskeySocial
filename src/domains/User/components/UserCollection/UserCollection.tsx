import {
  Button,
  Icon,
  RoundedDropdown,
  Skeleton,
  TagFilter,
  Text,
  Title,
  VerticalWhiskeyCard,
} from '@components';
import { useAuth } from '@contexts';
import { getTestId, setApostrophe } from '@helpers';
import {
  useGetUser,
  useHadPouredThisWhiskey,
  useUpdateCollectionPrivacy,
} from '@hooks';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps, UserType, UserWhiskeys, Whiskey, WhiskeyType,
  Routes
} from '@types';
import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { ImportCollectionModal } from '../ImportCollectionModal/ImportCollectionModal';
import {
  ButtonWrapper,
  DropDownSection,
  Empty,
  EmptyPostList,
  HeaderControls,
  HorizontalFlatList,
  IconButton,
  Link,
  MyCollectionDividerView,
  ViewListButton,
  ViewListLabel,
} from './styles';

export const UserCollection = ({ userId }: { userId: string }) => {
  const navigation = useNavigation<NavigationProps>();
  const [sortType, setSortType] = useState('alphabetical');
  const {
    user: { sub },
  } = useAuth();
  const { data: user, isLoading } = useGetUser(userId);
  const isOwner = userId === sub;
  const whiskeyItems = (user?.whiskeys?.items && Array.isArray(user?.whiskeys?.items) ? user?.whiskeys?.items : []) as UserWhiskeys[];
  const bottles = whiskeyItems
    .filter((item) => isOwner || !item?.archived)
    .flatMap(({ id, whiskey }) => ({
      id,
      whiskey,
    }));
  const { mutate: mutateCollectionPrivacy } = useUpdateCollectionPrivacy();
  const [myWhiskeysTags, setMyWhiskeysTags] = useState<string[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const { checkIfUserPoured } = useHadPouredThisWhiskey();

  const changeCollectionPrivacy = () => {
    mutateCollectionPrivacy(!user?.isMyCollectionPublic);
  };

  const goToWhiskey = async (id: string) => {
    navigation.navigate(Routes.WhiskeyInfo, { id });
  };

  const goToBottleList = async (id: string) => {
    navigation.navigate(Routes.BottleList, { id });
  };

  const SectionTitle = () => {
    if (user?.userType === UserType.PERSON) {
      if (userId === sub) {
        return ' My Collection';
      }
      return `${setApostrophe(user?.personFirstName)} Collection`;
    }
    return 'Whiskey Menu';
  };

  const openRandomBottle = async () => {
    if (!bottles.length) return;
    const randomIndex = Math.floor(Math.random() * bottles.length);
    const randomBottleId = bottles[randomIndex].id;
    navigation.navigate(Routes.BottleDetails, {
      bottleId: randomBottleId,
      myUser: user,
    });
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
      {user?.userType === UserType.PERSON ? (
        <MyCollectionDividerView>
          <Title size={18} mt={0} mb={0}>
            {SectionTitle()}
            {(user.isMyCollectionPublic || userId === sub) &&
              whiskeyItems.length > 0 && (
                <Text size={13}>{`  (${whiskeyItems.length})`}</Text>
              )}
          </Title>

          {userId === sub && (
            <HeaderControls>
              <ViewListButton
                onPress={() => navigation.navigate(Routes.MyCollectionList, { userId })}
              >
                <Icon name="list" size={12} color="primary500" />
                <ViewListLabel>View list</ViewListLabel>
              </ViewListButton>
              <IconButton
                onPress={changeCollectionPrivacy}
              >
                <Icon
                  name={user?.isMyCollectionPublic ? 'eye-on' : 'eye-off'}
                  size={21}
                  color="primary"
                />
              </IconButton>
            </HeaderControls>
          )}
        </MyCollectionDividerView>
      ) : (
        <MyCollectionDividerView>
          <Title size={18}>
            {SectionTitle()}{' '}
            {(user?.isMyCollectionPublic || userId === sub) &&
              whiskeyItems.length > 0 && (
                <Text size={13}>{`  (${whiskeyItems.filter((item) => isOwner || !item?.archived).length})`}</Text>
              )}
          </Title>
          {whiskeyItems.length > 0 && (
            <ViewListButton
              onPress={() => navigation.navigate(Routes.MyCollectionList, { userId })}
            >
              <Icon name="list" size={12} color="primary500" />
              <ViewListLabel>View list</ViewListLabel>
            </ViewListButton>
          )}
        </MyCollectionDividerView>
      )}

      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <>
          {whiskeyItems.length > 0 &&
            (user?.isMyCollectionPublic || userId === sub) && (
              <TagFilter
                tags={Object.keys(WhiskeyType)}
                selectedTags={myWhiskeysTags}
                setSelectedTags={setMyWhiskeysTags}
                search={() =>
                  navigation.navigate(Routes.MyCollectionList, { userId })
                }
              />
            )}
          {user ? (
            whiskeyItems.length > 0 && (
              <DropDownSection>
                <RoundedDropdown
                  sortType={sortType}
                  setSortType={setSortType}
                />
                {userId === sub && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 24 }}>
                    <Link
                      testID={getTestId('add')}
                      onPress={() =>
                        navigation.navigate(Routes.SelectWhiskey, {
                          myUserType: user.userType,
                          myWhiskeysIds: whiskeyItems.flatMap(({ whiskey }) =>
                            whiskey?.id ? [whiskey.id] : []
                          ),
                        })
                      }
                      color="primary500"
                    >
                      + Add
                    </Link>
                    <Link
                      onPress={() => setShowImportModal(true)}
                      color="primary500"
                    >
                      + Import
                    </Link>
                  </View>
                )}
              </DropDownSection>
            )
          ) : (
            <DropDownSection>
              <Skeleton width={70} height={28} />
              <Skeleton width={60} height={28} />
            </DropDownSection>
          )}
          <HorizontalFlatList
            data={
              user?.isMyCollectionPublic || userId === sub
                ? sortItems(
                  whiskeyItems
                    .filter((item) => isOwner || !item?.archived)
                    .flatMap(({ whiskey, createdAt }) => ({
                      ...whiskey,
                      count: 1,
                      createdAt,
                    }))
                    .filter(
                      (whiskey) =>
                        !myWhiskeysTags.length ||
                        (!!whiskey.type?.[0] &&
                          myWhiskeysTags.includes(whiskey.type[0]))
                    )
                ).reduce((acc: Array<Whiskey & { count: number }>, whiskey: Whiskey & { count: number }) => {
                  const index = acc.findIndex(
                    (item: Whiskey & { count: number }) => item.id === whiskey.id
                  );
                  if (index === -1) {
                    return [...acc, whiskey];
                  }
                  acc[index].count += 1;
                  return acc;
                }, [])
                : []
            }
            horizontal
            showsHorizontalScrollIndicator={false}
            removeClippedSubviews
            initialNumToRender={6}
            maxToRenderPerBatch={6}
            windowSize={7}
            keyExtractor={({ id }: { id: string }, index: number) => id + index}
            renderItem={({ item }: { item: Whiskey & { count: number } }) => (
              <VerticalWhiskeyCard
                whiskey={item}
                isMyCollection={user?.userType === UserType.PERSON}
                userPicture={
                  user?.userType === UserType.PERSON
                    ? user.profilePictureLoaded
                    : undefined
                }
                onPress={
                  user?.userType === UserType.PERSON && user?.id === sub
                    ? ({ id }) => goToBottleList(id)
                    : ({ id }) => goToWhiskey(id)
                }
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
                      testID={getTestId('add')}
                      bold
                      onPress={() => {
                        if (!user) return;
                        navigation.navigate(Routes.SelectWhiskey, {
                          myUserType: user.userType,
                          myWhiskeysIds: whiskeyItems.flatMap(({ whiskey }) =>
                            whiskey?.id ? [whiskey.id] : []
                          ),
                        });
                      }}
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
                    {myWhiskeysTags.length
                      ? `${'\n'}this type of whiskey yet.`
                      : `${' '}any Whiskeys yet.`}
                  </Text>
                )}
              </EmptyPostList>
            }
          />
          {userId === sub && whiskeyItems.length > 0 && (
            <ButtonWrapper>
              <Button
                label="What should I drink?"
                variant="outlineDefault"
                icon="idea"
                iconSize={20}
                onPress={openRandomBottle}
              />
            </ButtonWrapper>
          )}
        </>
      )}

      <ImportCollectionModal
        visible={showImportModal}
        onClose={() => setShowImportModal(false)}
      />
    </>
  );
};
