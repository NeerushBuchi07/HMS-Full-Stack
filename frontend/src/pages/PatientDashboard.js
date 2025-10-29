import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  getUpcomingAppointments as getUpcomingFromUtils,
  getRecentAppointments as getRecentFromUtils
} from '../utils/appointmentDateUtils';
import Modal from '../components/ui/Modal';
import Toast from '../components/ui/Toast';

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [cancelingAppointmentId, setCancelingAppointmentId] = useState(null);
  const [toast, setToast] = useState(null);
  // Profile edit state
  const [editMode, setEditMode] = useState(false);
  const [formState, setFormState] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchPatientData();
    fetchAppointments();
  }, [user, navigate]);

  const fetchPatientData = async () => {
    try {
      const response = await api.get('/patients/profile/me');
      setPatient(response.data.data.patient);
    } catch (error) {
      console.error('Error fetching patient data:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments/my-appointments');
      setAppointments(response.data.data.appointments);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper to derive safe display values for appointment/bill fields
  const getDisplayValues = (appointment = {}, billData = {}) => {
    const docName = appointment?.doctor?.name || billData?.doctor?.name || 'Doctor';
    const deptDisplay = appointment?.department || billData?.department || '—';

    let apptDateDisplay = '—';
    if (appointment?.date) {
      const d = new Date(appointment.date);
      if (!isNaN(d.getTime())) apptDateDisplay = formatDate(appointment.date);
    } else if (billData?.createdAt) {
      const bd = new Date(billData.createdAt);
      if (!isNaN(bd.getTime())) apptDateDisplay = bd.toLocaleDateString();
    }

    const purposeDisplay = appointment?.purpose || 'Consultation';
    return { docName, deptDisplay, apptDateDisplay, purposeDisplay };
  };

  // Create a Date object that represents the appointment's scheduled datetime
  const getAppointmentDateTime = (appointment) => {
    // appointment.date is usually an ISO date string (date-only or with time)
    // appointment.time is stored as a string (could be "HH:MM" or include AM/PM)
    try {
      const datePart = (new Date(appointment.date)).toISOString().split('T')[0];

      // Try to construct an ISO-like datetime first (handles "HH:MM" or "HH:MM:SS")
      let dt = new Date(`${datePart}T${appointment.time}`);
      if (!isNaN(dt.getTime())) return dt;

      // Fallback: try combining with a space (handles formats like "10:30 AM")
      dt = new Date(`${datePart} ${appointment.time}`);
      if (!isNaN(dt.getTime())) return dt;

      // Final fallback: use the date only (midnight)
      return new Date(appointment.date);
    } catch (e) {
      return new Date(appointment.date);
    }
  };

  const getUpcomingAppointments = () => {
    const now = new Date();
    return appointments
      .map(apt => ({ ...apt, _appointmentDateTime: getAppointmentDateTime(apt) }))
      .filter(apt => apt._appointmentDateTime > now && apt.status !== 'Cancelled')
      .sort((a, b) => a._appointmentDateTime - b._appointmentDateTime)
      .slice(0, 3);
  };

  const getRecentAppointments = (limit = 5) => {
    const now = new Date();
    return appointments
      .map(apt => ({ ...apt, _appointmentDateTime: getAppointmentDateTime(apt) }))
      .filter(apt => apt._appointmentDateTime <= now)
      .sort((a, b) => b._appointmentDateTime - a._appointmentDateTime)
      .slice(0, limit);
  };

  // Cancel appointment (patient action) — sets status to 'Cancelled'
  const handleCancelAppointment = async (appointmentId) => {
    // Open confirm modal
    setCancelingAppointmentId(appointmentId);
    setShowCancelModal(true);
  };

  // PROFILE: start editing
  const startEditProfile = () => {
    if (!patient) return;
    // Deep clone patient to form state
    setFormState(JSON.parse(JSON.stringify(patient)));
    setAvatarPreview(null);
    setEditMode(true);
  };

  const cancelEditProfile = () => {
    setFormState(null);
    setAvatarPreview(null);
    setEditMode(false);
  };

  const handleProfileInput = (path, value) => {
    setFormState(prev => {
      const next = { ...(prev || {}) };
      // support nested paths like 'contact.phone' or 'address.city'
      if (path.includes('.')) {
        const parts = path.split('.');
        let cur = next;
        for (let i = 0; i < parts.length - 1; i++) {
          if (!cur[parts[i]]) cur[parts[i]] = {};
          cur = cur[parts[i]];
        }
        cur[parts[parts.length - 1]] = value;
      } else {
        next[path] = value;
      }
      return next;
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    // preview only — backend does not appear to accept avatars yet
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleCopyPatientId = async () => {
    if (!patient?.patientId) return;
    try {
      await navigator.clipboard.writeText(patient.patientId);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (e) {
      console.warn('Copy failed', e);
    }
  };

  const handlePrintProfile = () => {
    window.print();
  };

  const saveProfile = async () => {
    if (!formState || !patient) return;
    // basic client-side validation
    if (!formState.fullName || !formState.age || !formState.contact?.phone || !formState.contact?.email) {
      setToast({ message: 'Please fill required fields: name, age, phone, email', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    setSavingProfile(true);
    try {
      const payload = { ...formState };
      // Remove read-only/system fields
      delete payload._id;
      delete payload.user;
      delete payload.patientId;

      const response = await api.patch(`/patients/${patient._id}`, payload);
      const updated = response.data.data.patient;
      setPatient(updated);
      setToast({ message: 'Profile updated successfully', type: 'success' });
      setTimeout(() => setToast(null), 3000);
      setEditMode(false);
      setFormState(null);
      setAvatarPreview(null);
    } catch (error) {
      console.error('Error saving profile:', error);
      setToast({ message: error.response?.data?.message || 'Failed to update profile', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSavingProfile(false);
    }
  };

  const confirmCancel = async () => {
    setShowCancelModal(false);
    const appointmentId = cancelingAppointmentId;
    if (!appointmentId) return;

    setCanceling(true);
    try {
      const response = await api.patch(`/appointments/${appointmentId}`, { status: 'Cancelled' });
      const updated = response.data.data.appointment;
      // Update local state to reflect cancellation
      setAppointments(prev => prev.map(a => a._id === updated._id ? { ...a, status: updated.status } : a));
      // Re-fetch to ensure consistency
      await fetchAppointments();

      // Dispatch event to refresh slots
      try {
        const doctorId = updated.doctor && (updated.doctor._id || updated.doctor);
        const dateISO = updated.date ? (new Date(updated.date)).toISOString().split('T')[0] : null;
        window.dispatchEvent(new CustomEvent('appointmentCancelled', { detail: { doctorId, date: dateISO, time: updated.time } }));
      } catch (e) {
        // ignore
      }

      setToast({ message: 'Appointment cancelled successfully.', type: 'success' });
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      setToast({ message: 'Failed to cancel appointment. Please try again.', type: 'error' });
    } finally {
      setCanceling(false);
      setCancelingAppointmentId(null);
      // clear toast after a short delay
      setTimeout(() => setToast(null), 3000);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'status-badge confirmed';
      case 'Pending':
        return 'status-badge pending';
      case 'Completed':
        return 'status-badge completed';
      case 'Cancelled':
        return 'status-badge cancelled';
      default:
        return 'status-badge pending';
    }
  };

  // Lists used in rendering (cached per render)
  const upcomingListForRender = getUpcomingFromUtils(appointments, { limit: 10 });
  const recentListForRender = getRecentFromUtils(appointments, { limit: 50 });

  if (loading) {
    return (
      <div className="container">
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin fa-2x"></i>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div>
          <h1>Welcome, <span>{patient?.fullName || user?.username}</span></h1>
          <p>Here's your health dashboard and upcoming appointments</p>
        </div>
        <div className="dashboard-actions">
          <button 
            className="btn"
            onClick={() => navigate('/book-appointment')}
          >
            <i className="fas fa-calendar-plus"></i> Book Appointment
          </button>
          <button 
            className="btn btn-outline ml-2"
            onClick={() => navigate('/billing')}
          >
            <i className="fas fa-file-invoice-dollar"></i> View Bills
          </button>
        </div>
      </div>

      {/* Dashboard Navigation Tabs */}
      <div className="dashboard-sections">
        <button 
          className={`section-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <i className="fas fa-home"></i> Overview
        </button>
        <button 
          className={`section-btn ${activeTab === 'appointments' ? 'active' : ''}`}
          onClick={() => setActiveTab('appointments')}
        >
          <i className="fas fa-calendar-alt"></i> Appointments
        </button>
        <button 
          className={`section-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <i className="fas fa-user"></i> Profile
        </button>
      </div>

      {/* Dashboard Content */}
      <div className="dashboard-content">
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="dashboard-section active">
            <div className="dashboard-grid">
              
              {/* Upcoming Appointments Card */}
              <div className="dashboard-card">
                <h2><i className="fas fa-calendar-check"></i> Upcoming Appointments</h2>
                <div className="appointment-list">
                  {getUpcomingAppointments().length > 0 ? (
                    getUpcomingAppointments().map(appointment => {
                      const { docName, deptDisplay, apptDateDisplay, purposeDisplay } = getDisplayValues(appointment);
                      return (
                        <div key={appointment._id} className="appointment-item">
                        <div className="appointment-time">
                          {apptDateDisplay}
                          <br />
                          <small>{appointment.time}</small>
                        </div>
                        <div className="appointment-details">
                          {(() => {
                            const { docName, deptDisplay, apptDateDisplay, purposeDisplay } = getDisplayValues(appointment);
                            return (
                              <>
                                <h3>Dr. {docName}</h3>
                                <p>{appointment.doctor?.specialization || deptDisplay}</p>
                                <p className="appointment-purpose">{purposeDisplay}</p>
                              </>
                            );
                          })()}
                          <span className={getStatusBadgeClass(appointment.status)}>
                            {appointment.status}
                          </span>
                        </div>
                        <div className="appointment-actions">
                            <div className="action-stack">
                              <button className="btn btn-outline btn-sm">
                                View Details
                              </button>
                              {appointment.status !== 'Cancelled' && (
                                <button
                                  className={`btn btn-danger btn-sm mt-2`} 
                                  onClick={() => handleCancelAppointment(appointment._id)}
                                  disabled={canceling && cancelingAppointmentId === appointment._id}
                                  title={canceling && cancelingAppointmentId === appointment._id ? 'Cancelling...' : 'Cancel Appointment'}
                                >
                                  {canceling && cancelingAppointmentId === appointment._id ? 'Cancelling...' : 'Cancel'}
                                </button>
                              )}
                            </div>
                        </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="empty-appointments">
                      <i className="fas fa-calendar-times"></i>
                      <p>No upcoming appointments</p>
                      <button 
                        className="btn btn-sm"
                        onClick={() => navigate('/book-appointment')}
                      >
                        Book Your First Appointment
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Patient Information Card */}
              <div className="dashboard-card">
                <h2><i className="fas fa-user-injured"></i> Patient Information</h2>
                {patient && (
                  <div className="patient-info-details">
                    <div className="info-row">
                      <span className="info-label">Patient ID:</span>
                      <span className="info-value">{patient.patientId}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Full Name:</span>
                      <span className="info-value">{patient.fullName}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Age:</span>
                      <span className="info-value">{patient.age} years</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Gender:</span>
                      <span className="info-value">{patient.gender}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Blood Group:</span>
                      <span className="info-value">{patient.bloodGroup || 'Not specified'}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Phone:</span>
                      <span className="info-value">{patient.contact?.phone}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Email:</span>
                      <span className="info-value">{patient.contact?.email}</span>
                    </div>
                    {patient.address && (
                      <div className="info-row">
                        <span className="info-label">Address:</span>
                        <span className="info-value">
                          {patient.address.street}, {patient.address.city}, {patient.address.state} {patient.address.zipCode}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                <button 
                  className="btn btn-outline mt-3"
                  onClick={() => setActiveTab('profile')}
                >
                  <i className="fas fa-edit"></i> Update Profile
                </button>
              </div>

              {/* Quick Actions Card */}
              <div className="dashboard-card">
                <h2><i className="fas fa-bolt"></i> Quick Actions</h2>
                <div className="quick-actions-grid">
                  <button 
                    className="quick-action-btn"
                    onClick={() => navigate('/book-appointment')}
                  >
                    <i className="fas fa-calendar-plus"></i>
                    <span>Book Appointment</span>
                  </button>
                  <button 
                    className="quick-action-btn"
                    onClick={() => navigate('/billing')}
                  >
                    <i className="fas fa-file-invoice"></i>
                    <span>View Bills</span>
                  </button>
                  <button 
                    className="quick-action-btn"
                    onClick={() => setActiveTab('profile')}
                  >
                    <i className="fas fa-user-edit"></i>
                    <span>Update Profile</span>
                  </button>
                  <button 
                    className="quick-action-btn"
                    onClick={() => window.print()}
                  >
                    <i className="fas fa-print"></i>
                    <span>Print Records</span>
                  </button>
                </div>
              </div>

              {/* Recent Activity Card */}
              <div className="dashboard-card">
                <h2><i className="fas fa-history"></i> Recent Activity</h2>
                <div className="activity-list">
                  {getRecentFromUtils(appointments).length > 0 ? (
                    getRecentFromUtils(appointments).map(appointment => (
                      <div key={appointment._id} className="activity-item">
                        <div className="activity-icon">
                          <i className="fas fa-calendar"></i>
                        </div>
                        <div className="activity-content">
                          {(() => {
                            const { docName, deptDisplay, apptDateDisplay, purposeDisplay } = getDisplayValues(appointment);
                            return (
                              <>
                                <p>
                                  <strong>{purposeDisplay}</strong> with Dr. {docName}
                                </p>
                                <small>
                                  {apptDateDisplay} at {appointment.time} • 
                                  <span className={getStatusBadgeClass(appointment.status)}>
                                    {appointment.status}
                                  </span>
                                </small>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-activity">
                      <i className="fas fa-clock"></i>
                      <p>No recent activity</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="dashboard-section active">
            <div className="section-header">
              <h2>My Appointments</h2>
              <button 
                className="btn"
                onClick={() => navigate('/book-appointment')}
              >
                <i className="fas fa-plus"></i> New Appointment
              </button>
            </div>
            
            {appointments.length > 0 ? (
              <div className="appointments-table">
                <h3>Upcoming</h3>
                <div className="table-header">
                  <div>Date & Time</div>
                  <div>Doctor</div>
                  <div>Purpose</div>
                  <div>Status</div>
                  <div>Actions</div>
                </div>
                {upcomingListForRender.length > 0 ? (
                  upcomingListForRender.map(appointment => {
                    const { docName, deptDisplay, apptDateDisplay, purposeDisplay } = getDisplayValues(appointment);
                    return (
                    <div key={appointment._id} className="table-row">
                    <div>
                      <strong>{apptDateDisplay}</strong>
                      <br />
                      <small>{appointment.time}</small>
                    </div>
                    <div>
                      <>
                        <strong>Dr. {docName}</strong>
                        <br />
                        <small>{appointment.doctor?.specialization || deptDisplay}</small>
                      </>
                    </div>
                    <div>{purposeDisplay || appointment.purpose}</div>
                    <div>
                      <span className={getStatusBadgeClass(appointment.status)}>
                        {appointment.status}
                      </span>
                    </div>
                    <div>
                      <button className="btn-icon" title="View Details">
                        <i className="fas fa-eye"></i>
                      </button>
                      {appointment.status !== 'Cancelled' && (
                        <button
                          className="btn-icon danger"
                          title={canceling && cancelingAppointmentId === appointment._id ? 'Cancelling...' : 'Cancel Appointment'}
                          onClick={() => handleCancelAppointment(appointment._id)}
                          disabled={canceling && cancelingAppointmentId === appointment._id}
                        >
                          <i className="fas fa-times" aria-hidden="true"></i>
                          <span className="sr-only">{canceling && cancelingAppointmentId === appointment._id ? 'Cancelling' : 'Cancel'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ); })) : (
                  <div className="empty-appointments small">
                    <i className="fas fa-calendar-times fa-2x"></i>
                    <h4>No upcoming appointments</h4>
                    <p>You don't have any upcoming appointments scheduled.</p>
                    <button className="btn btn-sm" onClick={() => navigate('/book-appointment')}>Book Appointment</button>
                  </div>
                )}

                <h3>Past / Recent</h3>
                <div className="table-header">
                  <div>Date & Time</div>
                  <div>Doctor</div>
                  <div>Purpose</div>
                  <div>Status</div>
                  <div>Actions</div>
                </div>
                {recentListForRender.map(appointment => {
                  const { docName, deptDisplay, apptDateDisplay, purposeDisplay } = getDisplayValues(appointment);
                  return (
                  <div key={appointment._id} className="table-row">
                    <div>
                      <strong>{apptDateDisplay}</strong>
                      <br />
                      <small>{appointment.time}</small>
                    </div>
                    <div>
                      <strong>Dr. {docName}</strong>
                      <br />
                      <small>{appointment.doctor?.specialization || deptDisplay}</small>
                    </div>
                    <div>{purposeDisplay || appointment.purpose}</div>
                    <div>
                      <span className={getStatusBadgeClass(appointment.status)}>
                        {appointment.status}
                      </span>
                    </div>
                    <div>
                      <button className="btn-icon" title="View Details">
                        <i className="fas fa-eye"></i>
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <i className="fas fa-calendar-times fa-3x"></i>
                <h3>No Appointments Yet</h3>
                <p>You haven't booked any appointments yet.</p>
                <button 
                  className="btn"
                  onClick={() => navigate('/book-appointment')}
                >
                  <i className="fas fa-calendar-plus"></i> Book Your First Appointment
                </button>
              </div>
            )}

            {/* (Modal and Toast moved to global area below) */}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="dashboard-section active">
              <div className="section-header">
                <h2>My Profile</h2>
                {!editMode ? (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-outline" onClick={startEditProfile}>
                      <i className="fas fa-edit"></i> Edit Profile
                    </button>
                    <button className="btn" onClick={handleCopyPatientId} title="Copy Patient ID">
                      <i className="fas fa-copy"></i>
                    </button>
                    <button className="btn btn-outline" onClick={handlePrintProfile} title="Print Profile">
                      <i className="fas fa-print"></i>
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn" onClick={saveProfile} disabled={savingProfile}>
                      {savingProfile ? 'Saving...' : 'Save'}
                    </button>
                    <button className="btn btn-outline" onClick={cancelEditProfile} disabled={savingProfile}>
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {patient && (
                <div className="profile-card">
                  <div className="profile-header">
                    <div className="profile-avatar">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar preview" style={{ width: 56, height: 56, borderRadius: '50%' }} />
                      ) : (
                        <i className="fas fa-user fa-2x"></i>
                      )}
                    </div>
                    <div className="profile-info">
                      <h3>{patient.fullName}</h3>
                      <p>Patient ID: {patient.patientId} {copySuccess && <span style={{ color: 'green', marginLeft: 8 }}>Copied</span>}</p>
                      <p>Member since {new Date(patient.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="profile-details">
                    {/* Edit form */}
                    {editMode && formState ? (
                      <div className="profile-edit-form">
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                          <div>
                            <label className="sr-only">Upload avatar (preview only)</label>
                            <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" />
                          </div>
                          <div>
                            <strong>{formState.fullName}</strong>
                            <div style={{ fontSize: 12 }}>{formState.patientId}</div>
                          </div>
                        </div>

                        <div className="detail-section">
                          <h4>Personal Information</h4>
                          <div className="details-grid">
                            <div className="detail-item">
                              <label>Full Name</label>
                              <input value={formState.fullName || ''} onChange={e => handleProfileInput('fullName', e.target.value)} />
                            </div>
                            <div className="detail-item">
                              <label>Age</label>
                              <input type="number" value={formState.age || ''} onChange={e => handleProfileInput('age', e.target.value)} />
                            </div>
                            <div className="detail-item">
                              <label>Gender</label>
                              <select value={formState.gender || ''} onChange={e => handleProfileInput('gender', e.target.value)}>
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                            <div className="detail-item">
                              <label>Blood Group</label>
                              <input value={formState.bloodGroup || ''} onChange={e => handleProfileInput('bloodGroup', e.target.value)} />
                            </div>
                          </div>
                        </div>

                        <div className="detail-section">
                          <h4>Contact Information</h4>
                          <div className="details-grid">
                            <div className="detail-item">
                              <label>Email</label>
                              <input value={formState.contact?.email || ''} onChange={e => handleProfileInput('contact.email', e.target.value)} />
                            </div>
                            <div className="detail-item">
                              <label>Phone</label>
                              <input value={formState.contact?.phone || ''} onChange={e => handleProfileInput('contact.phone', e.target.value)} />
                            </div>
                            <div className="detail-item">
                              <label>Address</label>
                              <input value={formState.address?.street || ''} onChange={e => handleProfileInput('address.street', e.target.value)} />
                            </div>
                            <div className="detail-item">
                              <label>City</label>
                              <input value={formState.address?.city || ''} onChange={e => handleProfileInput('address.city', e.target.value)} />
                            </div>
                            <div className="detail-item">
                              <label>State</label>
                              <input value={formState.address?.state || ''} onChange={e => handleProfileInput('address.state', e.target.value)} />
                            </div>
                            <div className="detail-item">
                              <label>ZIP Code</label>
                              <input value={formState.address?.zipCode || ''} onChange={e => handleProfileInput('address.zipCode', e.target.value)} />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Read-only profile */
                      <>
                        <div className="detail-section">
                          <h4>Personal Information</h4>
                          <div className="details-grid">
                            <div className="detail-item">
                              <label>Full Name</label>
                              <p>{patient.fullName}</p>
                            </div>
                            <div className="detail-item">
                              <label>Age</label>
                              <p>{patient.age} years</p>
                            </div>
                            <div className="detail-item">
                              <label>Gender</label>
                              <p>{patient.gender}</p>
                            </div>
                            <div className="detail-item">
                              <label>Blood Group</label>
                              <p>{patient.bloodGroup || 'Not specified'}</p>
                            </div>
                          </div>
                        </div>

                        <div className="detail-section">
                          <h4>Contact Information</h4>
                          <div className="details-grid">
                            <div className="detail-item">
                              <label>Email</label>
                              <p>{patient.contact?.email}</p>
                            </div>
                            <div className="detail-item">
                              <label>Phone</label>
                              <p>{patient.contact?.phone}</p>
                            </div>
                            {patient.address && (
                              <>
                                <div className="detail-item">
                                  <label>Address</label>
                                  <p>{patient.address.street}</p>
                                </div>
                                <div className="detail-item">
                                  <label>City</label>
                                  <p>{patient.address.city}</p>
                                </div>
                                <div className="detail-item">
                                  <label>State</label>
                                  <p>{patient.address.state}</p>
                                </div>
                                <div className="detail-item">
                                  <label>ZIP Code</label>
                                  <p>{patient.address.zipCode}</p>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="detail-section">
                          <h4>Medical Information</h4>
                          <div className="details-grid">
                            <div className="detail-item">
                              <label>Status</label>
                              <p>{patient.status}</p>
                            </div>
                            <div className="detail-item">
                              <label>Last Updated</label>
                              <p>{new Date(patient.updatedAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
          </div>
        )}

      </div>
      {/* Global Modal and Toast so they work from any tab */}
      <Modal isOpen={showCancelModal} title="Cancel Appointment" onClose={() => setShowCancelModal(false)}>
        <p>Are you sure you want to cancel this appointment?</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button className="btn btn-outline" onClick={() => setShowCancelModal(false)}>No</button>
          <button className="btn btn-danger" onClick={confirmCancel} disabled={canceling}>
            {canceling ? 'Cancelling...' : 'Yes, Cancel'}
          </button>
        </div>
      </Modal>

      {/* Toast message */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default PatientDashboard;