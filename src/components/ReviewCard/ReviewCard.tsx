import { useAuth } from '@contexts';
import { getS3Image } from '@helpers';
import { useNavigation } from '@react-navigation/native';
import { theme } from '@theme';
import {
  ImageUrl,
  NavigationProps,
  ReportContentType,
  S3Object,
  User,
  Routes
} from '@types';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { ImageSourcePropType, TouchableOpacity } from 'react-native';
import { Icon } from '../Icon/Icon';
import { PopUpMenu } from '../PopUpMenu/PopUpMenu';
import { StarRating } from '../StarRating/StarRating';
import { Tags } from '../Tags/Tags';
import { Text } from '../Text/Text';
import {
  AuthorSection,
  Picture,
  PictureContainer,
  ReviewBody,
  Row,
  SectionTitleWrapper,
} from './styles';

export const ReviewCard = ({
  data,
  backgroundColor,
  footerColor,
  tagColor,
  descriptionColor,
  from,
}: {
  data: any;
  backgroundColor?: string;
  footerColor?: string;
  tagColor?: string;
  descriptionColor?: string;
  from?: {
    page: string;
    id?: string;
  };
}) => {
  const navigation = useNavigation<NavigationProps>();
  const [image, setImage] = useState<ImageUrl | ImageSourcePropType>();
  const {
    user: { sub },
  } = useAuth();
  const getUserName = (user: User) =>
    `${user.personFirstName} ${user.personLastName}`;

  const [showPopUpMenu, setShowPopUpMenu] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const setAuthorImage = async (pic: S3Object) => {
      const img = await getS3Image(pic);
      if (img) setImage(img);
    };

    if (data.specialistReview === 1) {
      setAuthorImage(data.specialistImage);
    } else if (data.user.profilePicture?.bucket) {
      setAuthorImage(data.user.profilePicture);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.user]);

  const goToReportForm = () => {
    navigation.navigate(Routes.ReportForm, {
      contentId: data.id,
      contentType: ReportContentType.REVIEW,
      reportedUserId: data.userId,
      from,
    });
  };

  const options = [
    {
      title: 'Report',
      icon: 'report',
      action: goToReportForm,
    },
  ];

  return (
    <ReviewBody
      backgroundColor={backgroundColor}
      style={{
        borderColor:
          data.userId && sub === data.userId
            ? theme.colors.primary500
            : theme.colors.grey400,
      }}
    >
      {data.specialistReview !== 1 && data.userId !== sub && (
        <Row>
          <SectionTitleWrapper />
          <TouchableOpacity
            onPress={() => {
              if (showPopUpMenu && !isClosing) setShowPopUpMenu(false);
              if (!showPopUpMenu && !isClosing) setShowPopUpMenu(true);
            }}
          >
            <Icon name="dot-menu-horizontal" color="white" size={18} />
          </TouchableOpacity>
        </Row>
      )}
      {showPopUpMenu && (
        <PopUpMenu
          width={50}
          options={options}
          alignItems="bottom"
          paddingBottom={40}
          paddingLeft={115}
          setVisibleStatus={setShowPopUpMenu}
          setIsClosingStatus={setIsClosing}
        />
      )}
      {data.description && (
        <Text align="justify" size={14} color={descriptionColor ?? 'grey100'}>
          {data.description}
        </Text>
      )}
      <Tags data={data.recommendationTags} tagBgColor={tagColor} />
      <StarRating disabled setValue={data.rating} amount={5} />
      <AuthorSection>
        <PictureContainer>
          <Picture source={image} />
        </PictureContainer>
        <Text color={footerColor ?? 'grey100'}>
          {data.specialistName || getUserName(data.user)} at{' '}
          {moment(data.createdAt).format('MM/DD/YYYY')}
        </Text>
      </AuthorSection>
    </ReviewBody>
  );
};
