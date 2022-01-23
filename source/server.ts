import express from "express";
import { userData, showUsers, registerUser, loginUser, addUser, getUser } from "./controllers/users";
import { checkAuth } from "./authorization/checkAuth";
import dotenv from "dotenv";

//configure envirnomental variables
dotenv.config()

//define mandatory variables
const app = express();
app.use(express.json());

//temporary databases
let users: userData[] = [];

//routes
app.get('/users', showUsers(users));
app.post('/users/register', registerUser(users));
app.post('/users/login', loginUser(users))
app.post('/users/add', checkAuth, addUser(users))
app.post('/users/get', checkAuth, getUser())

//listen to port
app.listen(process.env.PORT, () => console.log('Listening to port:', process.env.PORT));