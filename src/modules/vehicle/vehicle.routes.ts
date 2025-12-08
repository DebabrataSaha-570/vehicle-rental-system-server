import express from "express"; 
import { vehicleControllers } from "./vehicle.controller";

const router = express.Router()

//create vehicle
router.post('/', vehicleControllers.createVehicle); 

// get vehicle
router.get('/', vehicleControllers.getVehicles); 

//get single vehicle
router.get('/:vehicleId', vehicleControllers.getSingleVehicle); 

//update single vehicle
router.put("/:vehicleId", vehicleControllers.updateSingleVehicle)

// delete single vehicle
router.delete("/:userId", vehicleControllers.deleteSingleVehicle)

export const vehicleRoutes = router;