import {
  ImageSourcePropType,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Image, type ImageSource } from 'expo-image';
import Modal from 'react-native-modal';
import {
  Gallery,
  SwipeDirection,
  type GalleryRefType,
} from 'react-native-zoom-toolkit';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect, useRef } from 'react';
import { theme } from '../../styles/theme';
import { type ImageUrl } from '../../types';
import { isIos } from '../../helpers/consts';
import { Icon } from '../Icon/Icon';

type GalleryImage = ImageUrl | ImageSourcePropType;

// Style constants
const styleSheet = StyleSheet.create({
  modal: {
    margin: 0,
  },
  imageModalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary500,
  },
  touchableOpacity: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// End of style constants

type ImageViewModalProps = {
  isVisible: boolean;
  onDownSwipe: () => void;
  onBackdropPress: () => void;
  /** Full set of images to page through in full screen. */
  images: GalleryImage[];
  /** Index of the image that was tapped; the gallery opens on this one. */
  initialIndex?: number;
};

export const ImageViewerModal = ({
  isVisible,
  onDownSwipe,
  onBackdropPress,
  images,
  initialIndex = 0,
}: ImageViewModalProps) => {
  const { width, height } = useWindowDimensions();
  const galleryRef = useRef<GalleryRefType>(null);

  const startIndex = Math.min(
    Math.max(initialIndex, 0),
    Math.max(images.length - 1, 0)
  );

  // The gallery stays mounted while the modal fades; sync it to the tapped
  // image each time the viewer is (re)opened so a different tap lands right.
  useEffect(() => {
    if (isVisible) {
      galleryRef.current?.setIndex(startIndex);
    }
  }, [isVisible, startIndex]);

  if (!images.length) {
    return null;
  }

  // Vertical flick dismisses (matches prior single-image behaviour); horizontal
  // swipes are consumed by the gallery itself to page between images.
  const swipeHandler = (direction: SwipeDirection) => {
    if (direction === 'down' || direction === 'up') {
      onDownSwipe();
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      style={styleSheet.modal}
      animationIn="fadeIn"
      animationOut="fadeOut"
      statusBarTranslucent={isIos ? undefined : true}
    >
      <GestureHandlerRootView style={styleSheet.imageModalContainer}>
        <View style={styleSheet.closeButtonContainer}>
          <TouchableOpacity
            onPress={onBackdropPress}
            style={styleSheet.touchableOpacity}
          >
            <Icon name="close" color="primary500" size={18} />
          </TouchableOpacity>
        </View>
        <Gallery
          ref={galleryRef}
          data={images}
          keyExtractor={(_, index) => String(index)}
          initialIndex={startIndex}
          maxScale={5}
          onSwipe={swipeHandler}
          renderItem={(item) => (
            <Image
              source={item as ImageSource}
              style={{ width, height }}
              contentFit="contain"
              cachePolicy="memory-disk"
            />
          )}
        />
      </GestureHandlerRootView>
    </Modal>
  );
};
