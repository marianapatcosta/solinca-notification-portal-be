const findAvailableClassesToTrack = (
  classesToTrack,
  availableClassesPerClub
) => {
  const matchedClasses = availableClassesPerClub.map(({ club, today, tomorrow }) => ({
    club,
    today: today.filter(({ project_code }) =>
      classesToTrack.includes(project_code)
    ),
    tomorrow: tomorrow.filter(({ project_code }) =>
      classesToTrack.includes(project_code)
    ),
  }));
  return areClassesToTrackAvailable(matchedClasses) ? matchedClasses : [];
};

const areClassesToTrackAvailable = (matchedClasses) => {
  return !matchedClasses.every(({today, tomorrow}) => !today.length && !tomorrow.length);
}

module.exports = findAvailableClassesToTrack;
