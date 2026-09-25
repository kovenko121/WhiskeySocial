import { useState } from 'react';
import CountryPicker, {
  Country,
  Flag,
} from 'react-native-country-picker-modal';
import countries from 'world-countries/countries.json';
import { Text } from '../Text/Text';
import { Container } from './styles';

const CountrySelect = ({
  onChange,
  initialValue = '+1',
}: {
  onChange: (text: string) => void;
  initialValue?: string;
}) => {
  const [countryCode, setCountryCode] = useState({
    callingCode: [initialValue.replace('+', '')],
    cca2:
      initialValue === '+1'
        ? 'US'
        : countries.filter(
            ({ idd }: { idd: { root: string; suffixes: string[] } }) => idd.root + idd.suffixes.join('') === initialValue
          )[0].cca2,
  });

  const [countryModalOpen, setCountryModalOpen] = useState(false);

  const handleCountrySelect = (country: Country) => {
    setCountryCode({
      callingCode: [country.callingCode[0]],
      cca2: country.cca2
    });
    setCountryModalOpen(false);
    onChange(`+${country.callingCode[0]}`);
  };

  return (
    <>
      <Container onPress={() => setCountryModalOpen(true)}>
        <Flag countryCode={countryCode.cca2 as any} flagSize={24} />
        <Text size={14} bold color="black">
          +{countryCode.callingCode[0]}
        </Text>
      </Container>
      <CountryPicker
        visible={countryModalOpen}
        withAlphaFilter
        withFilter
        // @ts-ignore
        placeholder=""
        withCallingCode
        onSelect={handleCountrySelect}
        onClose={() => setCountryModalOpen(false)}
      />
    </>
  );
};

export { CountrySelect };
