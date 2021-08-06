const findAvailableClassesToWatch = (
  classesToWatch,
  availableClassesPerClub
) => {
  const matchedClasses = availableClassesPerClub.map(
    ({ club, today, tomorrow }) => ({
      club,
      today: today.filter(({ description }) =>
        classesToWatch.some(classToWatch => description.includes(classToWatch))
      ),
      tomorrow: tomorrow.filter(({ description }) =>
        classesToWatch.some(classToWatch => description.includes(classToWatch))
      ),
    })
  );

  return areClassesToWatchAvailable(matchedClasses) ? 
    matchedClasses.filter(({ today, tomorrow }) => !!today.length || !!tomorrow.length) : [];
};

const areClassesToWatchAvailable = (matchedClasses) => {
  return !matchedClasses.every(
    ({ today, tomorrow }) => !today.length && !tomorrow.length
  );
};

module.exports = findAvailableClassesToWatch;
