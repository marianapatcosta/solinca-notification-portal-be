const findOtherAvailableClasses = (
  classesToWatch,
  availableClassesPerClub
) => {
  const otherAvailableClasses = availableClassesPerClub.map(({ club, today, tomorrow }) => ({
    club,
    today: today.filter(({ description }) =>
      !classesToWatch.some(classToWatch => description.includes(classToWatch))

    ),
    tomorrow: tomorrow.filter(({ description }) =>
      !classesToWatch.some(classToWatch => description.includes(classToWatch))
    ),
  }));
  return areOtherClassesAvailable(otherAvailableClasses) ? otherAvailableClasses : [];
};

const areOtherClassesAvailable = (otherClasses) => {
  return !otherClasses.every(({today, tomorrow}) => !today.length && !tomorrow.length);
}

module.exports = findOtherAvailableClasses;
