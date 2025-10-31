/**
 * Idempotent seeding script.
 *
 * This script will upsert (create or update) the initial Specializations,
 * Departments, AllowedAdmins (+ admin users), and sample Doctors.
 * It avoids destructive deletes and can be safely re-run.
 *
 * Usage:
 *   MONGODB_URI="<your-uri>" node seedOnce.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Specialization = require('./models/Specialization');
const Department = require('./models/Department');
const AllowedAdmin = require('./models/AllowedAdmin');
const User = require('./models/User');
const Doctor = require('./models/Doctor');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital_management';

const specializations = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'ENT'];
const departments = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'ENT'];

const admins = [
  {
    name: 'Super Admin',
    email: 'admin1@medicare.com',
    username: 'admin1',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'Operations Admin',
    email: 'admin2@medicare.com',
    username: 'admin2',
    password: 'admin123',
    role: 'admin'
  }
];

const sampleDoctors = [
  {
    name: 'Dr. Sarah Wilson',
    specialization: 'Cardiology',
    department: 'Cardiology',
    contact: { phone: '(123) 456-7890', email: 'sarah.wilson@medicare.com' },
    availability: { days: ['Monday', 'Wednesday', 'Friday'], startTime: '09:00', endTime: '17:00' },
    qualification: ['MD Cardiology', 'MBBS'],
    experience: 12,
    consultationFee: 150
  },
  {
    name: 'Dr. Michael Chen',
    specialization: 'Neurology',
    department: 'Neurology',
    contact: { phone: '(123) 456-7891', email: 'michael.chen@medicare.com' },
    availability: { days: ['Tuesday', 'Thursday', 'Saturday'], startTime: '10:00', endTime: '18:00' },
    qualification: ['MD Neurology', 'MBBS'],
    experience: 8,
    consultationFee: 120
  },
  {
    name: 'Dr. Emily Rodriguez',
    specialization: 'Orthopedics',
    department: 'Orthopedics',
    contact: { phone: '(123) 456-7892', email: 'emily.rodriguez@medicare.com' },
    availability: { days: ['Monday','Tuesday','Wednesday','Thursday','Friday'], startTime: '08:00', endTime: '16:00' },
    qualification: ['MS Orthopedics','MBBS'],
    experience: 10,
    consultationFee: 130
  },
  {
    name: 'Dr. James Thompson',
    specialization: 'Pediatrics',
    department: 'Pediatrics',
    contact: { phone: '(123) 456-7893', email: 'james.thompson@medicare.com' },
    availability: { days: ['Monday','Wednesday','Friday','Saturday'], startTime: '09:30', endTime: '17:30' },
    qualification: ['MD Pediatrics','MBBS'],
    experience: 15,
    consultationFee: 110
  }
];

async function upsertSpecializations() {
  for (const name of specializations) {
    await Specialization.updateOne({ name }, { $set: { name } }, { upsert: true });
    console.log('Upserted specialization:', name);
  }
}

async function upsertDepartments() {
  for (const name of departments) {
    await Department.updateOne({ name }, { $set: { name } }, { upsert: true });
    console.log('Upserted department:', name);
  }
}

async function upsertAdmins() {
  for (const a of admins) {
    // Upsert AllowedAdmin
    await AllowedAdmin.updateOne({ email: a.email.toLowerCase() }, { $set: { name: a.name } }, { upsert: true });
    console.log('Upserted AllowedAdmin:', a.email);

    // Upsert User (password will be hashed by model pre-save if using create; for update we'll set the password field so pre-save middleware runs only on save())
    const existing = await User.findOne({ email: a.email.toLowerCase() });
    if (existing) {
      existing.username = a.username;
      existing.role = a.role;
      existing.password = a.password; // model should hash on save
      await existing.save();
      console.log('Updated admin user:', a.email);
    } else {
      await User.create({ username: a.username, email: a.email.toLowerCase(), password: a.password, role: a.role });
      console.log('Created admin user:', a.email);
    }
  }
}

async function upsertDoctors() {
  for (const doc of sampleDoctors) {
    const email = (doc.contact && doc.contact.email) || `${doc.name.replace(/\s+/g,'.').toLowerCase()}@example.com`;

    // Ensure a user exists for the doctor
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ username: email.split('@')[0], email, password: 'doctor123', role: 'doctor' });
      console.log('Created doctor user:', email);
    } else {
      if (user.role !== 'doctor') {
        user.role = 'doctor';
        await user.save();
        console.log('Updated user role to doctor for:', email);
      }
    }

    // Upsert Doctor profile by contact.email or name
    const filter = { 'contact.email': email };
    const update = {
      $set: {
        name: doc.name,
        specialization: doc.specialization,
        department: doc.department,
        contact: doc.contact,
        availability: doc.availability,
        qualification: doc.qualification,
        experience: doc.experience,
        consultationFee: doc.consultationFee,
        user: user._id
      }
    };

    const res = await Doctor.findOneAndUpdate(filter, update, { upsert: true, new: true, setDefaultsOnInsert: true });
    if (res) console.log('Upserted doctor profile for:', doc.name);
  }
}

async function main() {
  try {
    console.log('Connecting to', MONGODB_URI);
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    await upsertSpecializations();
    await upsertDepartments();
    await upsertAdmins();
    await upsertDoctors();

    console.log('Seeding (idempotent) completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

main();
