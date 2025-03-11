/**
 * Format a date as a relative time string (e.g., "2 hours ago")
 * @param {Date|number} date - The date to format
 * @returns {string} The formatted relative time
 */
export const formatDistanceToNow = (date) => {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  
  // Convert to seconds
  const diffSec = Math.floor(diffMs / 1000);
  
  if (diffSec < 60) {
    return 'just now';
  }
  
  // Convert to minutes
  const diffMin = Math.floor(diffSec / 60);
  
  if (diffMin < 60) {
    return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
  }
  
  // Convert to hours
  const diffHour = Math.floor(diffMin / 60);
  
  if (diffHour < 24) {
    return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
  }
  
  // Convert to days
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffDay < 30) {
    return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
  }
  
  // Convert to months
  const diffMonth = Math.floor(diffDay / 30);
  
  if (diffMonth < 12) {
    return `${diffMonth} month${diffMonth !== 1 ? 's' : ''} ago`;
  }
  
  // Convert to years
  const diffYear = Math.floor(diffMonth / 12);
  
  return `${diffYear} year${diffYear !== 1 ? 's' : ''} ago`;
};

/**
 * Format a date as a string (e.g., "Jan 1, 2023")
 * @param {Date|number} date - The date to format
 * @returns {string} The formatted date
 */
export const formatDate = (date) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(date).toLocaleDateString(undefined, options);
};

/**
 * Format a time as a string (e.g., "9:00 AM")
 * @param {Date|number} date - The date to format
 * @returns {string} The formatted time
 */
export const formatTime = (date) => {
  const options = { hour: 'numeric', minute: '2-digit', hour12: true };
  return new Date(date).toLocaleTimeString(undefined, options);
};

/**
 * Format a duration in minutes as a string (e.g., "1h 30m")
 * @param {number} minutes - The duration in minutes
 * @returns {string} The formatted duration
 */
export const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  }
  
  return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
};

/**
 * Get the start and end of a day
 * @param {Date} date - The date
 * @returns {Object} The start and end of the day
 */
export const getDayBounds = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
};

/**
 * Get the start and end of a week
 * @param {Date} date - The date
 * @returns {Object} The start and end of the week
 */
export const getWeekBounds = (date) => {
  const start = new Date(date);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
};

/**
 * Get the start and end of a month
 * @param {Date} date - The date
 * @returns {Object} The start and end of the month
 */
export const getMonthBounds = (date) => {
  const start = new Date(date);
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(date);
  end.setMonth(end.getMonth() + 1);
  end.setDate(0);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
};