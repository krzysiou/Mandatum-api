import express from "express";
import { userData, showUsers, registerUser } from "./controllers/users";
import dotenv from "dotenv";

//configure envirnomental variables
dotenv.config()

//define mandatory variables
const app = express();
app.use(express.json());

//temporary databases
let users: userData[] = [];

//routes
app.get('/users', showUsers(users))
app.post('/users/register', registerUser(users))

//listen to port
app.listen(process.env.PORT, () => console.log('Listening to port:', process.env.PORT));