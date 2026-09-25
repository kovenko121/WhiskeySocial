import styled, { css, DefaultTheme } from 'styled-components/native';

export const ContentContainer = styled.ScrollView.attrs({
  showsVerticalScrollIndicator: false,
  pagingEnabled: true,
  nestedScrollEnabled: true,
})`
  width: 100%;
  flex-grow: 1;
`;

export const Row = styled.View`
  flex-direction: row;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Buttons = styled.ScrollView.attrs({
  horizontal: true,
  showsHorizontalScrollIndicator: false,
  contentContainerStyle: {
    alignItems: 'center',
  },
  nestedScrollEnabled: true,
})`
  ${({ theme }: { theme: DefaultTheme }) => css`
    height: ${theme.metrics.px(62)};
  `}
`;

export const TagButton = styled.TouchableOpacity`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-right: ${theme.metrics.px(8)}px;
  `}
`;

export const Column = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-horizontal: ${theme.metrics.px(12)}px;
    width: ${theme.metrics.wp(50)};
  `}
`;

export const Empty = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    height: ${theme.metrics.px(80)}px;
  `}
`;

export const CardContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-top: ${theme.metrics.px(26)}px;
  `}
`;

export const PostContainer = styled.View`
  ${({ theme }: any) => css`
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
    gap: ${theme.metrics.px(16)}px;
    margin-top: ${theme.metrics.px(20)}px;
    flex-grow: 1;
  `}
`;

export const PhotoContainer = styled.Image`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 97%;
    height: ${theme.metrics.px(350)}px;
    border-radius: ${theme.metrics.px(8)}px;
    overflow: hidden;
    margin-vertical: ${theme.metrics.px(8)}px;
  `}
`;

export const DeleteButton = styled.TouchableOpacity`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: ${theme.metrics.px(26)}px;
    height: ${theme.metrics.px(26)}px;
    border-radius: 100px;
    align-items: center;
    justify-content: center;
    background-color: ${theme.colors.primary500};
    top: ${theme.metrics.px(14)}px;
    right: ${theme.metrics.px(0)}px;
    position: absolute;
  `}
`;

export const HeaderRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  position: relative;
`;

export const HeaderTitle = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-size: ${theme.metrics.px(16)}px;
    font-weight: 600;
    color: ${theme.colors.white};
    position: absolute;
    left: 0;
    right: 0;
    text-align: center;
    pointer-events: none;
  `}
`;
