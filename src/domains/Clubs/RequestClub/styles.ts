import styled from 'styled-components/native';

export const ScreenContainer = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.backgroundDark};
`;

export const ContentContainer = styled.ScrollView.attrs({
  showsVerticalScrollIndicator: false,
  keyboardShouldPersistTaps: 'handled',
  contentContainerStyle: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
})``;

export const PositionContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export const BottomButtonWrapper = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: ${({ theme }) => theme.metrics.px(24)}px;
  background-color: ${({ theme }) => theme.colors.backgroundDark};
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colors.grey500};
`;

export const PrivacyRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: ${({ theme }) => theme.metrics.px(16)}px;
  margin-bottom: ${({ theme }) => theme.metrics.px(8)}px;
`;
