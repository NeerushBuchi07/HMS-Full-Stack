import { DateTime } from 'luxon';

// Parse appointment date and time into a Luxon DateTime in local zone.
// appointment.date can be a date string or ISO; appointment.time may be 'HH:mm' or 'hh:mm a'.
export function getAppointmentDateTime(appointment) {
  if (!appointment) return null;

  // Try to get ISO date part from appointment.date
  let dateISO;
  try {
    const dt = DateTime.fromISO(appointment.date, { zone: 'utc' });
    if (dt.isValid) {
      // Keep the date components (year-month-day)
      dateISO = dt.toISODate();
    } else {
      // Try parsing as RFC2822 or HTTP if ISO fails
      const alt = DateTime.fromRFC2822(appointment.date, { zone: 'utc' });
      if (alt.isValid) dateISO = alt.toISODate();
    }
  } catch (e) {
    // ignore
  }

  if (!dateISO) {
    // fallback: try Date constructor
    const fallback = new Date(appointment.date);
    if (!isNaN(fallback.getTime())) {
      dateISO = fallback.toISOString().split('T')[0];
    } else {
      return null;
    }
  }

  // Normalize time. If time is empty, default to start of day.
  const timeStr = appointment.time ? appointment.time.trim() : '00:00';

  // Try parsing as 24-hour first
  let combined = DateTime.fromISO(`${dateISO}T${timeStr}`, { zone: 'local' });
  if (combined.isValid) return combined;

  // Try parsing common formats with fromFormat
  const formats = ['h:mm a', 'hh:mm a', 'H:mm', 'HH:mm', 'h:mm:ss a', 'HH:mm:ss'];
  for (const fmt of formats) {
    const dt = DateTime.fromFormat(`${dateISO} ${timeStr}`, `yyyy-MM-dd ${fmt}`, { zone: 'local' });
    if (dt.isValid) return dt;
  }

  // Last resort: parse using JS Date and convert
  const jsDate = new Date(`${dateISO} ${timeStr}`);
  if (!isNaN(jsDate.getTime())) return DateTime.fromJSDate(jsDate).setZone('local');

  return null;
}

export function getUpcomingAppointments(appointments = [], options = {}) {
  const { limit = 3 } = options;
  const now = DateTime.local();
  return appointments
    .map(a => ({ ...a, _dt: getAppointmentDateTime(a) }))
    .filter(a => a._dt && a._dt > now && a.status !== 'Cancelled')
    .sort((a, b) => a._dt - b._dt)
    .slice(0, limit);
}

export function getRecentAppointments(appointments = [], options = {}) {
  const { limit = 5 } = options;
  const now = DateTime.local();
  return appointments
    .map(a => ({ ...a, _dt: getAppointmentDateTime(a) }))
    .filter(a => a._dt && a._dt <= now)
    .sort((a, b) => b._dt - a._dt)
    .slice(0, limit);
}

export default { getAppointmentDateTime, getUpcomingAppointments, getRecentAppointments };
