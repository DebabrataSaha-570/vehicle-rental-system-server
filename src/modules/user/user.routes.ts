import express from "express"; 
import { userControllers } from "./user.controller";

const router = express.Router(); 

//create user
router.post("/", userControllers.createUser); 

//get users

router.get("/", userControllers.getUsers)

//get single user

router.get("/:userId", userControllers.getSingleUser)

//update single User

router.put('/:userId', userControllers.updateSingleUser)

// delete single user

router.delete('/:userId', userControllers.deleteSingleUser)

export const userRoutes = router; 