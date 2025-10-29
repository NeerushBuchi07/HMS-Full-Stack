const mongoose = require('mongoose');
const Doctor = require('./models/Doctor');
const User = require('./models/User');
require('dotenv').config();

const sampleDoctors = [
  {
    name: 'Dr. Sarah Wilson',
    specialization: 'Cardiology',
    department: 'Cardiology',
    contact: {
      phone: '(123) 456-7890',
      email: 'sarah.wilson@medicare.com'
    },
    availability: {
      days: ['Monday', 'Wednesday', 'Friday'],
      startTime: '09:00',
      endTime: '17:00'
    },
    qualification: ['MD Cardiology', 'MBBS'],
    experience: 12,
    consultationFee: 150
  },
  {
    name: 'Dr. Michael Chen',
    specialization: 'Neurology',
    department: 'Neurology',
    contact: {
      phone: '(123) 456-7891',
      email: 'michael.chen@medicare.com'
    },
    availability: {
      days: ['Tuesday', 'Thursday', 'Saturday'],
      startTime: '10:00',
      endTime: '18:00'
    },
    qualification: ['MD Neurology', 'MBBS'],
    experience: 8,
    consultationFee: 120
  },
  {
    name: 'Dr. Emily Rodriguez',
    specialization: 'Orthopedics',
    department: 'Orthopedics',
    contact: {
      phone: '(123) 456-7892',
      email: 'emily.rodriguez@medicare.com'
    },
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      startTime: '08:00',
      endTime: '16:00'
    },
    qualification: ['MS Orthopedics', 'MBBS'],
    experience: 10,
    consultationFee: 130
  },
  {
    name: 'Dr. James Thompson',
    specialization: 'Pediatrics',
    department: 'Pediatrics',
    contact: {
      phone: '(123) 456-7893',
      email: 'james.thompson@medicare.com'
    },
    availability: {
      days: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
      startTime: '09:30',
      endTime: '17:30'
    },
    qualification: ['MD Pediatrics', 'MBBS'],
    experience: 15,
    consultationFee: 110
  }
];

const seedDoctors = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital_management');
    console.log('Connected to MongoDB');

    // Clear existing doctors
    await Doctor.deleteMany({});
    console.log('Cleared existing doctors');

    // Create doctor users and profiles
    for (const doctorData of sampleDoctors) {
      // Create user account for doctor
      // email may be stored as doctorData.email or doctorData.contact.email in sample data
      const email = doctorData.email || (doctorData.contact && doctorData.contact.email) || `${doctorData.name.replace(/\s+/g, '.').toLowerCase()}@example.com`;
      const username = email.split('@')[0];
      const user = await User.create({
        username,
        email,
        password: 'doctor123', // Default password
        role: 'doctor'
      });

      // Generate doctor ID
      const doctorId = 'DOC' + Date.now().toString().slice(-6) + Math.random().toString(36).substr(2, 3).toUpperCase();

      // Create doctor profile
      await Doctor.create({
        ...doctorData,
        doctorId,
        user: user._id
      });

      console.log(`Created doctor: ${doctorData.name}`);
    }

    console.log('Sample doctors created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding doctors:', error);
    process.exit(1);
  }
};

seedDoctors();