const MIN_ASPECT_RATIO = 0.8;
const MAX_ASPECT_RATIO = 1.91;

const getClampedAspectRatio = (source: unknown) => {
  if (typeof source !== 'object' || source === null) return null;

  const { width, height } = source as {
    width?: number | null;
    height?: number | null;
  };

  if (!width || !height || width <= 0 || height <= 0) return null;

  return Math.min(Math.max(width / height, MIN_ASPECT_RATIO), MAX_ASPECT_RATIO);
};

export { getClampedAspectRatio, MIN_ASPECT_RATIO, MAX_ASPECT_RATIO };
