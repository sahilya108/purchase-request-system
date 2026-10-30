# Purchase Request System

## 1. Project Overview
A full-stack Purchase Request Management System that allows
employees to submit purchase requests and managers to review
and approve or reject requests.

## 2. Technologies Used

### Backend
- Java 21
- Spring Boot
- Spring Security
- Spring Data JPA
- MySQL
- JWT Authentication
- REST API

### Frontend
- React
- JavaScript
- HTML
- CSS
- Vite

### Additional Technologies
- Gemini API for AI Assistant
- Email Notifications
- Swagger / OpenAPI
- Docker (containerization)

## 3. Main Features

### Authentication
- Role-based login
- Employee, Manager and Admin roles
- JWT authentication

### Employee
- Create purchase requests
- View personal request history
- Filter requests by status
- Filter requests by date range

### Manager
- View team purchase requests
- Approve or reject requests
- Provide rejection reasons
- Search employee request history by Employee ID
- Filter requests by status and date range

### AI Assistant
- Natural language queries
- View pending, approved and rejected requests
- Filter requests by amount
- Role-based data access

### Additional Features
- Email notification after approval
- API documentation using Swagger
- Docker deployment

## 4. Project Structure

Purchase_Request_System/
├── backend/
│   └── demo/
├── frontend/
├── README.md
├── CLAUDE.md
└── CLAUDE_LOG.md

## 5. Database Configuration

Database: MySQL

Create the database:

CREATE DATABASE purchase_request_db;

Configure your database credentials using environment variables.
Never commit passwords or API keys.

## 6. How to Run the Project

### Backend

cd backend/demo

.\mvnw.cmd spring-boot:run

### Frontend

cd frontend

npm install

npm run dev

## 7. Environment Variables

- DB_PASSWORD
- JWT_SECRET
- MAIL_USERNAME
- MAIL_PASSWORD
- MAIL_FROM
- GEMINI_API_KEY

Configure these locally. Never publish actual values.

## 8. Future Improvements

- Advanced reporting
- Pagination
- Better AI query understanding
- Automated testing
- Production deployment

## 9. Developer

Developed as a full-stack development assignment.