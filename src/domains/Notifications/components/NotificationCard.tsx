import { Divider, Icon, Skeleton, Text } from '@components';
import { getS3Image, getTestId, getTimeAgo } from '@helpers';
import { theme } from '@theme';
import { ImageUrl, Notification, NotificationTypes } from '@types';
import { useEffect, useState } from 'react';
import { ImageSourcePropType, Linking, TouchableOpacity } from 'react-native';
import {
  CardBody,
  CardMenu,
  TextContainer,
} from '../../../components/Card/HorizontalCard/styles';
import { Picture, PictureContainer, PicturePlaceholder, PictureRound } from '../styles';

export const NotificationCard = ({
  notification,
  divider = false,
  handleDelete = () => {},
}: {
  notification?: Notification;
  divider?: boolean;
  handleDelete?: (notification: Notification) => void;
}) => {
  const [image, setImage] = useState<ImageUrl | ImageSourcePropType>();
  const [secondaryImage, setSecondaryImage] = useState<
    ImageUrl | ImageSourcePropType
  >();

  // Club notification types that should show club image as primary avatar
  const clubNotificationTypes = [
    NotificationTypes.CLUB_REQUEST_APPROVED,
    NotificationTypes.CLUB_REQUEST_REJECTED,
    NotificationTypes.CLUB_MEMBER_REMOVED,
    NotificationTypes.CLUB_PROMOTED_TO_ADMIN,
    NotificationTypes.CLUB_POST_PINNED,
    NotificationTypes.CLUB_WHISKEY_ADDED,
  ];

  const isClubNotification = clubNotificationTypes.includes(
    notification?.type as NotificationTypes
  );

  useEffect(() => {
    (async () => {
      if (isClubNotification) {
        // Club notifications: use secondaryPicture (club image) as primary, no secondary
        if (notification?.secondaryPicture) {
          const img = await getS3Image(notification.secondaryPicture);
          if (img) setImage(img);
        }
      } else {
        // Standard notifications: relatedUser as primary, secondaryPicture as secondary
        if (notification?.relatedUser?.profilePicture) {
          const img = await getS3Image(notification.relatedUser.profilePicture);
          if (img) setImage(img);
        }

        if (notification?.secondaryPicture) {
          const secImg = await getS3Image(notification.secondaryPicture);
          if (secImg) setSecondaryImage(secImg);
        }
      }
    })();
  }, [notification, isClubNotification]);

  const cardHandle = () => {
    if (notification?.link) {
      Linking.openURL(notification.link);
    }
  };

  return (
    <>
      {divider && <Divider mv={0} h={0} />}
      <TouchableOpacity onPress={cardHandle}>
        <CardBody mv={0} picWidth={100} shadow={false} transparent>
          {(() => {
            if (image) {
              return (
                <PictureContainer>
                  <PictureRound size="small" mt={16}>
                    <Picture source={image} width={40} />
                  </PictureRound>
                  {secondaryImage && (
                    <PictureRound size="small" mt={-20}>
                      <Picture source={secondaryImage} width={40} />
                    </PictureRound>
                  )}
                </PictureContainer>
              );
            }

            if (isClubNotification && !notification?.secondaryPicture) {
              return (
                <PicturePlaceholder>
                  <Icon name="user" size={24} color="grey300" />
                </PicturePlaceholder>
              );
            }

            return (
              <PictureRound size="small" mt={16}>
                <Skeleton
                  width={theme.metrics.px(40)}
                  height={theme.metrics.px(40)}
                  radius={10}
                />
              </PictureRound>
            );
          })()}
          {notification ? (
            <TextContainer pv={16} ph={8}>
              <Text size={14}>
                {notification.message.split('*').map((textFragment, index) => (
                  <Text key={index} size={14} bold={index % 2 > 0}>
                    {textFragment}
                  </Text>
                ))}
              </Text>
              <Text size={11} color="neutral300">
                {getTimeAgo(notification.createdAt)}
              </Text>
            </TextContainer>
          ) : (
            <TextContainer pv={16} ph={8}>
              <Skeleton width={250} height={20} />
              <Skeleton width={50} height={20} />
            </TextContainer>
          )}

          <CardMenu pv={16} ph={0}>
            <TouchableOpacity
              testID={getTestId('close')}
              onPress={() => notification && handleDelete(notification)}
            >
              <Icon name="close" size={22} color="white" />
            </TouchableOpacity>
          </CardMenu>
        </CardBody>
      </TouchableOpacity>
    </>
  );
};
