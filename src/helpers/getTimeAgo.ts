const getTimeAgo = (timestamp: String, short = false) => {
  const now = new Date();
  const date = new Date(timestamp);

  const secondsElapsed = Math.floor((now - date) / 1000);
  const minutesElapsed = Math.floor(secondsElapsed / 60);
  const hoursElapsed = Math.floor(minutesElapsed / 60);

  if (secondsElapsed < 60) {
    return short ? `${secondsElapsed}s` :`${secondsElapsed} seconds ago`;
  }
  if (minutesElapsed < 60) {
    return short ? `${minutesElapsed}m` : `${minutesElapsed} minutes ago`;
  }
  if (hoursElapsed < 24) {
    return short ? `${hoursElapsed}h` :`${hoursElapsed} hours ago`;
  }
  const daysElapsed = Math.floor(hoursElapsed / 24);
  return short ? `${daysElapsed}d`  :`${daysElapsed} days ago`;
};

export { getTimeAgo };
