import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import awsmobile from '../config/aws';
import { User, UserType } from '../types';

interface PlaceResult {
  place_id: any;
  icon: any;
  name: any;
  geometry: { location: { lat: any; lng: any } };
  vicinity: any;
}

export const useNearbyPlacesFromGoogle = () => {
  const [results, setResults] = useState<User[]>([]);
  const [nextPageToken, setNextPageToken] = useState('');

  const fetchNextPage = async (googleNextPageToken: string) => {
    await new Promise((resolve) => {
      setTimeout(resolve, 400);
    });
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${process.env.GOOGLE_MAPS_API_KEY}&pagetoken=${googleNextPageToken}`
    );
    const data = await response.json();

    if (data.results.length !== 0) {
      const newResults = data.results.map((place: PlaceResult) => ({
        id: place.place_id,
        userType: UserType.VENUE,
        username: '',
        profilePicture: {
          region: awsmobile.aws_user_files_s3_bucket_region,
          bucket: awsmobile.aws_user_files_s3_bucket,
          key: 'new_venue.png',
        },
        venueName: place.name,
        venueAddressGeo: {
          lat: place.geometry.location.lat,
          lon: place.geometry.location.lng,
        },
        venueAddressCity: '',
        venueAddressNumber: '',
        venueAddressStreet: place.vicinity,
        venueAddressState: '',
      }));

      setResults([...results, ...newResults]);
    }

    if (data.next_page_token && results.length < 200) {
      setNextPageToken(data.next_page_token);
    }
  };

  const fetchNearbyPlaces = async (
    { coords }: Location.LocationObject,
    urlRadius: number
  ) => {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coords.latitude}%2C${coords.longitude}&radius=${urlRadius}&type=bar%7Cliquor_store%7Crestaurant%7Cnight_club&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();

    if (data.results.length === 0) {
      setResults([]);
    }

    const googleResults = data.results.map((place: PlaceResult) => ({
      id: place.place_id,
      userType: UserType.VENUE,
      username: '',
      profilePicture: {
        region: awsmobile.aws_user_files_s3_bucket_region,
        bucket: awsmobile.aws_user_files_s3_bucket,
        key: 'new_venue.png',
      },
      venueName: place.name,
      venueAddressGeo: {
        lat: place.geometry.location.lat,
        lon: place.geometry.location.lng,
      },
      venueAddressCity: '',
      venueAddressNumber: '',
      venueAddressStreet: place.vicinity,
      venueAddressState: '',
    }));

    setResults(googleResults);

    if (data.next_page_token) {
      setNextPageToken(data.next_page_token);
    }
  };

  const triggerFetchNearbyPlaces = (
    location: Location.LocationObject,
    radius: number
  ) => {
    fetchNearbyPlaces(location, radius);
  };

  useEffect(() => {
    if (!nextPageToken) {
      return;
    }

    fetchNextPage(nextPageToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextPageToken]);

  return { results, triggerFetchNearbyPlaces };
};
