import React from 'react';
import { View } from 'react-native';
import { Skeleton } from '@components';
import { theme } from '../../../../styles/theme';

const MessageSkeleton = () => (
  <View style={{ paddingHorizontal: theme.metrics.px(16), paddingVertical: theme.metrics.px(8) }}>
    {/* Received message */}
    <View style={{ alignItems: 'flex-start', marginBottom: theme.metrics.px(16) }}>
      <Skeleton width={theme.metrics.px(200)} height={theme.metrics.px(48)} radius={16} />
      <View style={{ marginTop: theme.metrics.px(4) }}>
        <Skeleton width={theme.metrics.px(50)} height={theme.metrics.px(12)} radius={4} />
      </View>
    </View>

    {/* Sent message */}
    <View style={{ alignItems: 'flex-end', marginBottom: theme.metrics.px(16) }}>
      <Skeleton width={theme.metrics.px(180)} height={theme.metrics.px(36)} radius={16} />
      <View style={{ marginTop: theme.metrics.px(4) }}>
        <Skeleton width={theme.metrics.px(50)} height={theme.metrics.px(12)} radius={4} />
      </View>
    </View>

    {/* Received message */}
    <View style={{ alignItems: 'flex-start', marginBottom: theme.metrics.px(16) }}>
      <Skeleton width={theme.metrics.px(240)} height={theme.metrics.px(60)} radius={16} />
      <View style={{ marginTop: theme.metrics.px(4) }}>
        <Skeleton width={theme.metrics.px(50)} height={theme.metrics.px(12)} radius={4} />
      </View>
    </View>

    {/* Sent message */}
    <View style={{ alignItems: 'flex-end', marginBottom: theme.metrics.px(16) }}>
      <Skeleton width={theme.metrics.px(160)} height={theme.metrics.px(36)} radius={16} />
      <View style={{ marginTop: theme.metrics.px(4) }}>
        <Skeleton width={theme.metrics.px(50)} height={theme.metrics.px(12)} radius={4} />
      </View>
    </View>

    {/* Received message */}
    <View style={{ alignItems: 'flex-start', marginBottom: theme.metrics.px(16) }}>
      <Skeleton width={theme.metrics.px(220)} height={theme.metrics.px(48)} radius={16} />
      <View style={{ marginTop: theme.metrics.px(4) }}>
        <Skeleton width={theme.metrics.px(50)} height={theme.metrics.px(12)} radius={4} />
      </View>
    </View>

    {/* Sent message */}
    <View style={{ alignItems: 'flex-end', marginBottom: theme.metrics.px(16) }}>
      <Skeleton width={theme.metrics.px(190)} height={theme.metrics.px(48)} radius={16} />
      <View style={{ marginTop: theme.metrics.px(4) }}>
        <Skeleton width={theme.metrics.px(50)} height={theme.metrics.px(12)} radius={4} />
      </View>
    </View>
  </View>
);

export default React.memo(MessageSkeleton);
