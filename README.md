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

## Notes

- This project is for educational/demo purposes. For production, use environment variables for secrets and secure database credentials.
- Some admin and employee pages are static and may require backend integration for full functionality.

## License

MIT License

---

&copy; 2025 SkyConnect. All rights reserved.