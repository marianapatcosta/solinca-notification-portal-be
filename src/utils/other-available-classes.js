const findOtherAvailableClasses = (
  classesToTrack,
  availableClassesPerClub
) => {
  const otherAvailableClasses = availableClassesPerClub.map(({ club, today, tomorrow }) => ({
    club,
    today: today.filter(({ project_code }) =>
      !classesToTrack.includes(project_code)
    ),
    tomorrow: tomorrow.filter(({ project_code }) =>
      !classesToTrack.includes(project_code)
    ),
  }));
  return areOtherClassesAvailable(otherAvailableClasses) ? otherAvailableClasses : [];
};

const areOtherClassesAvailable = (otherClasses) => {
  return !otherClasses.every(({today, tomorrow}) => !today.length && !tomorrow.length);
}

module.exports = findOtherAvailableClasses;
