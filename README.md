# SkyConnect Flight Booking System

SkyConnect is a web-based flight booking system that allows users to search for flights, book tickets, manage bookings, and view transaction history. The system also includes dashboards for both passengers and employees, as well as admin views for managing airlines and employees.

## Features

- **User Authentication:** Signup and login with JWT-based authentication.
- **Flight Search:** Search for flights by location and date.
- **Booking:** Book flights, select seats, and proceed to payment.
- **Manage Bookings:** View, update, or cancel existing bookings.
- **Transaction History:** View past transactions and booking history.
- **Passenger Dashboard:** See profile, upcoming flights, and booking history.
- **Employee Dashboard:** View assigned flights, attendance, and profile.
- **Admin Views:** Manage airlines, employees, and view reports (static pages).
- **Responsive UI:** Built with Tailwind CSS for a modern look.

## Screenshots
![WhatsApp Image 2025-07-23 at 19 41 01_f1131115](https://github.com/user-attachments/assets/a38dc279-1fe5-4962-9648-156eba8ae9bf)
![WhatsApp Image 2025-07-23 at 19 41 02_5866d212](https://github.com/user-attachments/assets/0a1b5ea8-52ee-4bc1-92ae-253d1fe30509)
![WhatsApp Image 2025-07-23 at 19 41 02_5efc5517](https://github.com/user-attachments/assets/0962ec2a-c6d8-4e61-b060-19c827f0822b)
![WhatsApp Image 2025-07-23 at 19 41 02_8a3ac76d](https://github.com/user-attachments/assets/e0a00092-c946-4729-b886-265a519f7c3f)
![WhatsApp Image 2025-07-23 at 19 41 02_a9aa8b34](https://github.com/user-attachments/assets/fa7a73ba-31f6-4fe7-ba23-160c7eef9d1a)
![WhatsApp Image 2025-07-23 at 19 41 02_c285fa06](https://github.com/user-attachments/assets/b4ddaa33-710e-42f4-9072-7bf0e704e221)
![WhatsApp Image 2025-07-23 at 19 41 02_059feab0](https://github.com/user-attachments/assets/0dc05741-d4fa-4fbb-abad-40789cfcda19)
![WhatsApp Image 2025-07-23 at 19 41 03_39d05c42](https://github.com/user-attachments/assets/197351c9-a77b-46e0-ac02-f5b53112346e)
![WhatsApp Image 2025-07-23 at 19 41 03_05e7236c](https://github.com/user-attachments/assets/b9981017-3885-41fd-989f-850a598cfb81)
![WhatsApp Image 2025-07-23 at 19 41 03_19b6063a](https://github.com/user-attachments/assets/41d9a105-94ad-4d08-af8c-bcc3a8bfcc53)
![WhatsApp Image 2025-07-23 at 19 41 03_e2259be3](https://github.com/user-attachments/assets/dfcb83b7-5049-4ba1-8d1b-491c030f75ec)
![WhatsApp Image 2025-07-23 at 19 41 03_1310174b](https://github.com/user-attachments/assets/d08fb108-7cd7-4422-a0ab-69e6725a168c)
![WhatsApp Image 2025-07-23 at 19 41 04_09a6c704](https://github.com/user-attachments/assets/a889e525-8138-4948-88be-95f5a5aab69b)
![WhatsApp Image 2025-07-23 at 19 41 04_100edb14](https://github.com/user-attachments/assets/0ce7e57a-431c-4084-8948-7cf7f72b804f)
![WhatsApp Image 2025-07-23 at 19 41 04_39d101bd](https://github.com/user-attachments/assets/07944b88-eb26-40bf-b65c-bcb95ebd5493)
![WhatsApp Image 2025-07-23 at 19 41 04_68d366c1](https://github.com/user-attachments/assets/8a09f9bf-ea14-417e-b77f-39eb3fb3dd7c)
![WhatsApp Image 2025-07-23 at 19 43 23_086288a4](https://github.com/user-attachments/assets/610d23b4-1a09-4ddb-86b6-b0e0d0c71c06)

## Project Structure

```
.
├── airlines.html
├── booking.html
├── dashboard.html
├── employee_dashboard.html
├── employee_flights.html
├── employee_profile.html
├── flights.html
├── home.html
├── login.html
├── manage_bookings.html
├── server.js
├── transaction.html
```

- **HTML Files:** Frontend pages for users, employees, and admin.
- **server.js:** Node.js Express backend with OracleDB integration.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- [Oracle Database](https://www.oracle.com/database/)
- [npm](https://www.npmjs.com/)

### Installation

1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd SkyConnect
   ```

2. **Install dependencies:**
   ```sh
   npm install express oracledb cors jsonwebtoken
   ```

3. **Configure OracleDB:**
   - Update the `dbConfig` in `server.js` with your OracleDB credentials.

4. **Start the backend server:**
   ```sh
   node server.js
   ```
   The server will run at [http://localhost:5501](http://localhost:5501).

5. **Open the frontend:**
   - Open `home.html` in your browser to start using the application.

## Usage

- **Sign Up / Login:** Use `login.html` to create an account or log in.
- **Search Flights:** Use the search form on `home.html` or `flights.html`.
- **Book Flights:** Click "Book" on a flight to proceed with booking and payment.
- **Manage Bookings:** Use `manage_bookings.html` to view, update, or cancel bookings.
- **Dashboard:** Access `dashboard.html` for passenger info, or `employee_dashboard.html` for employee features.

## Technologies Used

- **Frontend:** HTML, CSS (Tailwind), JavaScript
- **Backend:** Node.js, Express.js
- **Database:** OracleDB
- **Authentication:** JWT

## SQL schema
CREATE TABLE Passenger (
    passenger_id INT PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    email VARCHAR2(100) UNIQUE NOT NULL,
    password VARCHAR2(255) NOT NULL,
    phone VARCHAR2(15) UNIQUE NOT NULL
);

CREATE TABLE Airline (
    airline_id INT PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    headquarters VARCHAR2(255) NOT NULL
);

CREATE TABLE Airport (
    airport_id INT PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    location VARCHAR2(255) NOT NULL
);

CREATE TABLE Admin (
    admin_id INT PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    email VARCHAR2(100) UNIQUE NOT NULL,
    password VARCHAR2(255) NOT NULL
);

CREATE TABLE Flight (
    flight_id INT PRIMARY KEY,
    status VARCHAR2(10) CHECK (status IN ('Scheduled', 'Delayed', 'Cancelled', 'Completed')),
    dep_time TIMESTAMP NOT NULL,
    dep_airport INT NOT NULL,
    airline_id INT NOT NULL,
    FOREIGN KEY (dep_airport) REFERENCES Airport(airport_id),
    FOREIGN KEY (airline_id) REFERENCES Airline(airline_id)
);

CREATE TABLE Flight_Arrival (
    flight_id INT PRIMARY KEY,
    arr_time TIMESTAMP NOT NULL,
    arr_airport INT NOT NULL,
    FOREIGN KEY (flight_id) REFERENCES Flight(flight_id),
    FOREIGN KEY (arr_airport) REFERENCES Airport(airport_id)
);

CREATE TABLE Employee (
    employee_id INT PRIMARY KEY,
    airline_id INT NOT NULL,
    role VARCHAR2(20) CHECK (role IN ('Pilot', 'Crew', 'Technician', 'Manager')),
    name VARCHAR2(100) NOT NULL,
    FOREIGN KEY (airline_id) REFERENCES Airline(airline_id)
);

CREATE TABLE Employee_Admin (
    employee_id INT NOT NULL,
    admin_id INT NOT NULL,
    PRIMARY KEY (employee_id, admin_id),
    FOREIGN KEY (employee_id) REFERENCES Employee(employee_id),
    FOREIGN KEY (admin_id) REFERENCES Admin(admin_id)
);

CREATE TABLE Booking (
    booking_id INT PRIMARY KEY,
    passenger_id INT NOT NULL,
    seat_number VARCHAR2(10) NOT NULL,
    flight_id INT NOT NULL,
    status VARCHAR2(10) CHECK (status IN ('Confirmed', 'Cancelled', 'Pending')),
    FOREIGN KEY (passenger_id) REFERENCES Passenger(passenger_id),
    FOREIGN KEY (flight_id) REFERENCES Flight(flight_id)
);

CREATE TABLE Transaction (
    transaction_id INT PRIMARY KEY,
    booking_id INT NOT NULL,
    base_fare NUMBER(10,2) NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES Booking(booking_id)
);

CREATE TABLE Report (
    report_id INT PRIMARY KEY,
    admin_id INT NOT NULL,
    report_date DATE NOT NULL,
    report_data CLOB NOT NULL,
    report_type VARCHAR2(20) CHECK (report_type IN ('Financial', 'Operational', 'Security', 'Customer Service')),
    FOREIGN KEY (admin_id) REFERENCES Admin(admin_id)
);

CREATE TABLE Assign_Emp (
    assignment_id INT PRIMARY KEY,
    flight_id INT NOT NULL,
    employee_id INT NOT NULL,
    FOREIGN KEY (flight_id) REFERENCES Flight(flight_id),
    FOREIGN KEY (employee_id) REFERENCES Employee(employee_id)
);

## Notes

- This project is for educational/demo purposes. For production, use environment variables for secrets and secure database credentials.
- Some admin and employee pages are static and may require backend integration for full functionality.

## License

MIT License

---

&copy; 2025 SkyConnect. All rights reserved.
