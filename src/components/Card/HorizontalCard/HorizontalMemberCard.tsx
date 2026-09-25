import { getTestId } from '@helpers';
import { ClubMember, ClubRole } from '@types';
import { Text } from '../../Text/Text';
import { HorizontalCard } from './HorizontalCard';
import { ChildrenSection } from './styles';
import { Skeleton } from '../../Skeleton/Skeleton';
import awsconfig from '../../../config/aws';

const getRoleLabel = (role: ClubRole): string => {
  if (role === ClubRole.CLUBOWNERROLE) {
    return 'Owner';
  }
  if (role === ClubRole.CLUBADMINROLE) {
    return 'Admin';
  }
  return 'Member';
};

export const HorizontalMemberCard = ({
  member,
  shadow = false,
  onPress = () => {},
  mv = 4,
  disabled = false,
}: {
  member?: ClubMember;
  onPress?: (item: ClubMember) => void;
  shadow?: boolean;
  mv?: number;
  disabled?: boolean;
}) => {
  if (!member) {
    return (
      <HorizontalCard
        picWidth={120}
        shadow={shadow}
        mv={mv}
        textPH={8}
        disabled={disabled}
      >
        <>
          <Skeleton width={120} height={20} />
          <ChildrenSection>
            <Skeleton width={60} height={16} />
          </ChildrenSection>
        </>
      </HorizontalCard>
    );
  }

  // Handle user's profile picture - can be S3Object or string
  const resolveProfilePictureImage = () => {
    const picture = member.user?.profilePicture;
    if (!picture) return undefined;
    // Already an S3Object
    if (typeof picture !== 'string') return picture;
    if (picture.startsWith('http')) return { uri: picture };
    return {
      bucket: awsconfig.aws_user_files_s3_bucket,
      key: picture,
      region: awsconfig.aws_user_files_s3_bucket_region,
    };
  };

  const profilePictureImage = resolveProfilePictureImage();

  const username = member.user?.username || 'Unknown User';
  const roleLabel = getRoleLabel(member.role);

  return (
    <HorizontalCard
      picWidth={120}
      textPV={8}
      image={profilePictureImage}
      onPress={() => onPress(member)}
      shadow={shadow}
      mv={mv}
      testID={getTestId(username)}
      disabled={disabled}
    >
      <>
        <Text bold size={15} numberOfLines={1}>
          @{username}
        </Text>

        <ChildrenSection>
          <Text size={12} color="grey300">
            {roleLabel}
          </Text>
        </ChildrenSection>
      </>
    </HorizontalCard>
  );
};
