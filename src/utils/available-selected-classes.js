const findAvailableClassesToWatch = (
  classesToWatch,
  availableClassesPerClub
) => {
  const matchedClasses = availableClassesPerClub.map(
    ({ club, today, tomorrow }) => ({
      club,
      today: today.filter(({ project_code }) =>
        classesToWatch.includes(project_code)
      ),
      tomorrow: tomorrow.filter(({ project_code }) =>
        classesToWatch.includes(project_code)
      ),
    })
  );
  return areClassesToWatchAvailable(matchedClasses) ? matchedClasses : [];
};

const areClassesToWatchAvailable = (matchedClasses) => {
  return !matchedClasses.every(
    ({ today, tomorrow }) => !today.length && !tomorrow.length
  );
};

module.exports = findAvailableClassesToWatch;
