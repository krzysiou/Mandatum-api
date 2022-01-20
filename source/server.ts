import express from "express";
import { userData, showUsers, registerUser } from "./controllers/users";

//define mandatory variables
const app = express();
app.use(express.json());
const port:string = "3001";

let users: userData[] = [];

//routes
app.get('/users', showUsers(users))
app.post('/users/register', registerUser(users))

//listen to port
app.listen(port, () => console.log('Listening to port:', port));