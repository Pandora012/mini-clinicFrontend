# Mini Clinic Information System - Frontend

React + Vite + Bootstrap 5 frontend for clinic management system.

## Setup

Install dependencies:
```bash
cd frontend
npm install
```

Configure `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

Run development:
```bash
npm run dev
```

Build production:
```bash
npm run build
```

## Structure

```
src/
├── components/       # Reusable components
├── pages/           # Page components
├── layouts/         # Layout components
├── routes/          # Route configuration
├── contexts/        # React contexts
├── hooks/           # Custom hooks
├── services/        # API services
├── utils/           # Utility functions
└── constants/       # Constants
```

## Features

- JWT Authentication
- Role-based access (Admin, Doctor, Registration Staff)
- Patient CRUD
- Doctor/Clinic management
- Registration with auto queue
- Queue management (auto-refresh 15s)
- SOAP examination form
- Medical actions & prescriptions
- Dashboard stats

## Pages

- /login - Authentication
- /dashboard - Statistics
- /patients - Patient management
- /doctors - Doctor management
- /clinics - Clinic management
- /registrations - Patient registration
- /queue - Queue management
- /examinations/:id - SOAP examination

## Tech Stack

- React (Vite)
- React Router DOM
- Axios
- React Hook Form
- Bootstrap 5
- Bootstrap Icons
- React Toastify
- SweetAlert2
- Day.js