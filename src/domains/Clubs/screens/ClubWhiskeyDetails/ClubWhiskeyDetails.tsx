import {
  AbsoluteHeader,
  Button,
  CrownIcon,
  Divider,
  Input,
  Tag,
  Text,
  Title,
} from '@components';
import { getFullWhiskeyName, getTimeAgo, isUnauthorizedClubActionError } from '@helpers';
import { useRemoveClubWhiskey, useUpdateClubWhiskey, useWhiskey } from '@hooks';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getProofDisplay, RootStackParams, Whiskey,
  Routes
} from '@types';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Modal, TouchableOpacity } from 'react-native';
import { useAnimatedRef } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AddedByContainer,
  AddedByText,
  CharCount,
  ContentContainer,
  Empty,
  InfoContainer,
  KeyWrapper,
  LoadingContainer,
  ModalButtonRow,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  NotesContainer,
  NotesText,
  RatingContainer,
  ScreenContainer,
  ScrollContainer,
  StatusBar,
  TagsContainer,
  TextWrapper,
  TitleSection,
  WhiskeyImage,
  WhiskeyImageContainer,
} from './styles';

type Props = NativeStackScreenProps<RootStackParams, 'ClubWhiskeyDetails'>;

const prepareWhiskeyInfo = (whiskey: Whiskey | null | undefined) => {
  if (!whiskey) {
    return [];
  }

  const info = [
    { key: 'Bottle', value: whiskey?.name },
    { key: 'Brand', value: whiskey?.brandUser?.brandName },
    { key: 'Distillery', value: whiskey?.distillery },
    { key: 'Origin', value: whiskey?.origin },
    { key: 'Age', value: whiskey?.age },
  ];

  const proofDisplay = getProofDisplay(whiskey);
  if (proofDisplay) {
    info.splice(4, 0, { key: 'Proof', value: proofDisplay });
  }

  if (whiskey?.distilleryTastingNotes) {
    info.push({ key: 'Distillery Tasting Notes', value: whiskey.distilleryTastingNotes });
  }

  return info;
};

const MAX_NOTES_LENGTH = 500;

const ClubWhiskeyDetailsScreen = ({ navigation, route }: Props) => {
  const { clubWhiskeyId, whiskeyId, clubId, clubName, notes, addedAt, isAdmin } = route.params;

  const [showEditModal, setShowEditModal] = useState(false);
  const [editedNotes, setEditedNotes] = useState(notes || '');
  const [currentNotes, setCurrentNotes] = useState(notes ?? null);

  const { data: whiskey, isFetching } = useWhiskey(whiskeyId);
  const { mutate: updateClubWhiskey, isPending: isUpdating } = useUpdateClubWhiskey();
  const { mutate: removeClubWhiskey } = useRemoveClubWhiskey();

  const whiskeyInfo = prepareWhiskeyInfo(whiskey);

  const scrollRef = useAnimatedRef();
  const insets = useSafeAreaInsets();

  const handleViewProduct = () => {
    navigation.navigate(Routes.WhiskeyInfo, { id: whiskeyId });
  };

  const handleEditPress = () => {
    setEditedNotes(currentNotes || '');
    setShowEditModal(true);
  };

  const handleSaveNotes = () => {
    updateClubWhiskey(
      { id: clubWhiskeyId, clubId, notes: editedNotes || null },
      {
        onSuccess: () => {
          setCurrentNotes(editedNotes || null);
          setShowEditModal(false);
          Alert.alert('Success', 'Notes updated successfully.');
        },
        onError: (error: Error) => {
          const errorMessage = isUnauthorizedClubActionError(error)
            ? error.message
            : 'Failed to update notes. Please try again.';
          Alert.alert('Error', errorMessage);
        },
      }
    );
  };

  const handleRemoveWhiskey = () => {
    const whiskeyName = whiskey?.name || 'this whiskey';

    Alert.alert(
      'Remove Whiskey',
      `Remove "${whiskeyName}" from ${clubName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removeClubWhiskey(
              { id: clubWhiskeyId, clubId },
              {
                onSuccess: () => {
                  Alert.alert('Success', 'Whiskey removed from club.');
                  navigation.goBack();
                },
                onError: (error: Error) => {
                  const errorMessage = isUnauthorizedClubActionError(error)
                    ? error.message
                    : 'Failed to remove whiskey. Please try again.';
                  Alert.alert('Error', errorMessage);
                },
              }
            );
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer>
      <StatusBar insets={insets} />
      <ScrollContainer scrollEventThrottle={60} ref={scrollRef} scrollToOverflowEnabled>
        <WhiskeyImageContainer>
          <AbsoluteHeader
            actionIcon={isAdmin ? 'trash' : undefined}
            action={isAdmin ? handleRemoveWhiskey : undefined}
          />
          <WhiskeyImage source={isFetching ? undefined : whiskey?.picture} />
        </WhiskeyImageContainer>
        <ContentContainer>
          {isFetching ? (
            <LoadingContainer>
              <ActivityIndicator size="large" color="#fff" />
            </LoadingContainer>
          ) : (
            <>
              <TagsContainer>
                <Tag selected text={whiskey?.type?.[0] as string} />
              </TagsContainer>

              <TitleSection>
                <Title style={{ lineHeight: 40 }} align="center" color="primary500" size={27}>
                  {whiskey ? getFullWhiskeyName(whiskey) : ''}
                </Title>
              </TitleSection>

              {!!whiskey?.calculatedRating && (
                <RatingContainer>
                  <CrownIcon size={16} color="primary500" />
                  <Text size={15}>{whiskey?.calculatedRating}</Text>
                </RatingContainer>
              )}

              <Title size={18} align="center" mb={10} mt={20}>
                {clubName} Notes
              </Title>
              {isAdmin && (
                <TouchableOpacity onPress={handleEditPress} style={{ alignSelf: 'center', marginBottom: 16 }}>
                  <Tag icon="edit" text="Edit" />
                </TouchableOpacity>
              )}

              <NotesContainer>
                {currentNotes ? (
                  <NotesText>{currentNotes}</NotesText>
                ) : (
                  <Text size={14} color="grey300">
                    No notes added for this whiskey.
                  </Text>
                )}
                <AddedByContainer>
                  <AddedByText>Added {getTimeAgo(addedAt, true)}</AddedByText>
                </AddedByContainer>
              </NotesContainer>

              <Title size={18} align="left" mb={20}>
                Characteristics
              </Title>

              {whiskeyInfo.map((item, index) => (
                <React.Fragment key={item.key || index}>
                  <InfoContainer>
                    <KeyWrapper>
                      <Text size={15} mb={10} bold>
                        {item.key}
                      </Text>
                    </KeyWrapper>
                    <TextWrapper>
                      <Text
                        size={15}
                        mb={10}
                        numberOfLines={item.key === 'Distillery Tasting Notes' ? undefined : 2}
                      >
                        {item.value}
                      </Text>
                    </TextWrapper>
                  </InfoContainer>
                  {index < whiskeyInfo.length - 1 && <Divider />}
                </React.Fragment>
              ))}

              <Empty />

              <Text color="primary500" size={14} onPress={handleViewProduct} style={{ textAlign: 'center' }}>
                View Full Product Details
              </Text>
            </>
          )}
        </ContentContainer>
      </ScrollContainer>

      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              <Title size={18}>Edit Notes</Title>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Text color="grey300" size={14}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </ModalHeader>

            <Input
              label="Notes"
              value={editedNotes}
              onChangeText={(text) => setEditedNotes(text.slice(0, MAX_NOTES_LENGTH))}
              placeholder="Add notes about this whiskey for your club..."
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            <CharCount>
              {editedNotes.length}/{MAX_NOTES_LENGTH} characters
            </CharCount>

            <ModalButtonRow>
              <Button
                label={isUpdating ? 'Saving...' : 'Save'}
                onPress={handleSaveNotes}
                disabled={isUpdating}
                variant="default"
              />
            </ModalButtonRow>
          </ModalContent>
        </ModalOverlay>
      </Modal>
    </ScreenContainer>
  );
};

export { ClubWhiskeyDetailsScreen };
