import React from 'react';
import { Link } from 'react-router-dom';

const servicesList = [
  { title: 'Cardiology', desc: 'Advanced cardiac care with state-of-the-art diagnostic equipment.', icon: 'fas fa-heartbeat' },
  { title: 'Orthopedics', desc: 'Specialized care for bones, joints, and musculoskeletal system.', icon: 'fas fa-bone' },
  { title: 'Neurology', desc: 'Comprehensive neurological care for brain and nervous system disorders.', icon: 'fas fa-brain' },
  { title: 'Pulmonology', desc: 'Diagnosis and treatment of respiratory system diseases.', icon: 'fas fa-lungs' },
  { title: 'Gastroenterology', desc: 'Specialized care for digestive system disorders.', icon: 'fas fa-stomach' },
  { title: 'Allergy & Immunology', desc: 'Treatment of allergies and immune system disorders.', icon: 'fas fa-allergies' },
  { title: 'Emergency Medicine', desc: '24/7 emergency care with trauma specialists.', icon: 'fas fa-ambulance' },
  { title: 'Critical Care', desc: 'Intensive care for critically ill patients.', icon: 'fas fa-procedures' },
  { title: 'General Surgery', desc: 'Comprehensive surgical services for various conditions.', icon: 'fas fa-scalpel' },
  { title: 'Neurosurgery', desc: 'Surgical treatment for brain and nervous system disorders.', icon: 'fas fa-user-nurse' },
  { title: 'Radiology', desc: 'Advanced imaging services including MRI, CT scans, and X-rays.', icon: 'fas fa-x-ray' },
  { title: 'Pathology', desc: 'Comprehensive laboratory testing and diagnostics.', icon: 'fas fa-vials' },
  { title: 'Pediatrics', desc: 'Specialized healthcare for infants, children, and adolescents.', icon: 'fas fa-baby' },
  { title: 'Obstetrics & Gynecology', desc: 'Comprehensive women\'s health services.', icon: 'fas fa-female' },
  { title: 'Ophthalmology', desc: 'Eye care and vision correction services.', icon: 'fas fa-eye' },
  { title: 'ENT', desc: 'Ear, nose, and throat specialty care.', icon: 'fas fa-head-side-mask' },
  { title: 'Pharmacy', desc: 'In-patient and outpatient pharmacy services.', icon: 'fas fa-pills' },
  { title: 'Rehabilitation', desc: 'Physical, occupational, and speech therapy services.', icon: 'fas fa-running' }
];

const Services = () => {
  return (
    <div className="container">
      <div className="services-hero card text-center">
        <h2>All Medical Services</h2>
        <p className="muted">Explore our comprehensive healthcare services</p>
      </div>

      <div className="services-grid">
        {servicesList.map((s) => (
          <div key={s.title} className="service-card">
            <div className="service-icon"><i className={s.icon}></i></div>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Link to="/" className="btn btn-outline">Back to Home</Link>
      </div>
    </div>
  );
};

export default Services;
