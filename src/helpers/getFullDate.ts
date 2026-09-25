const getFullDate = (timestamp: string) => {
  const formattedDate: string = new Date(timestamp).toLocaleDateString(
    'en-US',
    { day: '2-digit', month: 'long', year: 'numeric' }
  );

  return formattedDate;
};

export { getFullDate };
