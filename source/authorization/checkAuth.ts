import express, {Request, Response} from 'express'
import { NextFunction } from "express";
import { userData } from '../controllers/users';

const jwt = require('jsonwebtoken');

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