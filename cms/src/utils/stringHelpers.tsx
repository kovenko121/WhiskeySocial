import React from 'react';

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const truncate = (string: string, maxLength: number): string =>
  string.length > maxLength ? string.slice(0, maxLength) + '...' : string;

export const formatUrlToString = (
  value: string | null | undefined,
  maxLength: number = 30
): string => {
  if (!value || typeof value !== 'string') {
    return '-';
  }

  return truncate(value, maxLength);
};

export const formatUrlToAnchor = (
  value: string | null | undefined,
  maxLength: number = 30
): React.ReactElement => {
  if (!value || typeof value !== 'string') {
    return <span>-</span>;
  }

  if (isValidUrl(value)) {
    return (
      <a href={value} target="_blank" rel="noopener noreferrer" title={value}>
        {truncate(value, maxLength)}
      </a>
    );
  }

  return <span>{value}</span>;
};
