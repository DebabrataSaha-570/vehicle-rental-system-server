
import express, { Request, Response } from "express";
import { Pool } from "pg";
import config from "./config";
import initDB, { pool } from "./config/db";
import { userRoutes } from "./modules/user/user.routes";
import { vehicleRoutes } from "./modules/vehicle/vehicle.routes";


const app = express();
const port = config.port;



//parser
app.use(express.json());


app.get("/", (req: Request, res:Response) => {
  res.send("Welcome to the Vehicle Rental System Server!")
})

//initializing db
initDB();


//users CRUD
app.use("/api/v1/users", userRoutes)


//vehicles CRUD
app.use("api/v1/vehicles", vehicleRoutes)



//booking crud




//not found
app.use((req, res) => {
  res.status(404).json({
    success: false, 
    message: "Route not found", 
    path: req.path
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
