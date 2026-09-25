import { Image } from 'expo-image';
import styled, { css, DefaultTheme } from 'styled-components/native';
import { Text } from '../Text/Text';

export const DescriptionContainer = styled.View`
  width: 100%;
`;

// Built on Text (not Secondary) on purpose: Secondary sets an explicit
// `line-height`, which triggers an iOS bug where text inside a virtualized
// FlatList cell is mis-measured and clips to a single line. Text has no
// line-height, so the description wraps correctly with no numberOfLines hack.
export const PostDescription = styled(Text)`
  width: 100%;
`;

export const PostBody = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    gap: ${theme.metrics.px(10)}px;
    margin-vertical: ${theme.metrics.px(6)}px;
  `}
`;

export const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export const AuthorSection = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    flex-direction: row;
    align-items: flex-start;
    gap: ${theme.metrics.px(10)}px;
  `}
`;

export const OptionsButton = styled.TouchableOpacity`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-start: ${theme.metrics.px(12)}px;
  `}
`;

export const ProcessingBadge = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    position: absolute;
    top: ${theme.metrics.px(10)}px;
    right: ${theme.metrics.px(10)}px;
    background-color: rgba(255, 165, 0, 0.9);
    padding-horizontal: ${theme.metrics.px(12)}px;
    padding-vertical: ${theme.metrics.px(6)}px;
    border-radius: ${theme.metrics.px(16)}px;
  `}
`;

export const ItemHeader = styled.View`
  flex: 1;
  flex-direction: row;
  justify-content: space-between;
`;

export const ItemTitle = styled.View`
  flex: 1;
`;

export const ImageContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    max-height: ${theme.metrics.px(400)}px;
    width: 100%;
  `}
`;

export const AspectImageContainer = styled.View`
  width: 100%;
`;

export const PostImage = styled(Image).attrs({
  placeholder: 'L04x*??G9E9E%%NHS69avwMx~X-:',
  cachePolicy: 'memory-disk',
  contentFit: 'cover',
})`
  ${({ theme }: { theme: DefaultTheme }) => css`
    height: 100%;
    width: 100%;
    border-radius: ${theme.metrics.px(16)}px;
    background-color: ${theme.colors.grey200};
  `}
`;

export const AspectPostImage = styled(Image).attrs({
  placeholder: 'L04x*??G9E9E%%NHS69avwMx~X-:',
  cachePolicy: 'memory-disk',
  contentFit: 'cover',
})`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    border-radius: ${theme.metrics.px(16)}px;
    background-color: ${theme.colors.grey200};
  `}
`;

export const IconsSection = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-items: center;
    gap: ${theme.metrics.px(10)}px;
  `}
`;

export const DotIconContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: ${theme.metrics.px(30)}px;
    flex: 1;
    align-items: flex-start;
  `}
`;

export const ShowCommentsContainer = styled.TouchableOpacity`
  align-content: flex-end;
  justify-content: center;
`;

export const PostBottom = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

export const PostWrapper = styled.View<{ padded?: boolean }>`
  width: 100%;
  ${({ theme, padded }: { theme: DefaultTheme; padded?: boolean }) => padded && css`
    padding-horizontal: ${theme.metrics.px(24)}px;
  `}
`;

export const SharedPostHeader = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: ${theme.metrics.px(8)}px;
    padding-bottom: ${theme.metrics.px(12)}px;
  `}
`;

export const OriginalPostContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    border-width: 1px;
    border-color: ${theme.colors.primary500};
    border-radius: ${theme.metrics.px(12)}px;
    padding: ${theme.metrics.px(12)}px;
    margin-top: ${theme.metrics.px(8)}px;
    background-color: rgba(166, 158, 109, 0.05);
  `}
`;

export const SharedPostHeaderContent = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-items: center;
    gap: ${theme.metrics.px(8)}px;
  `}
`;

export const ShareCommentContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-bottom: ${theme.metrics.px(12)}px;
  `}
`;

export const DeletedPostContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding: ${theme.metrics.px(12)}px;
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: ${theme.metrics.px(8)}px;
    margin-top: ${theme.metrics.px(8)}px;
  `}
`;

export const MaxDepthContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding: ${theme.metrics.px(12)}px;
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: ${theme.metrics.px(8)}px;
    margin-top: ${theme.metrics.px(8)}px;
    gap: ${theme.metrics.px(8)}px;
  `}
`;

export const PostMetaRow = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-items: center;
    gap: ${theme.metrics.px(8)}px;
  `}
`;

export const ClubBadge = styled.TouchableOpacity`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-items: center;
    background-color: rgba(180, 83, 9, 0.3);
    padding-horizontal: ${theme.metrics.px(8)}px;
    padding-vertical: ${theme.metrics.px(2)}px;
    border-radius: ${theme.metrics.px(12)}px;
  `}
`;

export const ClubBadgeText = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-size: ${theme.metrics.px(11)}px;
    color: ${theme.colors.primary500};
    margin-left: ${theme.metrics.px(4)}px;
  `}
`;
