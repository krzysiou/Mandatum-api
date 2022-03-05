import express, {Request, Response} from 'express'
import { NextFunction } from "express";

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

export interface ModifiedRequest extends Request {
  currentUser:userData;
}

export const checkAuth = (req: ModifiedRequest, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization.split(" ")[1];
      req.currentUser = jwt.verify(token, process.env.TOKEN_SECRET);
      next();
    } catch (error) {
      return res.status(401).json({error: 'authorization check failed'})
    }
};
