import { Text } from '../Text/Text';
import { DividerBar, DividerContainer } from './styles';

type DividerProps = {
  text?: string;
  mv?: number;
  mt?: number;
  mb?: number;
  size?: number;
  h?: number;
  color?: string;
};

const Divider = ({ text, mv, size, mt, mb, color, h }: DividerProps) => (
  <DividerContainer mv={mv} mt={mt} mb={mb} size={size}>
    <DividerBar mv={h} color={color}/>
    {text && (
      <Text mh={12} color="grey300" size={14}>
        {text}
      </Text>
    )}
    <DividerBar mv={0} color={color} />
  </DividerContainer>
);

export { Divider };
