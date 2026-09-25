import { theme } from '@theme';
import { TouchableOpacityProps } from 'react-native';
import styled from 'styled-components/native';

export const ModalContent = styled.View`
  align-items: center;
  padding-vertical: ${theme.metrics.px(20)}px;
  padding-horizontal: ${theme.metrics.px(20)}px;
`;

export const QRCodeContainer = styled.View`
  background-color: white;
  padding: ${theme.metrics.px(20)}px;
  border-radius: ${theme.metrics.px(12)}px;
  margin-vertical: ${theme.metrics.px(20)}px;
`;

export const CaptureContainer = styled.View`
  background-color: white;
  align-items: center;
  padding: ${theme.metrics.px(20)}px;
  margin-top: ${theme.metrics.px(30)}px;
  border-radius: ${theme.metrics.px(12)}px;
`;

export const TitleContainer = styled.View`
  margin-bottom: ${theme.metrics.px(12)}px;
`;

export const CaptureTitleText = styled.Text`
  color: black;
  font-size: ${theme.metrics.px(18)}px;
  font-weight: bold;
  text-align: center;
`;

export const CaptureUrlText = styled.Text`
  color: #666;
  font-size: ${theme.metrics.px(12)}px;
  text-align: center;
  margin-top: ${theme.metrics.px(4)}px;
`;

export const SaveButtonContainer = styled.View`
  width: 100%;
  margin-top: ${theme.metrics.px(16)}px;
  gap: ${theme.metrics.px(12)}px;
`;

export const ClipboardButton = styled.TouchableOpacity<TouchableOpacityProps & { isCopied: boolean }>`
  padding: 10px 0px;
  border-bottom-width: 1.5px;
  border-bottom-color: ${props => (props.isCopied ? '#00c853' : `${theme.colors.grey75}`)};
  align-self: flex-start;
`;