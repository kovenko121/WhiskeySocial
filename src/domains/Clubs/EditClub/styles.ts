import styled, { css, DefaultTheme } from 'styled-components/native';

export const ScreenContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    height: 100%;
    background-color: ${theme.colors.backgroundDark};
  `}
`;

export const HeaderContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    background-color: ${theme.colors.backgroundDark};
  `}
`;

export const ContentContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    padding-horizontal: ${theme.metrics.px(24)}px;
    padding-top: ${theme.metrics.px(20)}px;
  `}
`;

export const PictureContainer = styled.View`
  align-items: center;
  margin-bottom: 20px;
`;

export const CoverPhotoContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    position: relative;
    width: 100%;
    height: ${theme.metrics.px(150)}px;
    background-color: ${theme.colors.grey400};
    border-radius: ${theme.metrics.px(12)}px;
    justify-content: center;
    align-items: center;
    margin-bottom: ${theme.metrics.px(20)}px;
    overflow: hidden;
  `}
`;

export const CoverPhotoImage = styled.Image`
  width: 100%;
  height: 100%;
`;

export const CoverPhotoPlaceholder = styled.View`
  justify-content: center;
  align-items: center;
`;

export const EditIconOverlay = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    position: absolute;
    bottom: ${theme.metrics.px(12)}px;
    right: ${theme.metrics.px(12)}px;
    width: ${theme.metrics.px(40)}px;
    height: ${theme.metrics.px(40)}px;
    border-radius: ${theme.metrics.px(20)}px;
    background-color: rgba(0, 0, 0, 0.6);
    justify-content: center;
    align-items: center;
  `}
`;

export const FormContainer = styled.View`
  flex: 1;
`;

export const InputContainer = styled.View<{ half?: boolean }>`
  ${({ theme, half }: { theme: DefaultTheme; half?: boolean }) => css`
    width: ${half ? '48%' : '100%'};
    margin-bottom: ${theme.metrics.px(16)}px;
  `}
`;

export const ButtonContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-horizontal: ${theme.metrics.px(24)}px;
    padding-bottom: ${theme.metrics.px(20)}px;
    background-color: ${theme.colors.backgroundDark};
  `}
`;

export const PrivacySection = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-bottom: ${theme.metrics.px(16)}px;
  `}
`;

export const PrivacyRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export const PrivacyLabel = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-size: ${theme.metrics.px(16)}px;
    color: ${theme.colors.white};
  `}
`;

export const PrivacyHelperText = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-size: ${theme.metrics.px(12)}px;
    color: ${theme.colors.grey300};
    margin-top: ${theme.metrics.px(8)}px;
  `}
`;
