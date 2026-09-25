import { getDefaultClubImage, getTestId } from '@helpers';
import { Club } from '@types';
import { Icon } from '../../Icon/Icon';
import { Text } from '../../Text/Text';
import { HorizontalCard } from './HorizontalCard';
import { ChildrenSection, RatingContainer } from './styles';
import { Skeleton } from '../../Skeleton/Skeleton';
import awsconfig from '../../../config/aws';

export const HorizontalClubCard = ({
  club,
  shadow = false,
  onPress = () => {},
  mv = 4,
  menu = false,
  deleteButton = false,
  onDeleteButtonPress = () => {},
  disabled = false,
}: {
  club?: Club;
  onPress?: (item: Club) => any;
  shadow?: boolean;
  mv?: number;
  menu?: boolean;
  deleteButton?: boolean;
  onDeleteButtonPress?: () => void;
  disabled?: boolean;
}) => {
  if (!club) {
    return (
      <HorizontalCard
        picWidth={120}
        shadow={shadow}
        mv={mv}
        menu={menu}
        deleteButton={deleteButton}
        onDeleteButtonPress={onDeleteButtonPress}
        textPH={8}
        disabled={disabled}
      >
        <>
          <Skeleton width={175} height={32} />
          <ChildrenSection>
            <Skeleton width={60} height={28} />
            <Skeleton width={60} height={28} />
          </ChildrenSection>
        </>
      </HorizontalCard>
    );
  }

  // Handle both S3 keys (from useSearchClubs/useListClubs) and URLs (from useClub)
  const resolveProfilePictureImage = () => {
    if (!club.profilePicture) return getDefaultClubImage();
    // Already a URL from useClub
    if (club.profilePicture.startsWith('http')) return { uri: club.profilePicture };
    // S3 key from GraphQL - construct S3Object
    return {
      bucket: awsconfig.aws_user_files_s3_bucket,
      key: club.profilePicture,
      region: awsconfig.aws_user_files_s3_bucket_region,
    };
  };

  const profilePictureImage = resolveProfilePictureImage();

  return (
    <HorizontalCard
      picWidth={120}
      textPV={8}
      image={profilePictureImage}
      onPress={() => onPress(club)}
      shadow={shadow}
      mv={mv}
      menu={menu}
      deleteButton={deleteButton}
      onDeleteButtonPress={onDeleteButtonPress}
      testID={getTestId(club.clubName)}
      disabled={disabled}
      small={false}
    >
      <>
        <Text bold size={15} numberOfLines={2}>
          {club.clubName}
        </Text>

        <ChildrenSection>
          {club.memberCount !== null && club.memberCount !== undefined && (
            <RatingContainer>
              <Icon name="user" size={12} color="warning" />
              <Text size={12} color="warning" ml={4}>
                {club.memberCount}
              </Text>
            </RatingContainer>
          )}
          {club.isPrivate && (
            <RatingContainer>
              <Icon name="lock" size={14} color="white" />
              <Text size={13} color="white" ml={4} bold>
                Private
              </Text>
            </RatingContainer>
          )}
        </ChildrenSection>
      </>
    </HorizontalCard>
  );
};
