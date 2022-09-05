class DateValidator {
  // Validates that the input string is a valid date formatted as "mm/dd/yyyy"
  static isValidDate = (dateString: string): boolean => {
    // First check for the pattern
    if (!/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(dateString)) {
      return false;
    }

    // Parse the date parts to integers
    const parts = dateString.split('/');
    const day = parseInt(parts[2], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[0], 10);

    // Check the ranges of month and year
    if (year < 1000 || year > 3000 || month === 0 || month > 12) {
      return false;
    }

    const monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // Adjust for leap years
    if (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)) {
      monthLength[1] = 29;
    }

    // Check the range of the day
    return day > 0 && day <= monthLength[month - 1];
  };

  static isValidTime = (timeString: string): boolean => {
    return /^([0-1]?\d|2[0-4]):([0-5]\d)(:[0-5]\d)?$/.test(timeString);
  };

  static adaptFormatOfDays = (startTime: string, startDay: string, endTime: string, endDay: string): Array<string> => {
    const start = startTime.split(':');
    const end = endTime.split(':');
    const startHour = parseInt(start[0], 10);
    const startMinutes = parseInt(start[1], 10);
    const endHour = parseInt(end[0], 10);
    const endMinutes = parseInt(end[1], 10);

    const startDayDate = new Date(new Date(startDay).setHours(startHour));
    startDayDate.setMinutes(startMinutes);
    const startDayString = JSON.stringify(startDayDate.getTime());
    const endDayDate = new Date(new Date(endDay).setHours(endHour));
    endDayDate.setMinutes(endMinutes);
    const endDayString = JSON.stringify(endDayDate.getTime());

    return [startDayString, endDayString];
  };
}

export { DateValidator };
