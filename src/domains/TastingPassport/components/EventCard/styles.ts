import styled, { css, DefaultTheme } from 'styled-components/native';

export const Card = styled.Pressable`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    /* Sized to the tallest the content can now get, so the card holds one shape for
       every event instead of growing with the copy: 12px padding top and bottom,
       a 2-line name at 20px, the 4px gap, and the 3-line description cap at 16px
       (24 + 40 + 4 + 48). The description is clamped to 3 lines, so nothing exceeds it. */
    min-height: ${theme.metrics.px(116)}px;
    /* The white logo panel bleeds to the card edges — clip it to the radius. */
    overflow: hidden;
    margin-horizontal: ${theme.metrics.px(24)}px;
    border-radius: ${theme.metrics.px(8)}px;
    background-color: ${theme.colors.grey400};
  `}
`;

export const LogoPanel = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: ${theme.metrics.px(112)}px;
    align-items: stretch;
    justify-content: center;
    padding: ${theme.metrics.px(10)}px;
    background-color: ${theme.colors.white};
  `}
`;

export const Logo = styled.Image`
  flex: 1;
  width: 100%;
`;

export const Info = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    /* Row + flex-start: the name and description hang from the top of the card, so
       they hold the same position whether the description wraps to one line or four.
       The chevron opts out via align-self to sit in the bottom corner. */
    flex-direction: row;
    align-items: flex-start;
    padding: ${theme.metrics.px(12)}px ${theme.metrics.px(12)}px;
  `}
`;

export const Details = styled.View`
  flex: 1;
`;

export const DraftBadge = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    align-self: flex-start;
    margin-bottom: ${theme.metrics.px(4)}px;
    padding-vertical: ${theme.metrics.px(2)}px;
    padding-horizontal: ${theme.metrics.px(6)}px;
    border-radius: ${theme.metrics.px(4)}px;
    background-color: ${theme.colors.warning300};
  `}
`;

export const SoonBadge = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    align-self: flex-start;
    margin-bottom: ${theme.metrics.px(4)}px;
    padding-vertical: ${theme.metrics.px(2)}px;
    padding-horizontal: ${theme.metrics.px(6)}px;
    border-radius: ${theme.metrics.px(4)}px;
    border-width: ${theme.metrics.px(1)}px;
    border-color: ${theme.colors.grey100};
  `}
`;

export const SoonLabel = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-family: ${theme.fonts.title};
    font-size: ${theme.metrics.px(10)}px;
    letter-spacing: ${theme.metrics.px(0.5)}px;
    color: ${theme.colors.grey100};
  `}
`;

export const DraftLabel = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-family: ${theme.fonts.title};
    font-size: ${theme.metrics.px(10)}px;
    letter-spacing: ${theme.metrics.px(0.5)}px;
    color: ${theme.colors.grey500};
  `}
`;

export const EventName = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-family: ${theme.fonts.title};
    font-size: ${theme.metrics.px(16)}px;
    line-height: ${theme.metrics.px(20)}px;
    color: ${theme.colors.white};
  `}
`;

export const SubLine = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-family: ${theme.fonts.regular};
    font-size: ${theme.metrics.px(12)}px;
    /* The backend keeps date + venue in one free-text description, so this wraps
       rather than truncates — line-height keeps multi-line copy readable. */
    line-height: ${theme.metrics.px(16)}px;
    color: ${theme.colors.grey100};
    margin-top: ${theme.metrics.px(4)}px;
  `}
`;

export const Chevron = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-left: ${theme.metrics.px(8)}px;
    /* Overrides the row's centred alignment so the arrow anchors to the bottom
       right of the card, wherever the description's wrapping leaves it. */
    align-self: flex-end;
  `}
`;
