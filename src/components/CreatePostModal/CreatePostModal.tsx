import { addPicture, getBlob, getTestId, getFullWhiskeyName, uploadMultiplePictures } from '@helpers';
import { useAuth } from '@contexts';
import { useBatchCheckUserReviews, useComposerPourId, useCreatePost, useGetUser, useHadPouredThisWhiskey } from '@hooks';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps, User, UserType, Whiskey, InlineTagInput, InlineTagType, EntitySearchResult,
  PickedImage,
  Routes
} from '@types';
import { Storage } from 'aws-amplify';
import { useEffect, useState, useRef } from 'react';
import { Image, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { theme } from '@theme';
import { createImageKey } from '@whiskey-social/image-keys';
import { FindUserModalBottom } from '../../domains/Activity/components/FindUserModalBottom/FindUserModalBottom';
import { FindWhiskeyModalBottom } from '../../domains/Activity/components/FindWhiskeyModalBottom/FindWhiskeyModalBottom';
import { Button } from '../Button/Button';
import {
  HorizontalUserCard,
  HorizontalWhiskeyCard,
} from '../Card/HorizontalCard/HorizontalCard';
import { Divider } from '../Divider/Divider';
import { Icon } from '../Icon/Icon';
import { TaggableTextInput, TaggableTextInputRef } from '../InlineTagInput/InlineTagInput';
import { ModalBottom } from '../ModalBottom/ModalBottom';
import { PopUpMenu } from '../PopUpMenu/PopUpMenu';
import { ProfilePicture } from '../ProfilePicture/ProfilePicture';
import { Tag } from '../Tags/Tags';
import { Link, Text } from '../Text/Text';
import {
  AddPhotoButton,
  Buttons,
  CardConteiner,
  Column,
  ContentContainer,
  Empty,
  PhotoGrid,
  PhotoThumbnail,
  PostContainer,
  RemoveButton,
  Row,
  TagButton,
  ThumbnailWrapper,
} from './styles';

const CreatePostModal = ({
  onBackButtonPress,
  visible,
  venueCheckin,
  whiskeyTag,
  onPostCreated,
}: {
  onBackButtonPress: () => void;
  visible: boolean;
  venueCheckin?: User;
  whiskeyTag?: Whiskey;
  onPostCreated?: (postId: string, hasPhoto: boolean) => void;
}) => {
  const navigation = useNavigation<NavigationProps>();
  const {
    user: { sub },
  } = useAuth();

  useEffect(() => {
    if (venueCheckin) {
      setCheckin(venueCheckin);
    }
    if (whiskeyTag) {
      setWhiskey(whiskeyTag);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const { data, isLoading } = useGetUser();
  const { checkIfUserPoured } = useHadPouredThisWhiskey();
  const { getReviewedWhiskeyIds } = useBatchCheckUserReviews();

  const textInputRef = useRef<TaggableTextInputRef>(null);
  const [checkin, setCheckin] = useState<User>();
  const [tagUser, setTagUser] = useState<User>();
  const [description, setDescription] = useState('');
  const [inlineTags, setInlineTags] = useState<InlineTagInput[]>([]);
  const [tagDisplayNames, setTagDisplayNames] = useState<Record<string, string>>({});
  const [checkinWindowVisible, setCheckinVisible] = useState(false);
  const [tagUserWindowVisible, setTagUserVisible] = useState(false);
  const [whiskey, setWhiskey] = useState<Whiskey>();
  const [findWhiskeyVisible, setFindWhiskeyVisible] = useState(false);
  const [showPictureMenu, setPictureMenuStatus] = useState(false);
  const [isEmptyForm, setIsEmptyForm] = useState(true);
  const [postImages, setPostImages] = useState<PickedImage[]>([]);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
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
    setPostImages([]);
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
    // Store display names for whiskeys so we can use them later in the review flow
    if (entity.type === InlineTagType.WHISKEY) {
      // Convert EntitySearchResult to Whiskey object to use getFullWhiskeyName helper
      const whiskeyObj: Whiskey = {
        id: entity.id,
        name: entity.name,
        brandUser: entity.whiskeyBrandUser,
      } as Whiskey;

      const fullName = getFullWhiskeyName(whiskeyObj);

      setTagDisplayNames(prev => ({
        ...prev,
        [entity.id]: fullName,
      }));
    }
  };

  const handlePostSuccess = async () => {
    // Store the whiskey and inline tags before cleaning the modal state
    const taggedWhiskey = whiskey;
    const inlineWhiskeyTags = inlineTags.filter(tag => tag.type === InlineTagType.WHISKEY);
    const displayNames = tagDisplayNames;

    // Clean up the modal immediately
    cleanOnCancel();

    // Collect all whiskeys that need review checking (old-style tag + inline tags)
    const whiskeysToCheck: Array<{ id: string; name: string }> = [];

    // Add old-style tagged whiskey if present
    if (taggedWhiskey && data?.userType !== UserType.BRAND) {
      whiskeysToCheck.push({
        id: taggedWhiskey.id,
        name: getFullWhiskeyName(taggedWhiskey),
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

    // Deduplicate whiskeys by ID (in case same whiskey was tagged multiple times)
    const uniqueWhiskeys = Array.from(
      new Map(whiskeysToCheck.map(w => [w.id, w])).values()
    );

    // Batch check which whiskeys have been reviewed
    const whiskeyIds = uniqueWhiskeys.map(w => w.id);
    const reviewedWhiskeyIds = await getReviewedWhiskeyIds(whiskeyIds, sub);

    // Filter out whiskeys that have already been reviewed
    const unreviewedWhiskeys = uniqueWhiskeys.filter(
      candidate => !reviewedWhiskeyIds.includes(candidate.id)
    );

    // If there are unreviewed whiskeys, navigate to review flow for the first one
    if (unreviewedWhiskeys.length > 0) {
      const firstUnreviewed = unreviewedWhiskeys[0];

      // Navigate to ReviewWhiskey screen for first-time review flow
      // Pass remaining whiskeys to review after this one
      navigation.navigate(Routes.ReviewWhiskey, {
        whiskey: {
          id: firstUnreviewed.id,
          name: firstUnreviewed.name,
        },
        fromPost: true,
        remainingWhiskeys: unreviewedWhiskeys.slice(1), // Pass the rest
      });
      return;
    }

    // Navigate home if no whiskeys need review
    navigation.navigate(Routes.Home);
  };

  // Note: onPostCreated is used by parent (Home.tsx) for tracking posts with photos for moderation
  // handlePostSuccess manages the modal cleanup and first-time review navigation flow
  const { mutate } = useCreatePost(handlePostSuccess, onPostCreated, () => setIsMutating(false));

  const getPourId = useComposerPourId(visible);

  const handleSubmit = async () => {
    if (!isEmptyForm) {
      setIsMutating(true);
      if (postImages.length > 0) {
        try {
          const uploadedKeys = await Promise.all(
            postImages.map(async (img) => {
              const fileName = img.uri.split('/').pop() as string;
              const blob = await getBlob(img.uri);
              const prefixedFileName = createImageKey('post', fileName);
              await Storage.put(prefixedFileName, blob, { level: 'public' });
              return prefixedFileName;
            })
          );

          mutate({
            pourId: getPourId(),
            description,
            photoKey: uploadedKeys[0],
            photoKeys: uploadedKeys,
            photoDimensions: postImages.map(({ width, height }) => ({
              width,
              height,
            })),
            whiskey,
            checkin,
            tagUser,
            inlineTags,
            whiskeyDisplayNames: tagDisplayNames,
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
        });
      }
    }
  };

  useEffect(() => {
    setIsEmptyForm(
      !(
        description.trim() !== '' ||
        postImages.length > 0 ||
        whiskey ||
        checkin ||
        tagUser
      )
    );
  }, [postImages, whiskey, tagUser, checkin, description]);

  const MAX_PHOTOS = 10;
  const [gridWidth, setGridWidth] = useState(0);
  const tileSize = gridWidth > 0 ? Math.floor((gridWidth - 20) / 3) : 80;

  const appendImage = (image: PickedImage) => {
    setPostImages((prev) => (prev.length < MAX_PHOTOS ? [...prev, image] : prev));
  };

  const handleMultiUpload = async () => {
    setPictureMenuStatus(false);
    const remaining = MAX_PHOTOS - postImages.length;
    if (remaining <= 0) return;
    const images = await uploadMultiplePictures(remaining);
    if (images) {
      setPostImages((prev) => [...prev, ...images].slice(0, MAX_PHOTOS));
    }
  };

  const options = [
    {
      id: 'upload',
      title: 'Upload Picture',
      icon: 'upload',
      action: () => { handleMultiUpload(); },
    },
    {
      id: 'take-photo',
      title: 'Take Photo',
      icon: 'take-picture',
      action: () => addPicture('take', setPictureMenuStatus, appendImage),
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
    <>
    {!isLoading && (
      <ModalBottom onBackButtonPress={onBackButtonPress} visible={visible}>
        <PostContainer>
          <Link
            color="primary500"
            bold
            onPress={cleanOnCancel}
            testID={getTestId('cancel')}
          >
            Cancel
          </Link>
          <ContentContainer>
            <View>
              <Row>
                <Row>
                  <ProfilePicture
                    image={data?.userType === UserType.BRAND ? (data?.brandLogoLoaded || data?.profilePictureLoaded) : data?.profilePictureLoaded}
                    size="small"
                    border
                  />
                  <Column>
                    <Text bold mv={6} size={13}>
                      {resolveAuthorName()}
                    </Text>
                    {/* <Tag text="Public" icon="earth" close /> */}
                  </Column>
                </Row>
                <Button
                  label="Share"
                  onPress={handleSubmit}
                  disabled={isEmptyForm}
                  loading={isMutating}
                />
              </Row>
              <Divider h={2} mt={18} />
              <Buttons>
                <TagButton
                  testID={getTestId('photo')}
                  onPress={() =>
                    postImages.length > 0
                      ? setPostImages([])
                      : setPictureMenuStatus(!showPictureMenu)
                  }
                >
                  <Tag
                    text={postImages.length > 1 ? `Photos (${postImages.length})` : 'Photo'}
                    selected={postImages.length > 0}
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
                placeholder="What are you doing now? Use @ to tag users, venues, or brands, and # to tag whiskeys"
                numberOfLines={inputLines}
                multiline
                maxLength={1000}
                counter={`${1000 - (description?.length ?? 0)} / 1000`}
                onContentSizeChange={(e) =>
                  setInputLines(
                    e.nativeEvent.contentSize.height <= 70 ? 2 : 3
                  )
                }
              />

              {postImages.length > 0 && (
                <CardConteiner>
                  <PhotoGrid onLayout={(e) => setGridWidth(e.nativeEvent.layout.width)}>
                    {postImages.map((img, index) => (
                      <ThumbnailWrapper key={index} style={{ width: tileSize, height: tileSize }}>
                        <TouchableOpacity
                          onPress={() => setPreviewIndex(index)}
                          activeOpacity={0.8}
                        >
                          <PhotoThumbnail source={img} style={{ width: tileSize, height: tileSize }} />
                        </TouchableOpacity>
                        <RemoveButton
                          onPress={() =>
                            setPostImages((prev) => prev.filter((_, i) => i !== index))
                          }
                        >
                          <Icon color="white" size={10} name="close" />
                        </RemoveButton>
                      </ThumbnailWrapper>
                    ))}
                    {postImages.length < MAX_PHOTOS && (
                      <AddPhotoButton style={{ width: tileSize, height: tileSize }} onPress={() => setPictureMenuStatus(!showPictureMenu)}>
                        <Icon color="primary500" size={24} name="plus" />
                      </AddPhotoButton>
                    )}
                  </PhotoGrid>
                </CardConteiner>
              )}

              {whiskey && (
                <CardConteiner>
                  <HorizontalWhiskeyCard
                    shadow
                    whiskey={whiskey}
                    deleteButton
                    onDeleteButtonPress={() => setWhiskey(undefined)}
                    pour={checkIfUserPoured(whiskey.id)}
                  />
                </CardConteiner>
              )}

              {tagUser && (
                <CardConteiner>
                  <HorizontalUserCard
                    shadow
                    user={tagUser}
                    deleteButton
                    onDeleteButtonPress={() => setTagUser(undefined)}
                    followButton={false}
                  />
                </CardConteiner>
              )}

              {checkin && (
                <CardConteiner>
                  <HorizontalUserCard
                    shadow
                    user={checkin}
                    deleteButton
                    onDeleteButtonPress={() => setCheckin(undefined)}
                    followButton={false}
                  />
                </CardConteiner>
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
    )}
    <Modal
      visible={previewIndex !== null}
      transparent
      animationType="fade"
      onRequestClose={() => setPreviewIndex(null)}
    >
      <View style={previewStyles.backdrop}>
        {previewIndex !== null && (
          <Image
            source={postImages[previewIndex]}
            style={previewStyles.image}
            resizeMode="contain"
          />
        )}
        <TouchableOpacity
          style={previewStyles.closeButton}
          onPress={() => setPreviewIndex(null)}
        >
          <Icon name="close" color="white" size={18} />
        </TouchableOpacity>
        <TouchableOpacity
          style={previewStyles.removeButton}
          onPress={() => {
            setPostImages((prev) => prev.filter((_, i) => i !== previewIndex));
            setPreviewIndex(null);
          }}
        >
          <Text size={14} color="white" bold>Remove Photo</Text>
        </TouchableOpacity>
      </View>
    </Modal>
    </>
  );
};

const previewStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary500,
  },
  removeButton: {
    position: 'absolute',
    bottom: 60,
    backgroundColor: 'rgba(185, 28, 28, 0.9)',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 24,
  },
});

export { CreatePostModal };
