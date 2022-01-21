import express, {Request, Response} from 'express'
import { registerValidation } from '../validation/registerValidation'
import { loginValidation } from '../validation/loginValidation';

var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

export type userData = {
  id: string,
  username: string,
  email: string,
  password:string
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
        password: hashedPassword
      }
      //add user to database
      users.push(user);
      //generate jwt and return it
      const accessToken = jwt.sign(user, process.env.TOKEN_SECRET)
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