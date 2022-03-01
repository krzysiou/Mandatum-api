import express from "express";
import { userData, showUsers, registerUser, loginUser, addUser, getUser, changeUsername, getUsername, pinAdd, pinRemove, getFriends } from "./controllers/users";
import { checkAuth } from "./authorization/checkAuth";
import dotenv from "dotenv";
import { PrismaClient } from '@prisma/client';

//configure envirnomental variables
dotenv.config()

//define mandatory variables
const app = express();
app.use(express.json());

//temporary databases
let users: userData[] = [];

//ORM 
const prisma = new PrismaClient()

//routes
app.get('/users', showUsers(users));
app.post('/users/register', registerUser(users, prisma));
app.post('/users/login', loginUser(users, prisma));
app.post('/users/add', checkAuth, addUser(users));
app.post('/users/get', checkAuth, getUser());
app.post('/users/get/username', checkAuth, getUsername(users));
app.post('/users/pinned/add', checkAuth, pinAdd(users));
app.post('/users/pinned/remove', checkAuth, pinRemove(users));
app.post('/users/pinned/get', checkAuth, getFriends(users));
app.patch('/users/patch/username', checkAuth, changeUsername(users));

//listen to port
app.listen(process.env.PORT, () => console.log('Listening to port:', process.env.PORT));