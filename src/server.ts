import express, { Request, Response } from "express"; 
import {Pool} from "pg"; 
import dotenv from 'dotenv'; 
import path from "path"; 

dotenv.config({path: path.join(process.cwd(), '.env')}); 
const app = express()
const port = 5000; 
//parser
app.use(express.json()); 

// DB 
const pool = new Pool({
    connectionString: `${process.env.CONNECTION_STR}`
})

const initDB = async () => {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(15) NOT NULL,
      role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'customer'))
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS vehicles (
      id SERIAL PRIMARY KEY,
      vehicle_name VARCHAR(255) NOT NULL,
      type VARCHAR(20) NOT NULL CHECK (type IN ('car', 'bike', 'van', 'SUV')),
      registration_number VARCHAR(100) UNIQUE NOT NULL,
      daily_rent_price NUMERIC NOT NULL CHECK (daily_rent_price > 0),
      availability_status VARCHAR(20) NOT NULL CHECK (availability_status IN ('available', 'booked'))
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      customer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      vehicle_id INT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
      rent_start_date DATE NOT NULL,
      rent_end_date DATE NOT NULL,
      total_price NUMERIC NOT NULL CHECK (total_price > 0),
      status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'cancelled', 'returned')),
      CONSTRAINT valid_dates CHECK (rent_end_date > rent_start_date)
    )`);

    console.log("Tables Created Successfully");
  } catch (err) {
    console.error("Database initialization error:", err);
  }
};

initDB(); 

app.get('/', (req : Request, res : Response) => {
  res.send('Welcome to the vehicle rental server!')
})

app.post("/", (req : Request, res : Response) => {
    console.log(req.body);

    res.status(201).json({
        success: true, 
        message: "API is working."
    })
})
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
