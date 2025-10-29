import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

import PatientDashboard from '../PatientDashboard';
import api from '../../services/api';

// Mock AuthContext
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { _id: 'u1', username: 'testuser' }, logout: jest.fn() })
}));

jest.mock('../../services/api');

describe('PatientDashboard cancel flow', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('cancels appointment and refreshes appointments', async () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const appointments = [
      { _id: 'a1', date: tomorrow, time: '10:00', status: 'Confirmed', doctor: { name: 'Doc' } }
    ];

    api.get.mockImplementation((url) => {
      if (url.includes('/patients/profile/me')) {
        return Promise.resolve({ data: { data: { patient: { fullName: 'P' } } } });
      }
      if (url.includes('/appointments/my-appointments')) {
        return Promise.resolve({ data: { data: { appointments } } });
      }
      return Promise.resolve({ data: {} });
    });

    api.patch.mockResolvedValue({ data: { data: { appointment: { _id: 'a1', status: 'Cancelled', date: appointments[0].date, time: appointments[0].time, doctor: appointments[0].doctor } } } });

    render(
      <MemoryRouter>
        <PatientDashboard />
      </MemoryRouter>
    );

  // Wait for appointment to be displayed (match doctor name with regex)
  await waitFor(() => expect(screen.getByText(/Dr\.\s*Doc/)).toBeInTheDocument());

  // Switch to Appointments tab so cancel button is visible (button role)
  const appointmentsTab = screen.getByRole('button', { name: /Appointments/i });
  userEvent.click(appointmentsTab);

  const cancelBtn = await screen.findByTitle('Cancel Appointment');
    fireEvent.click(cancelBtn);

    // Modal should appear
    expect(screen.getByText('Are you sure you want to cancel this appointment?')).toBeInTheDocument();

    const yesBtn = screen.getByText('Yes, Cancel');
    fireEvent.click(yesBtn);

    await waitFor(() => expect(api.patch).toHaveBeenCalled());
    // After success, appointments should be re-fetched
    await waitFor(() => expect(api.get).toHaveBeenCalledWith('/appointments/my-appointments'));
  });
});
