import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const PatientSignup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    age: '',
    gender: '',
    phone: '',
    bloodGroup: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availability, setAvailability] = useState({
    email: { available: true, status: 'idle', message: '' },
    username: { available: true, status: 'idle', message: '' }
  });
  const [checking, setChecking] = useState(false);
  const availabilityAbortRef = useRef(null);
  
  const { patientSignup } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const email = formData.email.trim();
    const username = formData.username.trim();

    if (!email && !username) {
      setAvailability({
        email: { available: true, status: 'idle', message: '' },
        username: { available: true, status: 'idle', message: '' }
      });
      return;
    }

    if (availabilityAbortRef.current) {
      availabilityAbortRef.current.abort();
    }

    const controller = new AbortController();
    availabilityAbortRef.current = controller;

    const debounce = setTimeout(async () => {
      setChecking(true);
      try {
        const response = await api.get('/auth/availability', {
          params: { email, username },
          signal: controller.signal
        });
        const data = response.data.data;
        setAvailability({
          email: {
            available: data.email.available,
            status: 'checked',
            message: data.email.available ? 'Email available' : 'Email already in use'
          },
          username: {
            available: data.username.available,
            status: 'checked',
            message: data.username.available ? 'Username available' : 'Username already in use'
          }
        });
      } catch (err) {
        if (err.code !== 'ERR_CANCELED') {
          setAvailability(prev => ({
            email: { ...prev.email, status: 'error', message: 'Could not verify email' },
            username: { ...prev.username, status: 'error', message: 'Could not verify username' }
          }));
        }
      } finally {
        setChecking(false);
      }
    }, 400);

    return () => {
      clearTimeout(debounce);
      controller.abort();
    };
  }, [formData.email, formData.username]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (!availability.email.available || !availability.username.available) {
      setError('Please choose a unique email and username before signing up');
      setLoading(false);
      return;
    }

    const { confirmPassword, ...submitData } = formData;

    const result = await patientSignup(submitData);
    
    if (result.success) {
      navigate('/patient-dashboard');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="card">
        <h2>Patient Registration</h2>
        
        {error && (
          <div className="alert alert-danger">
            <i className="fas fa-exclamation-triangle"></i> {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label>Username *</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="form-control"
              required
            />
            {availability.username.status === 'checked' && (
              <small className={availability.username.available ? 'text-success' : 'text-danger'}>
                {availability.username.message}
              </small>
            )}
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-control"
              required
            />
            {checking && <small className="text-muted">Checking availability…</small>}
            {availability.email.status === 'checked' && (
              <small className={availability.email.available ? 'text-success' : 'text-danger'}>
                {availability.email.message}
              </small>
            )}
          </div>

          <div className="form-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label>Age *</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="form-control"
              required
              min="1"
              max="120"
            />
          </div>

          <div className="form-group">
            <label>Gender *</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="form-control"
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Blood Group</label>
            <select
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              className="form-control"
            >
              <option value="">Select Blood Group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <div className="form-group">
            <label>Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="form-control"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-control"
              required
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label>Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="form-footer">
          <p>Already have an account? <Link to="/login">Login here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default PatientSignup;