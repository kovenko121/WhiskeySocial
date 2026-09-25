import { Button, SectionSubTitle } from '@components';
import { Icons } from '@types';
import { Label, RadioGroupContainer } from './styles';

export const RadioGroup = ({
  title,
  options,
  selectedOption,
  onPress,
}: {
  title: string;
  options: Array<{ label: string; icon: any }>;
  selectedOption: string;
  onPress: (option: string) => void;
}) => (
    <RadioGroupContainer>
      <Label>
        <SectionSubTitle size={14} align="left" mt={0} bold>
          {title}
        </SectionSubTitle>
      </Label>

      {options.map((item: { label: string; icon: Icons }) => (
        <Button
          icon={item.icon}
          label={item.label}
          onPress={() => onPress(item.label)}
          iconColor={selectedOption === item.label ? 'white' : 'primary500'}
          variant={selectedOption === item.label ? 'default' : 'outlineDefault'}
          full
          mv={4}
          center={false}
        />
      ))}
    </RadioGroupContainer>
  );
