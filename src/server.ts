import express, { Request, Response } from "express";
import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });
const app = express();
const port = 5000;
//parser
app.use(express.json());

// DB
const pool = new Pool({
  connectionString: `${process.env.CONNECTION_STR}`,
});

const initDB = async () => {
  try {
    //users
    await pool.query(`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(15) NOT NULL,
      role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'customer'))
    )`);

    //vehicles
    await pool.query(`CREATE TABLE IF NOT EXISTS vehicles (
      id SERIAL PRIMARY KEY,
      vehicle_name VARCHAR(255) NOT NULL,
      type VARCHAR(20) NOT NULL CHECK (type IN ('car', 'bike', 'van', 'SUV')),
      registration_number VARCHAR(100) UNIQUE NOT NULL,
      daily_rent_price NUMERIC NOT NULL CHECK (daily_rent_price > 0),
      availability_status VARCHAR(20) NOT NULL CHECK (availability_status IN ('available', 'booked'))
    )`);

    //bookings
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

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the vehicle rental server!");
});

//users crud
//create
app.post("/api/v1/users", async (req: Request, res: Response) => {
  let { name, email, password, phone, role } = req.body;
  // console.log(req.body);
  email = req.body.email.toLowerCase();
  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters long.",
    });
  }
  try {
    const result = await pool.query(
      `INSERT INTO users(name, email, password, phone, role) VALUES($1, $2, $3, $4, $5) RETURNING *`,
      [name, email, password, phone, role]
    );

    return res.status(201).json({
      success: true,
      message: "User Inserted Successfully!",
      data: result.rows[0],
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

//get
app.get("/api/v1/users", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`SELECT * FROM users`);

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully!",
      data: result.rows,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

//get single user
app.get("/api/v1/users/:userId", async (req: Request, res: Response) => {
  try {
    // console.log(req.params.userId);
    const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [
      req.params.userId,
    ]);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }
    else{
      res.status(200).json({
        success: true, 
        message: "User fetched successfully!", 
        data: result.rows[0]
      })
    }
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

//update single user
app.put("/api/v1/users/:userId", async (req: Request, res: Response) => 
  {
      const { name, email, password, phone, role } = req.body;
  try {
   
    const result = await pool.query(`UPDATE users SET name=$1, email=$2, password=$3, phone=$4, role=$5 WHERE id = $6 RETURNING *`, [name, email, password, phone, role , req.params.userId])

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }
    else{
      res.status(200).json({
        success: true, 
        message: "User updated successfully!", 
        data: result.rows[0]
      })
    }
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});



//Delete single user
app.delete("/api/v1/users/:userId", async (req: Request, res: Response) => {
  const userId = req.params.userId; 
  try {
    const bookingCheck = await pool.query(`SELECT * FROM bookings WHERE customer_id = $1 AND status ='active' `, [userId]); 

    if(bookingCheck.rows.length > 0){
      return res.status(400).json({
        success: false, 
        message: "This user can not be deleted because it has active bookings."
      })
    }

    const result = await pool.query(`DELETE FROM users WHERE id = $1`, [
      userId,
    ]);

    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }
    else{
      res.status(200).json({
        success: true, 
        message: "User deleted successfully!", 
        data: result.rows
      })
    }
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

//vehicles CRUD
//create
app.post("/api/v1/vehicles", async (req: Request, res: Response) => {
  let { vehicle_name, type, registration_number, daily_rent_price, availability_status } = req.body;
  // console.log(req.body);

  try {
    const result = await pool.query(
      `INSERT INTO vehicles(vehicle_name, type, registration_number, daily_rent_price, availability_status) VALUES($1, $2, $3, $4, $5) RETURNING *`,
      [vehicle_name, type, registration_number, daily_rent_price, availability_status]
    );

    return res.status(201).json({
      success: true,
      message: "Vehicle Inserted Successfully!",
      data: result.rows[0],
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});


//get vehicles
app.get("/api/v1/vehicles", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`SELECT * FROM vehicles`);

    res.status(200).json({
      success: true,
      message: "vehicles retrieved successfully!",
      data: result.rows,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

//get single vehicle
app.get("/api/v1/vehicles/:vehicleId", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`SELECT * FROM vehicles WHERE id = $1`, [
      req.params.vehicleId,
    ]);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "Vehicle not found!",
      });
    }
    else{
      res.status(200).json({
        success: true, 
        message: "Vehicle fetched successfully!", 
        data: result.rows[0]
      })
    }
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

//update single vehicle
app.put("/api/v1/vehicles/:vehicleId", async (req: Request, res: Response) => 
  {
      const { vehicle_name, type, registration_number, daily_rent_price, availability_status } = req.body;

      
  try {
   
    const result = await pool.query(`UPDATE vehicles SET vehicle_name=$1, type=$2, registration_number=$3, daily_rent_price=$4, availability_status=$5 WHERE id=$6 RETURNING *`, [vehicle_name, type, registration_number, daily_rent_price, availability_status , req.params.vehicleId])

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "Vehicle not found!",
      });
    }
    else{
      res.status(200).json({
        success: true, 
        message: "Vehicle updated successfully!", 
        data: result.rows[0]
      })
    }
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

//Delete single vehicle
app.delete("/api/v1/vehicles/:vehicleId", async (req: Request, res: Response) => {
  const vehicleId = req.params.vehicleId; 
  try {
    const bookingCheck = await pool.query(`SELECT * FROM bookings WHERE vehicle_id = $1 AND status ='active' `, [vehicleId]); 

    if(bookingCheck.rows.length > 0){
      return res.status(400).json({
        success: false, 
        message: "This vehicle can not be deleted because it has active bookings."
      })
    }

    const result = await pool.query(`DELETE FROM vehicles WHERE id = $1`, [
      vehicleId,
    ]);

    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "Vehicle not found!",
      });
    }
    else{
      res.status(200).json({
        success: true, 
        message: "Vehicle deleted successfully!", 
        data: result.rows
      })
    }
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});


//Bookings CRUD


//create booking
app.post("/api/v1/bookings", async (req: Request, res: Response) => {
  let {  customer_id, vehicle_id, rent_start_date, rent_end_date, total_price } = req.body;
  // console.log(req.body);

  try {
    const result = await pool.query(
      `INSERT INTO bookings(customer_id, vehicle_id, rent_start_date, rent_end_date, total_price) VALUES($1, $2, $3, $4, $5) RETURNING *`,
      [customer_id, vehicle_id, rent_start_date, rent_end_date, total_price]
    );

    return res.status(201).json({
      success: true,
      message: "Booking Inserted Successfully!",
      data: result.rows[0],
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});










app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
