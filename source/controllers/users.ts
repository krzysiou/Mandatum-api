import express, {Request, Response} from 'express'
import { registerValidation } from '../validation/registerValidation'
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
require('dotenv').config()

export type userData = {
  id: string,
  username: string,
  email: string,
  password:string
};

export const showUsers = (users:userData[]) => {
  return (req: Request, res: Response) => {
    return res.status(200).json(users);
  }
}

export const registerUser = (users:userData[]) => {
  return async (req:Request, res:Response) => {
    //validate user data
    const { error } = registerValidation(req.body);
    if (error) return res.status(400).json({error: error.details[0].message});
    //check if username taken
    const found:userData = users.find(user => user.username === req.body.username);
    if (found) return res.status(400).json({error: 'userame taken'});
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
      const accessToken = jwt.sign(user, '12332112331212323')
      res.status(201).json({accessToken: accessToken })
    } catch (error) {
      res.status(500).send(error)
    }
  }
}