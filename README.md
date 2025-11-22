<div align="center">

# 🏥 Hospital Management System (HMS)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18.2-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v7+-brightgreen.svg)](https://www.mongodb.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

**A comprehensive, modern Hospital Management System built with MERN stack**

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🎯 Overview

The **Hospital Management System (HMS)** is a full-stack web application designed to streamline hospital operations, manage patient records, appointments, billing, and administrative tasks. Built with scalability and user experience in mind, HMS provides separate dashboards for patients, doctors, and administrators.

### 🌟 Why HMS?

- **All-in-One Solution**: Manage appointments, patients, doctors, billing, and departments in one platform
- **Role-Based Access**: Secure authentication with different access levels for admins, doctors, and patients
- **Real-Time Updates**: Live appointment availability and instant notifications
- **Modern UI/UX**: Clean, responsive interface with intuitive navigation
- **Scalable Architecture**: Built with best practices for easy maintenance and scaling

---

## ✨ Features

### 👨‍⚕️ For Patients
- ✅ **User Registration & Authentication** - Secure signup/login with JWT
- 📅 **Appointment Booking** - Real-time slot availability with timezone support
- 💳 **Multiple Payment Options** - Card, UPI, QR Code, Cash, Insurance
- 📊 **Personal Dashboard** - View upcoming/past appointments and medical history
- 🔔 **Notifications** - Get updates on appointment status
- 👤 **Profile Management** - Update personal and medical information

### 👨‍⚕️ For Doctors
- 📋 **Appointment Management** - View and manage patient appointments
- 🕒 **Schedule Management** - Set available time slots and working hours
- 👥 **Patient Records** - Access patient history and medical information
- 📊 **Dashboard Analytics** - Track appointments and patient statistics

### 🔐 For Administrators
- 👥 **Patient Management** - CRUD operations for patient records
- 🩺 **Doctor Management** - Add, edit, and remove doctor profiles
- 🏢 **Department Management** - Organize hospital departments
- 🎓 **Specialization Management** - Manage medical specializations
- 💰 **Billing Overview** - Monitor payments and financial records
- 📈 **System Analytics** - Comprehensive reports and insights
- 🔒 **Access Control** - Manage admin permissions with AllowedAdmin whitelist

---

## 🛠️ Tech Stack

### Frontend
- **React 18.2** - Modern UI library with hooks
- **React Router v6** - Client-side routing
- **Axios** - HTTP client for API requests
- **Luxon** - DateTime manipulation
- **QRCode.react** - QR code generation for payments
- **Font Awesome** - Icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Express Validator** - Request validation
- **CORS** - Cross-origin resource sharing

### DevOps & Deployment
- **Render** - Cloud hosting platform
- **MongoDB Atlas** - Cloud database
- **Git & GitHub** - Version control

---

## 🏗️ Architecture

```
HMS/
├── backend/                 # Node.js/Express backend
│   ├── config/             # Database and environment configs
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Auth middleware
│   ├── models/             # Mongoose schemas
│   │   ├── User.js
│   │   ├── Patient.js
│   │   ├── Doctor.js
│   │   ├── Appointment.js
│   │   ├── Billing.js
│   │   ├── Department.js
│   │   ├── Specialization.js
│   │   ├── Notification.js
│   │   └── AllowedAdmin.js
│   ├── routes/             # API routes
│   ├── scripts/            # Database utilities
│   ├── seedOnce.js         # Database seeding
│   └── server.js           # Entry point
│
├── frontend/               # React frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   │   ├── ui/       # Modal, Toast components
│   │   │   ├── Navbar.js
│   │   │   ├── Footer.js
│   │   │   └── Hero.js
│   │   ├── context/       # React Context (Auth)
│   │   ├── pages/         # Page components
│   │   │   ├── Login.js
│   │   │   ├── PatientSignup.js
│   │   │   ├── PatientDashboard.js
│   │   │   ├── DoctorDashboard.js
│   │   │   ├── Dashboard.js (Admin)
│   │   │   ├── BookAppointment.js
│   │   │   ├── FindDoctor.js
│   │   │   ├── Billing.js
│   │   │   └── ...
│   │   ├── services/      # API service layer
│   │   ├── utils/         # Utility functions
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── render.yaml            # Render deployment config
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **MongoDB** (local or Atlas account)
- **npm** or **yarn**
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/NeerushBuchi07/HMS-Full-Stack.git
   cd HMS-Full-Stack
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Environment Variables

#### Backend (`backend/.env`)
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/HMS

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

#### Frontend (`frontend/.env`)
```env
# API Base URL
REACT_APP_API_URL=http://localhost:5000/api
```

### Database Seeding

The system includes automated seeding with sample data:

```bash
cd backend
npm run seed
```

This creates:
- 2 Admin accounts
- 4 Sample doctors (Cardiology, Neurology, Orthopedics, Pediatrics)
- Medical departments and specializations

**Default Admin Credentials:**
- Email: `admin1@medicare.com`
- Password: `admin123`

### Running the Application

#### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

Access the application at `http://localhost:3000`

#### Production Build

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
# Serve the build folder with your preferred static server
```

---

## 💻 Usage

### For Patients

1. **Register** - Create an account with email, username, and password
2. **Login** - Access your patient dashboard
3. **Book Appointment** - Select doctor, date, and available time slot
4. **Make Payment** - Choose payment method (Card/UPI/QR/Cash/Insurance)
5. **Manage Appointments** - View, cancel, or reschedule appointments
6. **Update Profile** - Keep your information current

### For Doctors

1. **Login** - Use credentials provided by admin
2. **View Appointments** - Check daily schedule
3. **Manage Patients** - Access patient records and history
4. **Update Availability** - Set working hours and available slots

### For Administrators

1. **Login** - Use admin credentials
2. **Manage Resources** - Add/edit doctors, departments, specializations
3. **Monitor System** - View analytics and reports
4. **Handle Billing** - Oversee payment records
5. **User Management** - Approve or remove users

---

## 📡 API Documentation

### Authentication Endpoints

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/availability?email=test@example.com
```

### Patient Endpoints

```http
GET    /api/patients/profile/me
PUT    /api/patients/profile
GET    /api/patients
POST   /api/patients
PUT    /api/patients/:id
DELETE /api/patients/:id
```

### Appointment Endpoints

```http
GET    /api/appointments/my-appointments
GET    /api/appointments/available-slots?doctorId=xxx&date=2025-11-22
POST   /api/appointments
PUT    /api/appointments/:id
DELETE /api/appointments/:id
```

### Doctor Endpoints

```http
GET    /api/doctors
GET    /api/doctors/:id
POST   /api/doctors
PUT    /api/doctors/:id
DELETE /api/doctors/:id
```

### Billing Endpoints

```http
GET    /api/billing
GET    /api/billing/:id
POST   /api/billing
PUT    /api/billing/:id
```

For detailed API documentation with request/response examples, see [API_DOCS.md](./docs/API_DOCS.md).

---

## 🌐 Deployment

### Deploy to Render

This project is configured for easy deployment on Render using `render.yaml`.

1. **Push to GitHub**
   ```bash
   git push origin master
   ```

2. **Connect to Render**
   - Sign up at [render.com](https://render.com)
   - Create new Web Service from GitHub repository
   - Render will auto-detect `render.yaml`

3. **Set Environment Variables**
   - Add `MONGODB_URI`, `JWT_SECRET`, etc. in Render dashboard

4. **Auto-deployment**
   - Every push to `master` triggers automatic deployment

**Live Demo:** [Your Render URL]

### Deploy Frontend Separately

For better performance, deploy frontend to Vercel/Netlify:

```bash
cd frontend
npm run build
# Upload build/ folder to hosting service
```

---

## 📸 Screenshots

<details>
<summary>Click to view screenshots</summary>

### Patient Dashboard
![Patient Dashboard](./docs/screenshots/patient-dashboard.png)

### Appointment Booking
![Book Appointment](./docs/screenshots/book-appointment.png)

### Admin Dashboard
![Admin Dashboard](./docs/screenshots/admin-dashboard.png)

### Doctor Management
![Manage Doctors](./docs/screenshots/manage-doctors.png)

</details>

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and development process.

---

## 🐛 Known Issues & Roadmap

### Known Issues
- [ ] Timezone handling for international deployments
- [ ] File upload for patient medical records

### Roadmap
- [ ] Email notifications for appointments
- [ ] SMS reminders
- [ ] Video consultation integration
- [ ] Medical reports upload/download
- [ ] Prescription management
- [ ] Pharmacy integration
- [ ] Lab test results tracking
- [ ] Multi-language support
- [ ] Mobile app (React Native)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Contact

**Neerush Buchi**

- GitHub: [@NeerushBuchi07](https://github.com/NeerushBuchi07)
- Email: [your-email@example.com](mailto:your-email@example.com)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/your-profile)

**Project Link:** [https://github.com/NeerushBuchi07/HMS-Full-Stack](https://github.com/NeerushBuchi07/HMS-Full-Stack)

---

## 🙏 Acknowledgments

- [React Documentation](https://reactjs.org/)
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Font Awesome Icons](https://fontawesome.com/)
- [Render Hosting](https://render.com/)

---

<div align="center">

**⭐ If you find this project useful, please consider giving it a star! ⭐**

Made with ❤️ by [Neerush Buchi](https://github.com/NeerushBuchi07)

</div>
