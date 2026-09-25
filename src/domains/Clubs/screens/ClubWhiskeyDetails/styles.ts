import { Image } from 'expo-image';
import Animated from 'react-native-reanimated';
import styled, { css, DefaultTheme } from 'styled-components/native';

export const ScreenContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    height: 100%;
    background-color: ${theme.colors.backgroundDark};
  `}
`;

export const ScrollContainer = styled(Animated.ScrollView)`
  width: 100%;
`;

export const ContentContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-horizontal: ${theme.metrics.px(24)}px;
    margin-bottom: ${theme.metrics.px(150)}px;
  `}
`;

export const WhiskeyImageContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    height: ${theme.metrics.hp(49)}px;
    margin-bottom: ${theme.metrics.px(8)}px;
    width: 100%;
  `}
`;

export const WhiskeyImage = styled(Image).attrs({
  placeholder: 'L04x*??G9E9E%%NHS69avwMx~X-:',
})`
  height: 100%;
  width: 100%;
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.grey400};
`;

export const TitleSection = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    flex-direction: row;
    gap: ${theme.metrics.hp(1)}px;
    align-items: center;
    margin-bottom: ${theme.metrics.px(6)}px;
    justify-content: center;
  `}
`;

export const RatingContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-bottom: ${theme.metrics.px(10)}px;
    flex-direction: row;
    gap: ${theme.metrics.hp(1)}px;
    align-items: center;
    justify-content: center;
  `}
`;

export const Empty = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    height: ${theme.metrics.px(30)}px;
  `}
`;

export const StatusBar = styled(Animated.View)<any>`
  ${({ theme, insets }) => css`
    height: ${insets.top}px;
    width: 100%;
    background-color: ${theme.colors.backgroundDark};
  `}
`;

export const TagsContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-vertical: ${theme.metrics.px(8)}px;
    padding-bottom: ${theme.metrics.px(0)}px;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: ${theme.metrics.px(8)}px;
  `}
`;

export const InfoContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    gap: ${theme.metrics.px(16)}px;
  `}
`;

export const KeyWrapper = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: ${theme.metrics.px(120)}px;
  `}
`;

export const TextWrapper = styled.View`
  flex: 1;
`;

export const NotesContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    background-color: ${theme.colors.grey400};
    border-radius: ${theme.metrics.px(12)}px;
    padding: ${theme.metrics.px(16)}px;
    margin-bottom: ${theme.metrics.px(20)}px;
  `}
`;

export const NotesText = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-size: ${theme.metrics.px(14)}px;
    color: ${theme.colors.white};
    line-height: ${theme.metrics.px(20)}px;
  `}
`;

export const AddedByContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-items: center;
    margin-top: ${theme.metrics.px(12)}px;
    padding-top: ${theme.metrics.px(12)}px;
    border-top-width: 1px;
    border-top-color: ${theme.colors.grey300};
  `}
`;

export const AddedByText = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-size: ${theme.metrics.px(12)}px;
    color: ${theme.colors.grey200};
  `}
`;

export const LoadingContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    justify-content: center;
    align-items: center;
    padding-top: ${theme.metrics.px(100)}px;
  `}
`;

export const ModalOverlay = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.7);
  justify-content: center;
  align-items: center;
  padding: 24px;
`;

export const ModalContent = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    background-color: ${theme.colors.backgroundDark};
    border-radius: ${theme.metrics.px(16)}px;
    padding: ${theme.metrics.px(24)}px;
    width: 100%;
    max-height: 80%;
  `}
`;

export const ModalHeader = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${theme.metrics.px(20)}px;
  `}
`;

export const ModalButtonRow = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    justify-content: flex-end;
    gap: ${theme.metrics.px(12)}px;
    margin-top: ${theme.metrics.px(20)}px;
  `}
`;

export const CharCount = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-size: ${theme.metrics.px(12)}px;
    color: ${theme.colors.grey300};
    text-align: right;
    margin-top: ${theme.metrics.px(8)}px;
  `}
`;
