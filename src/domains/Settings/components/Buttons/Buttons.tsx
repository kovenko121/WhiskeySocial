import { Button } from '@components';
import { BottomButtonWrapper, ButtonWrapper } from './styles';

export const Buttons = ({
  cancelHandler,
  continueHandler,
  continueLabel,
}: {
  cancelHandler: () => void;
  continueHandler: () => void;
  continueLabel: string;
}) => (
  <BottomButtonWrapper>
    <ButtonWrapper>
      <Button
        label="Cancel"
        onPress={cancelHandler}
        variant="outlineDefault"
        full
      />
    </ButtonWrapper>
    <ButtonWrapper>
      <Button label={continueLabel} onPress={continueHandler} full />
    </ButtonWrapper>
  </BottomButtonWrapper>
);
