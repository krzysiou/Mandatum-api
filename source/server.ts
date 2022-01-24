import express from "express";
import { userData, showUsers, registerUser, loginUser, addUser, getUser, changeUsername, getUserId, pinAdd, pinRemove } from "./controllers/users";
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
app.post('/users/login', loginUser(users));
app.post('/users/add', checkAuth, addUser(users));
app.post('/users/get', checkAuth, getUser());
app.post('/users/get/id', checkAuth, getUserId(users));
app.patch('/users/patch/username', checkAuth, changeUsername(users));
app.post('/users/pinned/add', checkAuth, pinAdd(users));
app.post('/users/pinned/remove', checkAuth, pinRemove(users));

//listen to port
app.listen(process.env.PORT, () => console.log('Listening to port:', process.env.PORT));