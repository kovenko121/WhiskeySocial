/* eslint-disable no-case-declarations */
import * as Location from 'expo-location';
import { JSX, createContext, useContext, useEffect, useMemo, useState } from 'react';

type LocationContextData = {
  location: Location.LocationObject | undefined;
  error: string;
};

const LocationContext = createContext({} as LocationContextData);

export const useLocation = () => useContext(LocationContext);

export const LocationProvider = ({ children }: { children: JSX.Element }) => {
  const [location, setLocation] = useState<Location.LocationObject>();
  const [error, setError] = useState('');

  useEffect(() => {
    let subscription: Location.LocationSubscription | undefined;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        return;
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update location every 5 seconds
          distanceInterval: 10, // Minimum distance (in meters) between updates
        },
        // eslint-disable-next-line @typescript-eslint/no-shadow
        (location) => setLocation(location)
      );
    })();

    return () => {
      subscription?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contextValue = useMemo(() => ({ location, error }), [location, error]);

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
};
