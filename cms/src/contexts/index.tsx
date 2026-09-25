import { RefineThemes } from '@refinedev/antd';
import { ConfigProvider, theme } from 'antd';
import { useSession } from 'next-auth/react';
import { parseCookies } from 'nookies';
import React, {
  PropsWithChildren,
  createContext,
  useEffect,
  useState,
} from 'react';
import { CMSUserRole } from '../graphql-data-provider/utils/graphQlTypes';

type ColorModeContextType = {
  mode: string;
  setMode: (mode: string) => void;
};

export const ColorModeContext = createContext<ColorModeContextType>(
  {} as ColorModeContextType
);

type PermissionContextType = {
  role: CMSUserRole | null;
  brandUserIds?: string[];
  setRole?: (role: CMSUserRole) => void;
  isBrandRole: boolean;
  hasNoBrands: boolean;
  hasNoBrandsAssigned: boolean;
};

export const PermissionContext = createContext<PermissionContextType>({
  role: null,
  brandUserIds: undefined,
  setRole: undefined,
  isBrandRole: false,
  hasNoBrands: false,
  hasNoBrandsAssigned: false,
});

export const ColorModeContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [mode, setMode] = useState('light');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      setMode(parseCookies().theme);
    }
  }, [isMounted]);

  const setColorMode = () => {
    if (mode === 'light') {
      setMode('dark');
    } else {
      setMode('light');
    }
  };

  const { darkAlgorithm, defaultAlgorithm } = theme;

  return (
    <ColorModeContext.Provider
      // eslint-disable-next-line react/jsx-no-constructed-context-values
      value={{
        setMode: setColorMode,
        mode,
      }}
    >
      <ConfigProvider
        // you can change the theme colors here. example: ...RefineThemes.Magenta,
        theme={{
          ...RefineThemes.Blue,
          algorithm: mode === 'light' ? defaultAlgorithm : darkAlgorithm,
        }}
      >
        {children}
      </ConfigProvider>
    </ColorModeContext.Provider>
  );
};

export const PermissionContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const { data: session } = useSession();
  const role = session?.role || null;
  const brandUserIds = session?.brandUserIds || undefined;

  // Check if user has a brand-related role
  const isBrandRole = role === CMSUserRole.BrandOwner || role === CMSUserRole.BrandEditor;

  // Check if user has no brands
  const hasNoBrands = !brandUserIds || brandUserIds.length === 0;

  // Check if a BrandOwner/BrandEditor has no brands assigned
  const hasNoBrandsAssigned = isBrandRole && hasNoBrands;

  return (
    <PermissionContext.Provider
      value={{
        role,
        brandUserIds,
        isBrandRole,
        hasNoBrands,
        hasNoBrandsAssigned,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
};
