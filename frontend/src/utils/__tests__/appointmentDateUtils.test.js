import { DateTime } from 'luxon';
import {
  getAppointmentDateTime,
  getUpcomingAppointments,
  getRecentAppointments
} from '../appointmentDateUtils';

describe('appointmentDateUtils', () => {
  test('parses ISO date with 24-hour time', () => {
    const ap = { date: '2025-10-24T00:00:00.000Z', time: '14:30' };
    const dt = getAppointmentDateTime(ap);
    expect(dt).not.toBeNull();
    expect(dt.isValid).toBe(true);
    expect(dt.hour).toBe(14);
    expect(dt.day).toBe(24);
  });

  test('parses 12-hour time with AM/PM', () => {
    const ap = { date: '2025-10-24', time: '2:15 PM' };
    const dt = getAppointmentDateTime(ap);
    expect(dt).not.toBeNull();
    expect(dt.isValid).toBe(true);
    expect(dt.hour).toBe(14);
  });

  test('upcoming vs recent split', () => {
    const now = DateTime.local();
    const past = now.minus({ days: 1 }).toISODate();
    const future = now.plus({ days: 1 }).toISODate();

    const appointments = [
      { _id: '1', date: past, time: '10:00', status: 'Completed' },
      { _id: '2', date: future, time: '09:00', status: 'Confirmed' },
      { _id: '3', date: future, time: '11:00', status: 'Cancelled' }
    ];

    const upcoming = getUpcomingAppointments(appointments);
    const recent = getRecentAppointments(appointments);

    expect(upcoming.find(a => a._id === '2')).toBeTruthy();
    expect(upcoming.find(a => a._id === '3')).toBeFalsy(); // cancelled excluded
    expect(recent.find(a => a._id === '1')).toBeTruthy();
  });
});
