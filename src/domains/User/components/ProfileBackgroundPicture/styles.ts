import { ImageBackground } from 'expo-image';
import styled, { css, DefaultTheme } from 'styled-components/native';

export const PictureContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    display: flex;
    flex-direction: column;
    height: ${theme.metrics.hp(25)}px;
    width: 100%;
    margin-bottom: ${theme.metrics.hp(2)}px;
    justify-content: flex-end;
    background-color: ${theme.colors.grey400};
    align-items: center;
    gap: ${theme.metrics.hp(2)}px;
  `}
`;

export const ProfileBackgroundImage = styled(ImageBackground).attrs({
  placeholder: 'L04x*??G9E9E%%NHS69avwMx~X-:',
  priority: 'high',
  cachePolicy: 'memory-disk',
})`
  ${({ theme }: { theme: DefaultTheme }) => css`
    display: flex;
    height: 100%;
    width: 100%;
    position: absolute;
    align-items: center;
    justify-content: center;
    background-color: ${theme.colors.grey400};
  `}
`;
