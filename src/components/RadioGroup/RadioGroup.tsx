import { Text } from '../Text/Text';
import { Circle, RadioButtonContainer, RadioGroupContainer } from './styles';

type Options = {
  label: string;
};

type RadioGroupProps = {
  options: Array<Options>;
  activeButton: string;
  onChange: Function;
  mv?: number;
};

type RadioButtonProps = {
  label: string;
  onChange?: Function;
  activeButton: string;
};

const RadioButton = ({ onChange, activeButton, label }: RadioButtonProps) => {
  const active = activeButton === label;
  return (
    <RadioButtonContainer active={active} onPress={() => onChange(label)}>
      <Circle active={active} />
      <Text mv={14} size={12}>
        {label}
      </Text>
    </RadioButtonContainer>
  );
};

const RadioGroup = ({ options, mv, ...props }: RadioGroupProps) => (
  <RadioGroupContainer mv={mv}>
    {options.map(({ label }) => (
      <RadioButton
        key={`radio-group-option-${label}`}
        label={label}
        {...props}
      />
    ))}
  </RadioGroupContainer>
);

export { RadioGroup };
