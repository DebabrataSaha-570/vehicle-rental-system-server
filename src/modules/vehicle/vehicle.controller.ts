import { Request, Response } from "express";
import { pool } from "../../config/db";
import { vehicleServices } from "./vehicle.service";

const createVehicle = async (req: Request, res: Response) => {
  let { vehicle_name, type, registration_number, daily_rent_price, availability_status } = req.body;
  // console.log(req.body);

  try {
   

    const result = await vehicleServices.createVehicle(vehicle_name as string, type as string, registration_number as string, daily_rent_price as string, availability_status as string)
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
}


const getVehicles = async (req: Request, res: Response) => {
  try {
    const result = await vehicleServices.getVehicles();

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
}

const getSingleVehicle = async (req: Request, res: Response) => {
    const vehicleId = req.params.vehicleId;
  try {
    const result = await vehicleServices.getSingleVehicle(vehicleId as string)

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
}

const updateSingleVehicle = async (req: Request, res: Response) => 
  {
      const { vehicle_name, type, registration_number, daily_rent_price, availability_status } = req.body;

      
  try {
   
    const result = await vehicleServices.updateSingleVehicle(vehicle_name as string, type as string, registration_number as string, daily_rent_price as string, availability_status as string, req.params.vehicleId as string)
   

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
}


const deleteSingleVehicle = async (req: Request, res: Response) => {
  const vehicleId = req.params.vehicleId; 
  try {
    const bookingCheck = await vehicleServices.deleteSingleVehicle(vehicleId as string);

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
}



export const vehicleControllers = {
    createVehicle, 
    getVehicles, 
    getSingleVehicle, 
    updateSingleVehicle, 
    deleteSingleVehicle
}