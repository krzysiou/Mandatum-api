import express from "express";
import { showUsers, userData } from "./controllers/users";

//define mandatory variables
const app = express();
const port:string = "3000";

let users: userData[] = [];

//routes
app.use('/users', showUsers(users))

//listen to port
app.listen(port, () => console.log('Listening to port:', port));