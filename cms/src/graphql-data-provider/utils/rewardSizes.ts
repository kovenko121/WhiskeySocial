import { SelectProps } from 'antd';
import { RewardSize } from './graphQlTypes';

export const RewardSizes: SelectProps['options'] = [
  { label: 'Small', value: RewardSize.small },
  { label: 'Medium', value: RewardSize.medium },
  { label: 'Large', value: RewardSize.large },
];
