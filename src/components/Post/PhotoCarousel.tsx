import { useState } from 'react';
import { FlatList, ImageSourcePropType, StyleSheet, TouchableOpacity, View } from 'react-native';
import { type ImageUrl } from '@types';
import { getClampedAspectRatio, getTestId } from '@helpers';
import { PostImage } from './styles';
import { Text } from '../Text/Text';

const CAROUSEL_HEIGHT = 300;

type Props = {
  images: Array<ImageUrl | ImageSourcePropType>;
  onImagePress: (index: number) => void;
  moderationPending?: boolean;
};

export const PhotoCarousel = ({ images, onImagePress, moderationPending }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  // The first photo sets the box for the whole set, so paging stays uniform.
  const aspectRatio = getClampedAspectRatio(images[0]);
  const itemHeight =
    aspectRatio && containerWidth > 0
      ? Math.round(containerWidth / aspectRatio)
      : CAROUSEL_HEIGHT;

  return (
    <View
      style={[
        styles.container,
        aspectRatio ? { aspectRatio } : { height: CAROUSEL_HEIGHT },
      ]}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {containerWidth > 0 && (
        <FlatList
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / containerWidth);
            setCurrentIndex(index);
          }}
          getItemLayout={(_, index) => ({
            length: containerWidth,
            offset: containerWidth * index,
            index,
          })}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => onImagePress(index)}
              activeOpacity={0.8}
              testID={getTestId(`post-image-${index}`)}
              style={{ width: containerWidth, height: itemHeight }}
            >
              <PostImage source={item} />
            </TouchableOpacity>
          )}
        />
      )}
      {moderationPending && (
        <View style={styles.moderationBadge}>
          <Text size={12} color="white">Processing...</Text>
        </View>
      )}
      {images.length > 1 && (
        <View style={styles.dots} pointerEvents="none">
          {images.map((_, i) => (
            <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  dots: {
    position: 'absolute',
    bottom: 12,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  dotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  moderationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 165, 0, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
});
