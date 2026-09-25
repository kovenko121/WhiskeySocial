import { memo } from 'react';
import { View } from 'react-native';
import { Skeleton } from '@components';
import { theme } from '../../../../styles/theme';

const SKELETON_ITEMS = [1, 2, 3, 4, 5, 6];

const ConversationListSkeleton = () => (
  <View style={{ paddingVertical: theme.metrics.px(8) }}>
    {SKELETON_ITEMS.map((item) => (
      <View
        key={item}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: theme.metrics.px(12),
          paddingHorizontal: theme.metrics.px(16),
        }}
      >
        <Skeleton
          width={theme.metrics.px(40)}
          height={theme.metrics.px(40)}
          radius="round"
        />
        <View style={{ flex: 1, marginLeft: theme.metrics.px(12) }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.metrics.px(6) }}>
            <Skeleton
              width={theme.metrics.px(100 + (item % 3) * 20)}
              height={theme.metrics.px(14)}
              radius={4}
            />
            <Skeleton
              width={theme.metrics.px(30)}
              height={theme.metrics.px(12)}
              radius={4}
            />
          </View>
          <Skeleton
            width={theme.metrics.px(160 + (item % 2) * 40)}
            height={theme.metrics.px(13)}
            radius={4}
          />
        </View>
      </View>
    ))}
  </View>
);

export default memo(ConversationListSkeleton);
