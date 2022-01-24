import express, {Request, Response} from 'express'
import { registerValidation } from '../validation/registerValidation'
import { loginValidation } from '../validation/loginValidation';
import { addUserValidation } from '../validation/addUserValidation';
import { ModifiedRequest } from '../authorization/checkAuth';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

export type userData = {
  id: string,
  username: string,
  email: string,
  password:string,
  friends:string[],
  pinned:string[],
  recent:string[]
};

//return all users
export const showUsers = (users:userData[]) => {
  return (req: Request, res: Response) => {
    return res.status(200).json(users);
  }
}

//register user
export const registerUser = (users:userData[]) => {
  return async (req:Request, res:Response) => {
    //validate user data
    const { error } = registerValidation(req.body);
    if (error) return res.status(400).json({error: 'incorrect credentials'});
    //check if username taken
    const found:userData = users.find(user => user.username === req.body.username);
    if (found) return res.status(400).json({error: 'username taken'});
    try {
      //Hashing
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const hashedEmail = await bcrypt.hash(req.body.email, 10);

      //Create User
      const user:userData = {
        id: req.body.id,
        username: req.body.username,
        email: hashedEmail,
        password: hashedPassword,
        friends: [],
        pinned: [],
        recent: []
      }
      //add user to database
      users.push(user);
      //generate jwt and return it
      const accessToken = jwt.sign({id: user.id, username:user.username, friends: user.friends, pinned: user.pinned, recent: user.recent}, process.env.TOKEN_SECRET)
      res.status(201).json({accessToken: accessToken })
    } catch (error) {
      res.status(500).send(error)
    }
  }
}

//log user in
export const loginUser = (users:userData[]) => {
  return async (req: Request, res:Response) => {
      //Validation
      const { error } = loginValidation(req.body)
      if (error) return res.status(400).json({error: 'incorrect credentials'})
      //find user
      const user = users.find(user => user.username === req.body.username)
      //if not found
      if (!user) {
        return res.status(400).json({error: 'incorrect name'})
      }
      try {
          //if password correct
          if(await bcrypt.compare(req.body.password, user.password)){
              //generate jwt and return it
              const accessToken = jwt.sign(user, process.env.TOKEN_SECRET)
              res.json({accessToken: accessToken})
          } 
          //if incorrect password
          else {
          res.status(400).json({error: 'incorrect password'})
          }
      } catch {
        res.status(500).send()
      }
  }
}

//add friend
export const addUser = (users:userData[]) => {
  return async (req: ModifiedRequest, res:Response) => {
      //Validation
      const { error } = addUserValidation(req.body)
      if (error) return res.status(400).json({error: 'incorrect username'})
      //find user
      const friend = users.find(user => user.username === req.body.username)
      //if not found
      if (!friend) {
        return res.status(400).json({error: 'user not found'})
      }
      try {
        //add user to friends
        const user = users.find(user => user.username === req.currentUser.username)
        if(user === friend){
          return res.status(400).json({error: 'you cannot add yourself'});
        }
        user.friends.push(friend.id);
        //update token
        const accessToken = jwt.sign(user, process.env.TOKEN_SECRET);
        return res.status(200).json({accessToken: accessToken, message: 'successfully added'});
      } catch {
        return res.status(500).json({error: 'process failed'});
      }
  }
}

//decode token and return data
export const getUser = () => {
  return async (req: ModifiedRequest, res:Response) => {
    try {
      return res.status(200).json({user:{
        id: req.currentUser.id,
        username: req.currentUser.username,
        friends: req.currentUser.friends,
        pinned: req.currentUser.pinned,
        recent: req.currentUser.recent
      }});
    } catch {
      return res.status(500);
    }
  }
}

//change username
export const changeUsername = (users:userData[]) => {
  return async (req: ModifiedRequest, res:Response) => {
    try {
      //Validation
      const { error } = addUserValidation(req.body)
      if (error) return res.status(400).json({error: 'incorrect username'})
      //check if username taken
      const found:userData = users.find(user => user.username === req.body.username);
      if (found) return res.status(400).json({error: 'username taken'});
      //find user
      const user = users.find(user => user.username === req.currentUser.username)
      user.username = req.body.username;
      //update token
      const accessToken = jwt.sign(user, process.env.TOKEN_SECRET);
      return res.status(200).json({accessToken: accessToken, message: 'successfully changed', newUsername: user.username});
    } catch {
      return res.status(500).json({error: 'process failed'});
    }
  }
}

//get user id
export const getUserId = (users:userData[]) => {
  return async (req: ModifiedRequest, res:Response) => {
    try {
      //find user
      const user = users.find(user => user.username === req.body.username)
      //return id
      return res.status(200).json({id: user.id});
    } catch {
      return res.status(500).json({error: 'process failed'});
    }
  }
}

//pin user
export const pinAdd = (users:userData[]) => {
  return async (req: ModifiedRequest, res:Response) => {
    try {
      //find usertToPin
      const userToPin = users.find(user => user.username === req.body.username);
      //find user sending request
      let user = users.find(user => user.username === req.currentUser.username);
      //add user id to pinned
      user.pinned.push(userToPin.id);
      const accessToken = jwt.sign(user, process.env.TOKEN_SECRET);
      return res.status(200).json({accessToken: accessToken});
    } catch {
      return res.status(500).json({error: 'process failed'});
    }
  }
}

//unpin user
export const pinRemove = (users:userData[]) => {
  return async (req: ModifiedRequest, res:Response) => {
    try {
      //find usertToPin
      const userToPin = users.find(user => user.username === req.body.username);
      //find user sending request
      let user = users.find(user => user.username === req.currentUser.username);
      //remove user id from pinned
      for(let i = 0; i < user.pinned.length; i++){ 
        if(user.pinned[i] === userToPin.id) { 
          user.pinned.splice(i, 1); 
        }
      }
      const accessToken = jwt.sign(user, process.env.TOKEN_SECRET);
      return res.status(200).json({accessToken: accessToken});
    } catch {
      return res.status(500).json({error: 'process failed'});
    }
  }
}