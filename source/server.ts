import express from "express";
import dotenv from "dotenv";
import { showUsers, registerUser, loginUser, addUser, getUser, changeUsername, getUsername, pinAdd, pinRemove, getFriends, removeUser, addRecent } from "./controllers/users";
import { checkAuth } from "./authorization/checkAuth";
import { PrismaClient } from '@prisma/client';
var cors = require('cors')

//configure envirnomental variables
dotenv.config()
//define mandatory variables
const app = express();
app.use(cors())
app.use(express.json());
//ORM 
const prisma = new PrismaClient()

//routes
app.get('/users', showUsers(prisma));
app.post('/users/register', registerUser(prisma));
app.post('/users/login', loginUser(prisma));
app.post('/users/add', checkAuth, addUser(prisma));
app.post('/users/remove', checkAuth, removeUser(prisma));
app.post('/users/get', checkAuth, getUser());
app.post('/users/click', checkAuth, addRecent(prisma));
app.post('/users/get/username', checkAuth, getUsername(prisma));
app.post('/users/pinned/add', checkAuth, pinAdd(prisma));
app.post('/users/pinned/remove', checkAuth, pinRemove(prisma));
app.post('/users/pinned/get', checkAuth, getFriends(prisma));
app.patch('/users/patch/username', checkAuth, changeUsername(prisma));

//listen to port
app.listen(process.env.PORT, () => console.log('Listening to port:', process.env.PORT));