import { Button, CreatePostModal, Icon, Text } from '@components';
import { useAuth } from '@contexts';
import {
  capitalizeAll,
  getDistanceBetweenGeoPoints,
  getDistanceBetweenGeoPointsKm,
  navigateUserProfile,
  NEARBY_PLACES_RADIUS_KM,
} from '@helpers';
import { useBottomPadding, useGuestGuard, useVenuesByGeoPoint } from '@hooks';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Routes } from '@types';
import type { RootStackParams, User
} from '@types';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import { createRef, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import mapStyle from '../../../../assets/map/style.json';
import {
  IconContainer,
  Map,
  MyMarker,
  ScreenContainer,
  SearchButton,
  SearchContainer,
  VenueCardAddress,
  VenueCardDistance,
  VenueCardName,
  CheckinButton,
  VenueCardOverlay,
  VenueCardRow,
  WsVenueMarker,
} from './styles';

type Props = NativeStackScreenProps<RootStackParams, 'NearbyPlaces'>;

const MAP_MIN_DELTA = 0.04;
const MAP_MAX_DELTA = 2;
const MAP_NEAREST_REACH = 1.8;
const KM_PER_DEGREE = 111;

export const NearbyPlacesScreen = ({ navigation }: Props) => {
  const { user, isGuest, exitGuestMode } = useAuth();
  const sub = user?.sub;
  const guardedCheckin = useGuestGuard('pour_log');
  const { bottomPadding } = useBottomPadding();
  const [location, setLocation] = useState<Location.LocationObject>();
  const { data } = useVenuesByGeoPoint(location!, NEARBY_PLACES_RADIUS_KM);
  const [errorMsg, setErrorMsg] = useState('');
  const [markerRefs, setMarkerRefs] = useState<any>([]);
  const mapRef = useRef<MapView>(null);
  const hasFittedRef = useRef(false);

  const [createPostVisible, setCreatePostVisible] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<User | undefined>(
    undefined
  );
  const [selectedMarkerVenue, setSelectedMarkerVenue] = useState<
    User | undefined
  >(undefined);
  const handleCheckin = (item: User) => {
    guardedCheckin(() => {
      setSelectedVenue(item);
      setCreatePostVisible(true);
      setTimeout(() => {
        navigation.navigate(Routes.NearbyPlaces);
      }, 10);
    });
  };

  const allVenues = useMemo(
    () =>
      data?.pages
        .flatMap((page) => page.items)
        .filter(
          (venue) => !venue.deleted && !venue.archived && venue.venueAddressGeo
        ) ?? [],
    [data]
  );

  useEffect(() => {
    setMarkerRefs((prev) => allVenues.map((_, i) => prev[i] || createRef()));
  }, [allVenues]);

  useEffect(() => {
    if (hasFittedRef.current || !location || allVenues.length === 0) return;
    hasFittedRef.current = true;

    const nearestKm = getDistanceBetweenGeoPointsKm(
      allVenues[0].venueAddressGeo!,
      { lat: location.coords.latitude, lon: location.coords.longitude }
    );
    const delta = Math.min(
      Math.max((nearestKm * MAP_NEAREST_REACH * 2) / KM_PER_DEGREE, MAP_MIN_DELTA),
      MAP_MAX_DELTA
    );

    if (delta <= MAP_MIN_DELTA) return;

    mapRef.current?.animateToRegion(
      {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: delta,
        longitudeDelta: delta,
      },
      600
    );
  }, [allVenues, location]);

  useEffect(() => {
    let subscription: Location.LocationSubscription | undefined;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        // eslint-disable-next-line @typescript-eslint/no-shadow
        (location) => {
          setLocation(location);
        }
      );
    })();

    return () => {
      subscription?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goBack = () => {
    if (isGuest) {
      exitGuestMode();
      navigation.navigate(Routes.Login);
    } else {
      navigation.goBack();
    }
  };

  const goToSearch = () => {
    navigation.navigate(Routes.Search, { category: 'Places' });
  };

  // Android needs extra bottom offset so the overlay clears the nav bar.
  const overlayBottomStyle =
    Platform.OS === 'android' ? { bottom: bottomPadding + 12 } : undefined;

  return (
    <ScreenContainer>
      <StatusBar style="dark" />
      <SearchContainer>
        <IconContainer onPress={goBack}>
          <Icon name="left" size={16} color="primary500" />
        </IconContainer>
        <SearchButton onPress={goToSearch}>
          <Icon name="search" size={22} color="primary500" />
          <Text color="neutral300" size={14} mh={6} mv={6}>
            Search places
          </Text>
        </SearchButton>
      </SearchContainer>
      {location ? (
        <>
          <Map
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            customMapStyle={mapStyle}
            onPress={() => setSelectedMarkerVenue(undefined)}
            onMarkerPress={(e) => {
              const venue = allVenues.find(
                (v) =>
                  v.venueAddressGeo?.lat === e.nativeEvent.coordinate.latitude &&
                  v.venueAddressGeo?.lon === e.nativeEvent.coordinate.longitude
              );
              if (venue) setSelectedMarkerVenue(venue);
            }}
            initialRegion={{
              latitude: location?.coords?.latitude,
              longitude: location?.coords?.longitude,
              latitudeDelta: 0.04,
              longitudeDelta: 0.04,
            }}
          >
            {allVenues.map((venue, index) => (
              <Marker
                key={venue.id}
                coordinate={{
                  latitude: venue.venueAddressGeo!.lat,
                  longitude: venue.venueAddressGeo!.lon,
                }}
                ref={markerRefs[index]}
              >
                <WsVenueMarker />
              </Marker>
            ))}
            <Marker coordinate={location?.coords}>
              <MyMarker />
            </Marker>
          </Map>
          {data && allVenues.length === 0 && !selectedMarkerVenue && (
            <VenueCardOverlay style={overlayBottomStyle}>
              <VenueCardName numberOfLines={3}>
                No spots in the Whiskey Social catalog within 60 miles of you.
              </VenueCardName>
              <VenueCardAddress numberOfLines={2}>
                See what people are pouring.
              </VenueCardAddress>
              {!isGuest && (
                <Button
                  label="Browse the feed"
                  icon="home"
                  onPress={() => navigation.navigate(Routes.Home)}
                  mv={12}
                />
              )}
            </VenueCardOverlay>
          )}
          {selectedMarkerVenue && location && (
            <VenueCardOverlay style={overlayBottomStyle}>
              <TouchableOpacity
                onPress={() => setSelectedMarkerVenue(undefined)}
                style={{ position: 'absolute', top: 8, right: 12 }}
              >
                <Icon name="close" size={16} color="grey100" />
              </TouchableOpacity>
              <VenueCardName numberOfLines={2}>
                {selectedMarkerVenue.venueName}
              </VenueCardName>
              <VenueCardAddress numberOfLines={1}>
                {capitalizeAll(
                  [
                    selectedMarkerVenue.venueAddressStreet,
                    selectedMarkerVenue.venueAddressCity,
                    selectedMarkerVenue.venueAddressState,
                  ]
                    .filter((part) => typeof part === 'string' && part.trim().length > 0)
                    .join(', ')
                )}
              </VenueCardAddress>
              <VenueCardRow>
                <VenueCardDistance>
                  {getDistanceBetweenGeoPoints(
                    selectedMarkerVenue.venueAddressGeo!,
                    {
                      lat: location.coords.latitude,
                      lon: location.coords.longitude,
                    }
                  )}
                </VenueCardDistance>
                <CheckinButton
                  onPress={() => handleCheckin(selectedMarkerVenue)}
                >
                  <Icon name="gps" size={14} color="white" />
                  <Text size={12} color="white" bold>
                    Check-in
                  </Text>
                </CheckinButton>
              </VenueCardRow>
              <TouchableOpacity
                onPress={() =>
                  navigateUserProfile(
                    selectedMarkerVenue.id,
                    sub,
                    navigation
                  )
                }
                style={{ marginTop: 10 }}
              >
                <Text size={13} color="primary300">
                  View profile
                </Text>
              </TouchableOpacity>
            </VenueCardOverlay>
          )}
        </>
      ) : (
        <Text align="center" mv={36}>
          {errorMsg}
        </Text>
      )}
      <CreatePostModal
        venueCheckin={selectedVenue}
        visible={createPostVisible}
        onBackButtonPress={() => setCreatePostVisible(false)}
      />
    </ScreenContainer>
  );
};
