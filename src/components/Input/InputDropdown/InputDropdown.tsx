import { theme } from '@theme';
import { useState } from 'react';
import DropDownPicker, { ValueType } from 'react-native-dropdown-picker';
import { Text } from '../../Text/Text';

export type InputOptions = {
  label: string;
  value: string;
};

const InputDropdown = ({
  mv = 0,
  zIndex,
  options,
  setSelected,
  placeHolder = 'Select option',
  error,
  errorMessage,
}: {
  options: InputOptions[] | any;
  setSelected: (val: any) => void;
  placeHolder: string;
  mv: number;
  zIndex?: number;
  error?: boolean;
  errorMessage?: string;
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<ValueType>();

  return (
    <>
      <DropDownPicker
        open={open}
        setOpen={() => setOpen(!open)}
        multiple={false}
        onSelectItem={(val) => {
          setSelected(val);
        }}
        setValue={(val) => setValue(val)}
        value={value || null}
        placeholder={placeHolder}
        items={options}
        labelStyle={{ color: theme.colors.black }}
        selectedItemLabelStyle={{ color: theme.colors.black }}
        style={{
          backgroundColor: theme.colors.white,
          zIndex: 0,
          height: theme.metrics.px(52),
          borderWidth: theme.metrics.px(1),
          borderColor: error ? theme.colors.red : theme.colors.primary,
          marginVertical: theme.metrics.px(mv),
          borderRadius: theme.metrics.px(8),
        }}
        zIndex={zIndex || 0}
        textStyle={{ color: theme.colors.black300, fontSize: theme.metrics.px(14) }}
        modalAnimationType="none"
      />
      {errorMessage && (
        <Text mv={4} mh={8} color="red" align="center">
          {errorMessage}
        </Text>
      )}
    </>
  );
};

export { InputDropdown };
