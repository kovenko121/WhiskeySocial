import Image from 'next/image';
import { useContext } from 'react';
import { ColorModeContext } from '../../contexts';

export const AppIcon = ({
  width = 175,
  height = 28,
}: {
  width?: number;
  height?: number;
}) => {
  const { mode } = useContext(ColorModeContext);

  return (
    <Image
      alt="logo"
      src={
        mode === 'light' ? '/images/logo-light.png' : '/images/logo-dark.png'
      }
      width={width}
      height={height}
    />
  );
};
