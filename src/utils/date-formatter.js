const dateFormatter = (date) => {
  const config = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };

  const dateTimeFormat = new Intl.DateTimeFormat("eu-ES", config);
  console.log("formatter", date, dateTimeFormat, dateTimeFormat.format(date));
  return dateTimeFormat.format(date);
};

module.exports = dateFormatter;
