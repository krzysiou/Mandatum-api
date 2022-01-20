import express, {Request, Response} from 'express'
import { registerValidation } from '../validation/registerValidation'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
require('dotenv').config()

export type userData = {
  id: string,
  name: string,
  email: string,
  password:string
};

export const showUsers = (users:userData[]) => {
  return (req: Request, res: Response) => {
    return res.status(200).json(users);
  }
}

export const registerUser = (users:userData[]) => {
  return async (req: Request, res: Response) => {
    //validate user data
    const error = registerValidation(req.body);
    if (error) return res.status(400).json({error: error.details[0].message});
    //check if username taken
    const user = users.find(user => user.name === req.body.name);
    if (user) return res.status(400).json({error: 'Name taken'});
    try {
      //Hashing
      const hashedPassword = await bcrypt.hash(req.body.password, 10)
      const hashedEmail = await bcrypt.hash(req.body.email, 10)
      //Create User
      const user:userData = {
        id: req.body.id,
        name: req.body.name,
        email: hashedEmail,
        password: hashedPassword
      }
      //add user to database
      users.push(user);
      //generate jwt and return it
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET as jwt.Secret)
      res.status(201).json({accessToken: accessToken })
    } catch (error) {
      res.status(500).send(error)
    }
  }
}