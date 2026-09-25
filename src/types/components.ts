export interface ImageUrl {
  uri: string;
  cacheKey?: string
  width?: number;
  height?: number;
}

export interface PickedImage {
  uri: string;
  width?: number;
  height?: number;
}
