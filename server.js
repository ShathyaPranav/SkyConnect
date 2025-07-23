const express = require('express');
const oracledb = require('oracledb');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = 5501;
const SECRET_KEY = 'supersecretkey'; // Use .env in production

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const dbConfig = {
    user: 'system',
    password: 'Password1234',
    connectString: 'Shathya:1521/orcl'
};

async function initializeDB() {
    try {
        await oracledb.createPool(dbConfig);
        console.log("Connected to Oracle Database");
    } catch (err) {
        console.error("Error connecting to Oracle Database: ", err);
    }
}


app.get('/', (req, res) => {
    res.send("Server is running.");
});

// SIGNUP (unchanged)
app.post('/signup', async (req, res) => {
    const { email, username, password, phone } = req.body;

    const checkSql = `SELECT * FROM passenger WHERE email = :email OR name = :username`;
    const insertSql = `
        INSERT INTO passenger (PASSENGER_ID, NAME, EMAIL, PASSWORD, PHONE)
        VALUES (passenger_seq.NEXTVAL, :username, :email, :password, :phone)
    `;

    let connection;
    try {
        connection = await oracledb.getConnection();

        const existing = await connection.execute(checkSql, { email, username }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: "User already exists" });
        }

        await connection.execute(insertSql, { username, email, password, phone }, { autoCommit: true });
        res.status(201).json({ message: "Signup successful" });

    } catch (err) {
        console.error("Error signing up:", err);
        res.status(500).json({ error: "Error signing up" });
    } finally {
        if (connection) await connection.close();
    }
});

// LOGIN (modified to return JWT)
app.post('/login', async (req, res) => {
    const { email, username, password } = req.body;

    const sql = `SELECT * FROM passenger WHERE email = :email AND name = :username AND password = :password`;

    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(sql, { email, username, password }, { outFormat: oracledb.OUT_FORMAT_OBJECT });

        if (result.rows.length > 0) {
            const user = result.rows[0];
            const token = jwt.sign({
                PASSENGER_ID: user.PASSENGER_ID,
                NAME: user.NAME,
                EMAIL: user.EMAIL,
                PHONE: user.PHONE
            }, SECRET_KEY, { expiresIn: '2h' });

            res.status(200).json({ message: "Login successful", token });
        } else {
            res.status(401).json({ error: "Invalid credentials" });
        }

    } catch (err) {
        console.error("Error logging in:", err);
        res.status(500).json({ error: "Error logging in" });
    } finally {
        if (connection) await connection.close();
    }
});

// Middleware to verify JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Token missing' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        
        console.log("Decoded Token:", user); // Log decoded token for debugging
        req.user = user;
        next();
    });
}


// GET USER INFO (needs token)
app.get('/get-user-info', authenticateToken, async (req, res) => {
    const passengerId = req.user.PASSENGER_ID;

    const query = `SELECT NAME, EMAIL, PHONE FROM PASSENGER WHERE PASSENGER_ID = :passengerId`;

    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(query, { passengerId }, { outFormat: oracledb.OUT_FORMAT_OBJECT });

        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).send('User not found');
        }
    } catch (err) {
        console.error("Error fetching user info:", err);
        res.status(500).send('Database error');
    } finally {
        if (connection) await connection.close();
    }
});

// SEARCH FLIGHTS
app.get('/search-flights', async (req, res) => {
    const { from, to, date } = req.query;

    if (!from || !to || !date) {
        return res.status(400).send("Missing query parameters: from, to, or date");
    }

    const sql = `
        SELECT 
            f.FLIGHT_ID,
            TO_CHAR(f.DEP_TIME, 'YYYY-MM-DD HH24:MI:SS') AS DEP_TIME,
            TO_CHAR(fa.ARR_TIME, 'YYYY-MM-DD HH24:MI:SS') AS ARR_TIME,
            dep_airport.LOCATION AS DEPARTURE_LOCATION,
            arr_airport.LOCATION AS ARRIVAL_LOCATION,
            f.STATUS
        FROM 
            flight f
        JOIN 
            flight_arrival fa ON f.FLIGHT_ID = fa.FLIGHT_ID
        JOIN 
            airport dep_airport ON f.DEP_AIRPORT = dep_airport.AIRPORT_ID
        JOIN 
            airport arr_airport ON fa.ARR_AIRPORT = arr_airport.AIRPORT_ID
        WHERE 
            LOWER(dep_airport.LOCATION) = LOWER(:fromLocation)
            AND LOWER(arr_airport.LOCATION) = LOWER(:toLocation)
            AND TRUNC(f.DEP_TIME) = TO_DATE(:flightDate, 'YYYY-MM-DD')
    `;

    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(
            sql,
            {
                fromLocation: from,
                toLocation: to,
                flightDate: date
            },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (result.rows.length === 0) {
            return res.status(404).send("No flights found.");
        }

        // Get the fare for this route and date
        const fare = getFlightFare(from, to, date);

        // Convert fare from USD to INR (example conversion rate: 1 USD = 75 INR)
        const fareInINR = fare * 75;

        // Add the fare to each flight result
        const flightsWithFare = result.rows.map(flight => ({
            ...flight,
            FARE: fareInINR // Add the calculated fare in INR
        }));

        res.json(flightsWithFare);
    } catch (err) {
        console.error("Error searching flights: ", err);
        res.status(500).send("Error searching flights");
    } finally {
        if (connection) {
            await connection.close();
        }
    }
});

// Booking a flight (requires token validation)
app.post('/book-flight', authenticateToken, async (req, res) => {
    const { booking_id, passenger_id, flight_id, seat_number, status } = req.body;

    if (!booking_id || !passenger_id || !flight_id || !seat_number || !status) {
        return res.status(400).json({ error: "Missing booking details" });
    }

    const insertSql = `
        INSERT INTO booking (BOOKING_ID, PASSENGER_ID, FLIGHT_ID, SEAT_NUMBER, STATUS)
        VALUES (:booking_id, :passenger_id, :flight_id, :seat_number, :status)
    `;

    let connection;
    try {
        connection = await oracledb.getConnection();
        await connection.execute(insertSql, {
            booking_id,
            passenger_id,
            flight_id,
            seat_number,
            status
        }, { autoCommit: true });

        res.status(201).json({ success: true, message: "Booking successful" });
    } catch (err) {
        console.error("Error inserting booking:", err); // This is logged in your terminal
        res.status(500).json({ error: "Booking failed: " + err.message });
    } finally {
        if (connection) await connection.close();
    }
});

// Flight Fare Generation (simple in-memory fare generator)
const flightFares = {}; // A simple in-memory store for fares

function getFlightFare(from, to, date) {
    const key = `${from}-${to}-${date}`;
    
    // Check if we already have a fare for this route and date
    if (flightFares[key]) {
        return flightFares[key];
    }

    // If no fare found, generate a random one between 5000 INR to 25000 INR
    const fare = Math.floor(Math.random() * (25000 - 5000 + 1)) + 5000;
    
    // Store the fare for future requests
    flightFares[key] = fare;

    return fare;
}

// CREATE TRANSACTION Endpoint
app.post('/create-transaction', authenticateToken, async (req, res) => {
    const { transaction_id, booking_id, base_fare } = req.body;

    // Validate input data
    if (!transaction_id || !booking_id || !base_fare || isNaN(transaction_id) || isNaN(booking_id) || isNaN(base_fare)) {
        return res.status(400).json({ error: "Invalid transaction details provided." });
    }

    const insertTransactionSql = `
        INSERT INTO transaction (TRANSACTION_ID, BOOKING_ID, BASE_FARE)
        VALUES (:transaction_id, :booking_id, :base_fare)
    `;

    let connection;
    try {
        connection = await oracledb.getConnection();
        await connection.execute(insertTransactionSql, {
            transaction_id,
            booking_id,
            base_fare
        }, { autoCommit: true });

        res.status(201).json({ success: true, message: "Transaction created successfully" });
    } catch (err) {
        console.error("Error inserting transaction:", err);
        res.status(500).json({ error: "Transaction creation failed: " + err.message });
    } finally {
        if (connection) await connection.close();
    }
});

app.get('/upcoming-flights', authenticateToken, async (req, res) => {
    const passengerId = req.user.PASSENGER_ID;
    console.log("passengerId:", passengerId);
  
    const query = `
      SELECT 
        f.FLIGHT_ID AS FLIGHT_ID,
        TO_CHAR(f.DEP_TIME, 'YYYY-MM-DD HH24:MI:SS') AS FLIGHT_DATE,
        dep.LOCATION AS DEPARTURE_LOCATION,
        arr.LOCATION AS ARRIVAL_LOCATION,
        'Confirmed' AS STATUS
      FROM 
        booking b
        JOIN flight f ON b.FLIGHT_ID = f.FLIGHT_ID
        JOIN flight_arrival fa ON f.FLIGHT_ID = fa.FLIGHT_ID
        JOIN airport dep ON f.DEP_AIRPORT = dep.AIRPORT_ID
        JOIN airport arr ON fa.ARR_AIRPORT = arr.AIRPORT_ID
      WHERE 
        b.PASSENGER_ID = :passengerId
        AND f.DEP_TIME >= SYSDATE
        AND b.STATUS = 'Confirmed'
      ORDER BY 
        f.DEP_TIME ASC
    `;
  
    console.log("Executing upcoming flights query:", query);
  
    let connection;
    try {
      connection = await oracledb.getConnection();
      const result = await connection.execute(
        query,
        { passengerId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
  
      console.log("Upcoming flights result rows:", result.rows);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "No upcoming flights found." });
      }
  
      res.json(result.rows);
    } catch (err) {
      console.error("Error fetching upcoming flights:", err);
      res.status(500).json({ error: "Error fetching upcoming flights" });
    } finally {
      if (connection) await connection.close();
    }
  });
  


app.get('/booking-history', authenticateToken, async (req, res) => {
    const passengerId = req.user.PASSENGER_ID;
    console.log("passengerId:", passengerId);  // Log the passengerId being used
  
    const query = `
      SELECT 
        f.FLIGHT_ID AS FLIGHT_ID,
        TO_CHAR(f.DEP_TIME, 'YYYY-MM-DD HH24:MI:SS') AS FLIGHT_DATE,
        dep.LOCATION AS DEPARTURE_LOCATION,
        arr.LOCATION AS ARRIVAL_LOCATION,
        b.STATUS AS BOOKING_STATUS
      FROM 
        booking b
        JOIN flight f ON b.FLIGHT_ID = f.FLIGHT_ID
        JOIN flight_arrival fa ON f.FLIGHT_ID = fa.FLIGHT_ID
        JOIN airport dep ON f.DEP_AIRPORT = dep.AIRPORT_ID
        JOIN airport arr ON fa.ARR_AIRPORT = arr.AIRPORT_ID
      WHERE 
        b.PASSENGER_ID = :passengerId
        AND f.DEP_TIME < SYSDATE
        AND b.STATUS IN ('Confirmed', 'Cancelled')
      ORDER BY 
        f.DEP_TIME DESC
    `;
    
    console.log("Executing query:", query);  // Log the full query
    
    let connection;
    try {
      connection = await oracledb.getConnection();
      const result = await connection.execute(
        query,
        { passengerId },  // Bind the parameter
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      console.log("Booking history result rows:", result.rows);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "No booking history found." });
      }
  
      res.json(result.rows);
    } catch (err) {
      console.error("Error fetching booking history:", err);
      res.status(500).json({ error: "Error fetching booking history" });
    } finally {
      if (connection) await connection.close();
    }
  });

  
// Route to fetch booking details
app.get('/get-booking-details/:bookingID', authenticateToken, async (req, res) => {
    const { bookingID } = req.params;
    const passengerId = req.user.PASSENGER_ID;
    console.log("Received booking ID:", bookingID);
  
    let connection;
    try {
      connection = await oracledb.getConnection();
      const result = await connection.execute(
        `SELECT b.booking_id, f.flight_id, dep.LOCATION AS departure_location, arr.LOCATION AS arrival_location, 
                TO_CHAR(f.DEP_TIME, 'YYYY-MM-DD') AS date_of_travel, t.base_fare
         FROM booking b
         JOIN flight f ON b.flight_id = f.flight_id
         JOIN flight_arrival fa ON f.flight_id = fa.flight_id
         JOIN airport dep ON f.dep_airport = dep.airport_id
         JOIN airport arr ON fa.arr_airport = arr.airport_id
         JOIN transaction t ON b.booking_id = t.booking_id
         WHERE b.booking_id = :bookingID AND b.passenger_id = :passengerId`,
        { bookingID, passengerId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Booking not found" });
      }
  
      res.json({ booking: result.rows[0] });
    } catch (err) {
      console.error("Error fetching booking details:", err);
      res.status(500).json({ error: "Error fetching booking details" });
    } finally {
      if (connection) await connection.close();
    }
  });
  
  
  
  // Route to update the seat number
  app.put('/update-booking', authenticateToken, async (req, res) => {
    const { booking_id, seat_number } = req.body;
    const passengerId = req.user.PASSENGER_ID;
  
    let connection;
    try {
      connection = await oracledb.getConnection();
      
      // Query to update the seat number for the booking
      const result = await connection.execute(
        `UPDATE booking
         SET seat_number = :seat_number
         WHERE booking_id = :booking_id AND passenger_id = :passengerId`,
        { seat_number, booking_id, passengerId },
        { autoCommit: true }
      );
  
      // Check if the booking was updated
      if (result.rowsAffected === 0) {
        return res.status(404).json({ error: "Booking not found or you don't have permission to update it" });
      }
  
      // Return success response
      res.json({ success: true });
    } catch (err) {
      console.error("Error updating booking:", err);
      res.status(500).json({ error: "Error updating booking" });
    } finally {
      if (connection) await connection.close();
    }
  });
  
  

app.listen(PORT, () => {
    initializeDB();
    console.log(`Server is running on http://localhost:${PORT}`);
});
