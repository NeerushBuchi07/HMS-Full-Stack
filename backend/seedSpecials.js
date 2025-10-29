const mongoose = require('mongoose');
const Specialization = require('./models/Specialization');
const Department = require('./models/Department');
require('dotenv').config();

const specializations = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'ENT'];
const departments = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'ENT'];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital_management');
    console.log('Connected');

    await Specialization.deleteMany({});
    await Department.deleteMany({});

    for (const s of specializations) await Specialization.create({ name: s });
    for (const d of departments) await Department.create({ name: d });

    console.log('Seeded specializations and departments');
    process.exit(0);
  } catch (err) { console.error(err); process.exit(1); }
};

seed();
