import { Link as OriginalLink } from '@components';
import styled, { css, DefaultTheme } from 'styled-components/native';

export const TitleContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    /* No bottom margin: the 24px inset matches siblings, and the title-to-card
       spacing comes from the Discover Content view's 20px flex gap, exactly as
       New Bottles / Nearby Places space their title from their content. */
    margin-horizontal: ${theme.metrics.px(24)}px;
    flex-direction: row;
    justify-content: space-between;
  `}
`;

/* Nudged down to sit on the Title's baseline, matching Latest Articles' link. */
export const Link = styled(OriginalLink)`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-top: ${theme.metrics.px(12)}px;
  `}
`;

/**
 * The cards are one group, not one section each: a tighter 12px gap between them so
 * the stack reads as a list, leaving the Content view's 20px to separate Events from
 * whatever Discover shows next.
 */
export const EventList = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    gap: ${theme.metrics.px(12)}px;
  `}
`;
