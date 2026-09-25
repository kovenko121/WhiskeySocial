import {
  addPicture,
  getBlob,
  getTestId,
  getFullWhiskeyName,
  isUnauthorizedClubActionError,
} from '@helpers';
import { useAuth } from '@contexts';
import {
  useBatchCheckUserReviews,
  useComposerPourId,
  useCreatePost,
  useGetUser,
  useHadPouredThisWhiskey,
} from '@hooks';
import {
  User,
  UserType,
  Whiskey,
  InlineTagInput,
  InlineTagType,
  EntitySearchResult,
  PickedImage,
} from '@types';
import { Storage } from 'aws-amplify';
import { useEffect, useState, useRef } from 'react';
import { Alert, View } from 'react-native';
import { createImageKey } from '@whiskey-social/image-keys';
import { FindUserModalBottom } from "../../../Activity/components/FindUserModalBottom/FindUserModalBottom";
import { FindWhiskeyModalBottom } from "../../../Activity/components/FindWhiskeyModalBottom/FindWhiskeyModalBottom";
import { Button } from '../../../../components/Button/Button';
import {
  HorizontalUserCard,
  HorizontalWhiskeyCard,
} from '../../../../components/Card/HorizontalCard/HorizontalCard';
import { Divider } from '../../../../components/Divider/Divider';
import { Icon } from '../../../../components/Icon/Icon';
import {
  TaggableTextInput,
  TaggableTextInputRef,
} from '../../../../components/InlineTagInput/InlineTagInput';
import { ModalBottom } from '../../../../components/ModalBottom/ModalBottom';
import { PopUpMenu } from '../../../../components/PopUpMenu/PopUpMenu';
import { ProfilePicture } from '../../../../components/ProfilePicture/ProfilePicture';
import { Tag } from '../../../../components/Tags/Tags';
import { Link, Text } from '../../../../components/Text/Text';
import {
  Buttons,
  CardContainer,
  Column,
  ContentContainer,
  DeleteButton,
  Empty,
  PhotoContainer,
  PostContainer,
  Row,
  TagButton,
  HeaderRow,
  HeaderTitle,
} from './styles';

interface CreateClubPostModalProps {
  onBackButtonPress: () => void;
  visible: boolean;
  clubId: string;
  clubIsPrivate: boolean;
  onPostCreated?: (postId: string, hasPhoto: boolean) => void;
}

const CreateClubPostModal = ({
  onBackButtonPress,
  visible,
  clubId,
  clubIsPrivate,
  onPostCreated,
}: CreateClubPostModalProps) => {
  const {
    user: { sub },
  } = useAuth();

  const { data, isLoading } = useGetUser();
  const { checkIfUserPoured } = useHadPouredThisWhiskey();
  const { getReviewedWhiskeyIds } = useBatchCheckUserReviews();

  const textInputRef = useRef<TaggableTextInputRef>(null);
  const [checkin, setCheckin] = useState<User>();
  const [tagUser, setTagUser] = useState<User>();
  const [description, setDescription] = useState('');
  const [inlineTags, setInlineTags] = useState<InlineTagInput[]>([]);
  const [tagDisplayNames, setTagDisplayNames] = useState<
    Record<string, string>
  >({});
  const [checkinWindowVisible, setCheckinVisible] = useState(false);
  const [tagUserWindowVisible, setTagUserVisible] = useState(false);
  const [whiskey, setWhiskey] = useState<Whiskey>();
  const [findWhiskeyVisible, setFindWhiskeyVisible] = useState(false);
  const [showPictureMenu, setPictureMenuStatus] = useState(false);
  const [isEmptyForm, setIsEmptyForm] = useState(true);
  const [postImage, setPostImage] = useState<PickedImage>({ uri: '' });
  const [isMutating, setIsMutating] = useState(false);
  const [inputLines, setInputLines] = useState<number>(2);

  // Auto-focus the text input when modal becomes visible
  useEffect(() => {
    if (visible) {
      // Delay focus slightly to ensure modal is fully rendered
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 300);
    }
  }, [visible]);

  const openWhiskeyWindow = () => {
    setPictureMenuStatus(false);
    setFindWhiskeyVisible(!findWhiskeyVisible);
  };

  const openCheckinWindow = () => {
    setPictureMenuStatus(false);
    setCheckinVisible(!checkinWindowVisible);
  };

  const openTagPersonWindow = () => {
    setTagUserVisible(!tagUserWindowVisible);
  };

  const cleanOnCancel = () => {
    setIsEmptyForm(true);
    setPostImage({ uri: '' });
    setDescription('');
    setInlineTags([]);
    setTagDisplayNames({});
    setWhiskey(undefined);
    setCheckin(undefined);
    setTagUser(undefined);
    onBackButtonPress();
    setIsMutating(false);
  };

  const handleEntityTagged = (entity: EntitySearchResult) => {
    // Store display names for whiskeys so we can use them later
    if (entity.type === InlineTagType.WHISKEY) {
      const whiskeyObj: Whiskey = {
        id: entity.id,
        name: entity.name,
        brandUser: entity.whiskeyBrandUser,
      } as Whiskey;

      const fullName = getFullWhiskeyName(whiskeyObj);

      setTagDisplayNames((prev) => ({
        ...prev,
        [entity.id]: fullName,
      }));
    }
  };

  const handlePostSuccess = async () => {
    // Store the whiskey and inline tags before cleaning the modal state
    const taggedWhiskey = whiskey;
    const inlineWhiskeyTags = inlineTags.filter(
      (tag) => tag.type === InlineTagType.WHISKEY
    );
    const displayNames = tagDisplayNames;

    // Clean up the modal immediately
    cleanOnCancel();

    // For club posts, we still want to check if whiskeys need review
    // Collect all whiskeys that need review checking (old-style tag + inline tags)
    const whiskeysToCheck: Array<{ id: string; name: string }> = [];

    // Add old-style tagged whiskey if present
    if (taggedWhiskey && data?.userType !== UserType.BRAND) {
      whiskeysToCheck.push({
        id: taggedWhiskey.id,
        name: taggedWhiskey.fullName ?? '',
      });
    }

    // Add inline-tagged whiskeys using the stored display names
    if (data?.userType !== UserType.BRAND) {
      inlineWhiskeyTags.forEach((tag) => {
        whiskeysToCheck.push({
          id: tag.entityId,
          name: displayNames[tag.entityId] || tag.text.replace(/#/g, ''),
        });
      });
    }

    // Deduplicate whiskeys by ID
    const uniqueWhiskeys = Array.from(
      new Map(whiskeysToCheck.map((w) => [w.id, w])).values()
    );

    // Batch check which whiskeys have been reviewed
    const whiskeyIds = uniqueWhiskeys.map((w) => w.id);
    const reviewedWhiskeyIds = await getReviewedWhiskeyIds(whiskeyIds, sub);

    // Filter out whiskeys that have already been reviewed
    const unreviewedWhiskeys = uniqueWhiskeys.filter(
      (w) => !reviewedWhiskeyIds.includes(w.id)
    );

    // Note: For club posts, we don't automatically navigate to review flow
    // The user can review whiskeys later from their profile or the whiskey detail page
    // This keeps the club experience focused on the club itself
    if (unreviewedWhiskeys.length > 0) {
      // Could optionally show a toast here suggesting to review the whiskey
      // For now, just close the modal - the post was created successfully
    }
  };

  const handleCreatePostError = (error: Error) => {
    setIsMutating(false);
    // Show membership error or generic message for other errors
    const message = isUnauthorizedClubActionError(error)
      ? error.message
      : 'Something went wrong. Please try again.';
    Alert.alert('Cannot Create Post', message, [
      { text: 'OK', onPress: cleanOnCancel },
    ]);
  };

  const { mutate } = useCreatePost(
    handlePostSuccess,
    onPostCreated,
    handleCreatePostError
  );

  const getPourId = useComposerPourId(visible);

  const handleSubmit = async () => {
    if (!isEmptyForm) {
      setIsMutating(true);

      if (postImage.uri !== '') {
        const fileName = postImage?.uri?.split('/').pop() as string;

        try {
          const blob = await getBlob(postImage.uri);
          const prefixedFileName = createImageKey('post', fileName);
          Storage.put(prefixedFileName, blob, { level: 'public' });

          mutate({
            pourId: getPourId(),
            description,
            photoKey: prefixedFileName,
            photoDimensions: [
              { width: postImage.width, height: postImage.height },
            ],
            whiskey,
            checkin,
            tagUser,
            inlineTags,
            whiskeyDisplayNames: tagDisplayNames,
            clubId,
            clubIsPrivate,
          });
        } catch (error) {
          setIsMutating(false);
        }
      } else {
        mutate({
          pourId: getPourId(),
          description,
          whiskey,
          checkin,
          tagUser,
          inlineTags,
          whiskeyDisplayNames: tagDisplayNames,
          clubId,
          clubIsPrivate,
        });
      }
    }
  };

  useEffect(() => {
    setIsEmptyForm(
      !(
        description.trim() !== '' ||
        postImage.uri ||
        whiskey ||
        checkin ||
        tagUser
      )
    );
  }, [postImage.uri, whiskey, tagUser, checkin, description]);

  const options = [
    {
      id: 'upload-picture',
      title: 'Upload Picture',
      icon: 'upload',
      action: () => addPicture('upload', setPictureMenuStatus, setPostImage),
    },
    {
      id: 'take-photo',
      title: 'Take Photo',
      icon: 'take-picture',
      action: () => addPicture('take', setPictureMenuStatus, setPostImage),
    },
  ];

  const resolveAuthorName = () => {
    if (data?.userType === UserType.PERSON) {
      return `${data?.personFirstName} ${data?.personLastName}`;
    }
    if (data?.userType === UserType.BRAND) return data?.brandName;
    return data?.venueName;
  };

  return (
    !isLoading && (
      <ModalBottom onBackButtonPress={onBackButtonPress} visible={visible}>
        <PostContainer>
          <HeaderRow>
            <Link
              color="primary500"
              bold
              onPress={cleanOnCancel}
              testID={getTestId('cancel')}
            >
              Cancel
            </Link>
            <HeaderTitle>Club Post</HeaderTitle>
            <Button
              label="Share"
              onPress={handleSubmit}
              disabled={isEmptyForm}
              loading={isMutating}
            />
          </HeaderRow>
          <ContentContainer>
            <View>
              <Row>
                <Row>
                  <ProfilePicture
                    image={
                      data?.userType === UserType.BRAND
                        ? data?.brandLogoLoaded || data?.profilePictureLoaded
                        : data?.profilePictureLoaded
                    }
                    size="small"
                    border
                  />
                  <Column>
                    <Text bold mv={6} size={13}>
                      {resolveAuthorName()}
                    </Text>
                  </Column>
                </Row>
              </Row>
              <Divider h={2} mt={18} />
              <Buttons>
                <TagButton
                  testID={getTestId('photo')}
                  onPress={() =>
                    postImage.uri
                      ? setPostImage({ uri: '' })
                      : setPictureMenuStatus(!showPictureMenu)
                  }
                >
                  <Tag
                    text="Photo"
                    selected={!!postImage.uri}
                    icon="picture"
                    close
                  />
                </TagButton>
                <TagButton
                  testID={getTestId('whiskey')}
                  onPress={() =>
                    whiskey ? setWhiskey(undefined) : openWhiskeyWindow()
                  }
                >
                  <Tag text="Whiskey" selected={!!whiskey} icon="wine" close />
                </TagButton>

                <TagButton
                  testID={getTestId('tag-person')}
                  onPress={() =>
                    tagUser ? setTagUser(undefined) : openTagPersonWindow()
                  }
                >
                  <Tag
                    text="Tag People"
                    selected={!!tagUser}
                    icon="add-user"
                    close
                  />
                </TagButton>
                <TagButton
                  testID={getTestId('check-in')}
                  onPress={() =>
                    checkin ? setCheckin(undefined) : openCheckinWindow()
                  }
                >
                  <Tag text="Tag Place" selected={!!checkin} icon="gps" close />
                </TagButton>
              </Buttons>
              {showPictureMenu && (
                <PopUpMenu
                  width={42}
                  options={options}
                  alignItems="bottom"
                  paddingBottom={95}
                  paddingLeft={5}
                  setVisibleStatus={setPictureMenuStatus}
                  reverse
                  showLoading={false}
                />
              )}

              <TaggableTextInput
                ref={textInputRef}
                value={description}
                onChangeText={setDescription}
                tags={inlineTags}
                onTagsChange={setInlineTags}
                onEntityTagged={handleEntityTagged}
                placeholder="What are you doing now? Use @ to tag members, venues, brands, and # to tag whiskeys"
                numberOfLines={inputLines}
                multiline
                maxLength={1000}
                counter={`${1000 - (description?.length ?? 0)} / 1000`}
                onContentSizeChange={(e) =>
                  setInputLines(e.nativeEvent.contentSize.height <= 70 ? 2 : 3)
                }
                clubId={clubId}
              />

              {postImage.uri && (
                <CardContainer>
                  <PhotoContainer source={postImage} />
                  <DeleteButton
                    onPress={() => {
                      setPostImage({ uri: '' });
                    }}
                  >
                    <Icon color="white" size={16} name="close" />
                  </DeleteButton>
                </CardContainer>
              )}

              {whiskey && (
                <CardContainer>
                  <HorizontalWhiskeyCard
                    shadow
                    whiskey={whiskey}
                    deleteButton
                    onDeleteButtonPress={() => setWhiskey(undefined)}
                    pour={checkIfUserPoured(whiskey.id)}
                  />
                </CardContainer>
              )}

              {tagUser && (
                <CardContainer>
                  <HorizontalUserCard
                    shadow
                    user={tagUser}
                    deleteButton
                    onDeleteButtonPress={() => setTagUser(undefined)}
                    followButton={false}
                  />
                </CardContainer>
              )}

              {checkin && (
                <CardContainer>
                  <HorizontalUserCard
                    shadow
                    user={checkin}
                    deleteButton
                    onDeleteButtonPress={() => setCheckin(undefined)}
                    followButton={false}
                  />
                </CardContainer>
              )}
              <Empty />
            </View>
          </ContentContainer>
          <FindUserModalBottom
            onBackButtonPress={() => setTagUserVisible(!tagUserWindowVisible)}
            onUserSelected={(user) => {
              setTagUser(user);
              setTagUserVisible(!tagUserWindowVisible);
            }}
            visible={tagUserWindowVisible}
            clubId={clubId}
          />
          <FindUserModalBottom
            onBackButtonPress={() => setCheckinVisible(!checkinWindowVisible)}
            onUserSelected={(user) => {
              setCheckin(user);
              setCheckinVisible(!checkinWindowVisible);
            }}
            userType={UserType.VENUE}
            visible={checkinWindowVisible}
          />
          <FindWhiskeyModalBottom
            onBackButtonPress={() => setFindWhiskeyVisible(!findWhiskeyVisible)}
            onWhiskeySelected={(selectedWhiskey) => {
              setWhiskey(selectedWhiskey);
              setFindWhiskeyVisible(!findWhiskeyVisible);
            }}
            visible={findWhiskeyVisible}
          />
        </PostContainer>
      </ModalBottom>
    )
  );
};

export { CreateClubPostModal };
