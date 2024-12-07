# SDE-INTERN-API_IRCTC

This project is an API for the Railway Management System built for the SDE Intern assignment. It provides functionality to manage trains, bookings, and user authentication for admins and regular users. The system is designed using Node.js, MySQL, and implements role-based access control (RBAC) to secure the endpoints.

## Features
### Admin API:

Register new admins.
Add, update, and manage trains.
View and manage all bookings.

### User API:

View available seats based on source and destination.
Book seats on trains.
View specific booking details.

## Authentication:

### Admin endpoints are protected with an API key.
### User endpoints are protected with JWT tokens for authentication.


## Tech Stack
### Backend: Node.js, Express.js
### Database: MySQL
### Authentication: JWT for user login, API Key for admin actions
### Other: Nodemailer (for sending OTPs)


## Installation
### Clone the repository:

git clone https://github.com/amareshotta01/SDE-INTERN-API_IRCTC.git

### Install dependencies:

npm install

### Set up your MySQL database and import the required tables for admins, users, trains, and bookings.
####  * All the tables are given in the google drive link here. You just need to create a MySQL Database named irctc and import these tables into it and use it.

### Set your environment variables in a .env file:

DB_HOST=your_database_host

DB_USER=your_database_user

DB_PASSWORD=your_database_password

DB_NAME=your_database_name

JWT_SECRET_KEY=your_jwt_secret

ADMIN_API_KEY=your_admin_api_key


## Start the server:

nodemon server.mjs 

##### FOR USING THE ADMIN_API_KEY, FIRST OF ALL GENERATE IT BY UN COMMENTING 2 LINES OF CODE (LINE 32 & 33) IN SERVER.MJS FILE AND COPY THE ADMIN_API_KEY AND SET IN THE .ENV FILE AND THEN COMMENT IT AGAIN AND START THE TESTING/ CHECKING OF THE API.

## Endpoints
### Admin Endpoints

POST /admin/register: Register a new admin.
POST /admin/train: Add a new train.
GET /admin/bookings: View all bookings.

### User Endpoints

POST /user/login: User login (returns JWT token).
GET /user/seats: Get available trains based on source and destination.
POST /user/book: Book seats on a train.
GET /user/booking/:bookingId: Get specific booking details.

### Security
Admin endpoints are protected with a secret API key.
User actions are authenticated using JWT tokens.
