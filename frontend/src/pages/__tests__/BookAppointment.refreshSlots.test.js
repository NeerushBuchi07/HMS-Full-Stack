import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

import BookAppointment from '../BookAppointment';
import api from '../../services/api';

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { _id: 'u1', username: 'testuser' } })
}));

jest.mock('../../services/api');

describe('BookAppointment slot refresh on cancellation', () => {
  beforeEach(() => jest.resetAllMocks());

  test('refreshes slots when appointmentCancelled event is fired for selected doctor/date', async () => {
    api.get.mockImplementation((url) => {
      if (url.startsWith('/appointments/available-slots/')) {
        return Promise.resolve({ data: { data: { availableSlots: [{ time: '10:00', available: true }] } } });
      }
      if (url === '/departments') {
        return Promise.resolve({ data: { data: { departments: [] } } });
      }
      if (url.startsWith('/appointments/doctors/')) {
        return Promise.resolve({ data: { data: { doctors: [{ _id: 'd1', name: 'Doc', specialization: 'Spec', consultationFee: 100, availability: { startTime: '09:00', endTime: '17:00' } }] } } });
      }
      return Promise.resolve({ data: {} });
    });


    render(
      <MemoryRouter>
        <BookAppointment />
      </MemoryRouter>
    );

  // Wait for departments to render and select one
  const deptSelect = await screen.findByLabelText('Medical Department *');
  userEvent.selectOptions(deptSelect, ['General Medicine']);

  // Wait for doctors to load
  await waitFor(() => expect(api.get).toHaveBeenCalledWith(expect.stringContaining('/appointments/doctors/')));

  // Now select the doctor
  const doctorSelect = await screen.findByLabelText('Available Doctors *');
  userEvent.selectOptions(doctorSelect, [doctorSelect.querySelector('option:nth-child(2)')]);

  // Select today's date in the date input
  const dateInput = await screen.findByLabelText('Appointment Date *');
  const today = new Date().toISOString().split('T')[0];
  fireEvent.change(dateInput, { target: { value: today } });

    // Manually dispatch the event for the currently selected doctor/date
    window.dispatchEvent(new CustomEvent('appointmentCancelled', { detail: { doctorId: 'd1', date: today, time: '10:00' } }));

    // Expect fetchAvailableSlots (api.get for available-slots) to be called
    await waitFor(() => expect(api.get).toHaveBeenCalledWith(expect.stringContaining('/appointments/available-slots/')));
  });
});
