import { pool } from "../../config/db";

const createUser = async (name : string, email : string, password : string, phone: string, role: string) => {
   const result =  await pool.query(
      `INSERT INTO users(name, email, password, phone, role) VALUES($1, $2, $3, $4, $5) RETURNING *`,
      [name, email, password, phone, role]
    );

    return result; 
}

const getUsers = async () => {
    const result = await pool.query(`SELECT * FROM users`); 
    return result;
}


const getSingleUser = async (id : string)  => {
    const result = await  pool.query(`SELECT * FROM users WHERE id = $1`, [
      id
    ])

    return result;
}

const updateSingleUser = async (name : string, email : string, password : string, phone : string, role : string, id: string) => {
    const result = await pool.query(`UPDATE users SET name=$1, email=$2, password=$3, phone=$4, role=$5 WHERE id = $6 RETURNING *`, [name, email, password, phone, role , id])
    return result;
}

const deleteSingleUser = async (id: string) => {
    const result = await pool.query(`SELECT * FROM bookings WHERE customer_id = $1 AND status ='active' `, [id])
    return result;
}
export const userServices = {
    createUser, 
    getUsers, 
    getSingleUser, 
    updateSingleUser, 
    deleteSingleUser
}