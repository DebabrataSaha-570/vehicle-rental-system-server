import { Request, Response } from "express";
import { pool } from "../../config/db";
import { userServices } from "./user.service";

const createUser = async (req: Request, res: Response) => {
  let { name, email, password, phone, role } = req.body;
 
  email = req.body.email.toLowerCase();
  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters long.",
    });
  }
  try {
    const result = await userServices.createUser(name, email, password, phone, role)

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result.rows[0],
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

const getUsers = async (req: Request, res: Response) => {
  try {
    const result = await userServices.getUsers();

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: result.rows,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}


const getSingleUser = async (req: Request, res: Response) => {
  try {
    // console.log(req.params.userId);
    const id = req.params.userId as string; 
    const result = await userServices.getSingleUser(id);

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
}


const updateSingleUser = async (req: Request, res: Response) => 
  {
      const { name, email, password, phone, role } = req.body;
  try {
      const id = req.params.userId as string; 
    const result = await userServices.updateSingleUser(name, email, password, phone, role, id)

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
}

const deleteSingleUser = async (req: Request, res: Response) => {
  const userId = req.params.userId; 
  try {
    const bookingCheck = await userServices.deleteSingleUser(userId as string)
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
}

export const userControllers = {
    createUser,
    getUsers, 
    getSingleUser, 
    updateSingleUser, 
    deleteSingleUser
}