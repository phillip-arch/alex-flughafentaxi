export const LEAD_TIME_GRACE_MINUTES = 5;
export const DAYTIME_LEAD_TIME_MINUTES = 180;
export const NIGHTTIME_LEAD_TIME_MINUTES = 480;
export const DAYTIME_LEAD_TIME_ERROR =
  'Short-notice bookings require 3 hours notice. Please call Alex for urgent requests.';
export const NIGHT_LEAD_TIME_ERROR =
  'Night bookings require 8 hours notice. Please call Alex for urgent requests.';

export function isNightLeadTimeWindow(selectedDate: Date) {
  const selectedHour = selectedDate.getHours();
  return selectedHour >= 22 || selectedHour < 7;
}

export function getRequiredLeadTimeMinutes(selectedDate: Date) {
  return isNightLeadTimeWindow(selectedDate)
    ? NIGHTTIME_LEAD_TIME_MINUTES
    : DAYTIME_LEAD_TIME_MINUTES;
}

export function getEffectiveLeadTimeMinutes(selectedDate: Date) {
  return getRequiredLeadTimeMinutes(selectedDate) - LEAD_TIME_GRACE_MINUTES;
}

export function getLeadTimeDifferenceMinutes(selectedDate: Date, now = new Date()) {
  return Math.floor((selectedDate.getTime() - now.getTime()) / 60000);
}

export function hasSufficientLeadTime(selectedDate: Date, now = new Date()) {
  return getLeadTimeDifferenceMinutes(selectedDate, now) >= getEffectiveLeadTimeMinutes(selectedDate);
}

export function getLeadTimeErrorMessage(selectedDate: Date) {
  return isNightLeadTimeWindow(selectedDate) ? NIGHT_LEAD_TIME_ERROR : DAYTIME_LEAD_TIME_ERROR;
}

export function roundUpToNextFiveMinutes(value: Date) {
  const rounded = new Date(value);
  rounded.setSeconds(0, 0);

  const remainder = rounded.getMinutes() % 5;
  if (remainder !== 0) {
    rounded.setMinutes(rounded.getMinutes() + (5 - remainder));
  }

  return rounded;
}

export function getEarliestAllowedDateTimeForDay(dayDate: Date, now = new Date()) {
  const startOfDay = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), 23, 55, 0, 0);
  const initialCursor = new Date(Math.max(startOfDay.getTime(), now.getTime()));
  let cursor = roundUpToNextFiveMinutes(initialCursor);

  while (cursor.getTime() <= endOfDay.getTime()) {
    if (hasSufficientLeadTime(cursor, now)) {
      return cursor;
    }

    cursor = new Date(cursor.getTime() + 5 * 60 * 1000);
  }

  return null;
}

export function getNextAllowedDateTime(startDate: Date, now = new Date(), maxDaysAhead = 90) {
  const latestAllowed = new Date(now);
  latestAllowed.setDate(latestAllowed.getDate() + maxDaysAhead);
  latestAllowed.setHours(23, 55, 0, 0);

  let cursor = roundUpToNextFiveMinutes(new Date(Math.max(startDate.getTime(), now.getTime())));

  while (cursor.getTime() <= latestAllowed.getTime()) {
    if (hasSufficientLeadTime(cursor, now)) {
      return cursor;
    }

    cursor = new Date(cursor.getTime() + 5 * 60 * 1000);
  }

  return null;
}

export function formatLeadTimeTimeValue(value: Date) {
  return `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`;
}
