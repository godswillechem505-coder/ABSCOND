/**
 * Utility to generate standard RFC 5545 compliant iCalendar (.ics) format
 * for Apple Calendar, Google Calendar, and Microsoft Outlook.
 */

const formatIcsDate = (dateStr, isDateOnly = true) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';

  const pad = (n) => String(n).padStart(2, '0');
  const year = d.getUTCFullYear();
  const month = pad(d.getUTCMonth() + 1);
  const day = pad(d.getUTCDate());

  if (isDateOnly) {
    return `${year}${month}${day}`;
  }

  const hours = pad(d.getUTCHours());
  const minutes = pad(d.getUTCMinutes());
  const seconds = pad(d.getUTCSeconds());
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
};

const escapeIcsText = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
};

/**
 * Generate .ics calendar content from an array of CalendarEntry or Event records
 * @param {Array} entries - List of calendar events
 * @param {Object} options - Calendar metadata (name, description, timezone)
 * @returns {string} iCalendar formatted text
 */
export const generateIcsContent = (entries = [], options = {}) => {
  const calName = escapeIcsText(options.name || 'ABSCONS Academic Calendar 2025/2026');
  const calDesc = escapeIcsText(options.description || 'Abia State College of Nursing Sciences Academic Schedule');
  const nowIcs = formatIcsDate(new Date().toISOString(), false);

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Abia State College of Nursing Sciences//ABSCONS One Academic Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${calName}`,
    `X-WR-CALDESC:${calDesc}`,
    'X-WR-TIMEZONE:Africa/Lagos',
  ];

  for (const entry of entries) {
    const uid = `abscons-cal-${entry.id || Math.random().toString(36).slice(2)}@abscons.edu.ng`;
    const dtStart = formatIcsDate(entry.startDate || entry.eventDate, true);
    
    // For all-day events in ICS, DTEND is exclusive (next day) if endDate equals startDate
    let endDate = entry.endDate || entry.startDate || entry.eventDate;
    const endObj = new Date(endDate);
    endObj.setUTCDate(endObj.getUTCDate() + 1);
    const dtEnd = formatIcsDate(endObj.toISOString(), true);

    const summary = escapeIcsText(entry.title || 'Academic Event');
    const description = escapeIcsText(entry.description || `Category: ${entry.category || 'Academic'}`);
    const location = escapeIcsText(entry.location || 'ABSCONS Campuses');
    const categories = escapeIcsText((entry.category || 'ACADEMIC').toUpperCase());

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${nowIcs}`);
    lines.push(`DTSTART;VALUE=DATE:${dtStart}`);
    lines.push(`DTEND;VALUE=DATE:${dtEnd}`);
    lines.push(`SUMMARY:${summary}`);
    lines.push(`DESCRIPTION:${description}`);
    lines.push(`LOCATION:${location}`);
    lines.push(`CATEGORIES:${categories}`);
    lines.push('STATUS:CONFIRMED');
    lines.push('TRANSP:TRANSPARENT');
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');

  // RFC 5545 requires CRLF line endings
  return lines.join('\r\n');
};
