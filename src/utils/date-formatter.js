
const dateFormatter = (date) => {
  const config = {
    year:  'numeric',
    month: '2-digit',
    day:   '2-digit'
  };
  
  const dateTimeFormat = new Intl.DateTimeFormat('default', config);

  return dateTimeFormat.format(date);
}

module.exports = dateFormatter;