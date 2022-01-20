import express, {Request, Response} from 'express'

export type userData = {
  id: string,
  name: string,
  email: string,
};

export const showUsers = (users:object[]) => {
  return (req: Request, res: Response) => {
    return res.status(200).json(users);
  }
}