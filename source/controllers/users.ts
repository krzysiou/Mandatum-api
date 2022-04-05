import express, {Request, Response} from 'express'
import { registerValidation } from '../validation/registerValidation'
import { loginValidation } from '../validation/loginValidation';
import { addUserValidation } from '../validation/addUserValidation';
import { ModifiedRequest } from '../authorization/checkAuth';
import { date } from 'joi';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//generate jwt and return it
export const generateToken = async (user, prisma) => {
  //get raw arrays
  const rawFriendships = await prisma.Friendship.findMany({
    where: {
      OR : [
        {
          ownerId: {
            equals: user.id
          }
        },
        {
          memberId: {
            equals: user.id
          }
        }
      ]
    },
  })
  const rawPins = await prisma.Pin.findMany({
    where: {
      ownerId: {
        equals: user.id
      }
    },
  })
  const rawRecents = await prisma.Recent.findMany({
    where: {
      ownerId: {
        equals: user.id
      }
    },
  })
  //processing arrays
  const processedFriendships = rawFriendships.map((record)=>{
    return (user.id === record.ownerId ? record.memberId : record.ownerId)
  })
  const processedPins = rawPins.map((record)=>{
    return record.memberId
  })
  rawRecents.sort(function(a, b){
    const date1 = a.lastCheckout
    const date2 = b.lastCheckout
    return date2 - date1;
  })

  const processedRecents = rawRecents.map((record)=>{
    return record.memberId
  })
  //generate token
  const token = jwt.sign({
    id: user.id,
    username: user.username,
    friends: processedFriendships,
    pinned: processedPins,
    recent: processedRecents.slice(0,10)
  }, process.env.TOKEN_SECRET)
  return token
}
//return all users
export const showUsers = (prisma) => {
  return async (req: Request, res: Response) => {
    const result = await prisma.User.findMany()
    return res.status(200).json(result);
  }
}
//register user
export const registerUser = (prisma) => {
  return async (req:Request, res:Response) => {
    //validate user data
    const { error } = registerValidation(req.body);
    if (error) return res.status(400).json({error: 'incorrect credentials'});
    //check if username taken
    const found = await prisma.user.findUnique({
      where: {
        username: req.body.username,
      },
    })
    if (found) return res.status(400).json({error: 'username taken'});
    try {
      //Hashing
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const hashedEmail = await bcrypt.hash(req.body.email, 10);
      //add user to database
      const user = await prisma.User.create({
        data: {
          username: req.body.username,
          email: hashedEmail,
          password: hashedPassword,
        },
      })
      res.status(201).json({accessToken: await generateToken(user, prisma)})
    } catch (error) {
      res.status(500).send(error)
    }
  }
}
//log user in
export const loginUser = (prisma) => {
  return async (req: Request, res:Response) => {
      //Validation
      const { error } = loginValidation(req.body)
      if (error) return res.status(400).json({error: 'incorrect credentials'})
      //find user
      const user = await prisma.user.findUnique({
        where: {
          username: req.body.username,
        },
      })
      //if not found
      if (!user) {
        return res.status(400).json({error: 'incorrect name'})
      }
      try {
          //if password correct
          if(await bcrypt.compare(req.body.password, user.password)){
              res.status(200).json({accessToken: await generateToken(user, prisma)})
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
export const addUser = (prisma) => {
  return async (req: ModifiedRequest, res:Response) => {
      //Validation
      const { error } = addUserValidation(req.body)
      if (error) return res.status(400).json({error: 'incorrect username'})
      //find user
      const friend = await prisma.user.findUnique({
        where: {
          username: req.body.username,
        },
      })
      //if not found
      if (!friend) {
        return res.status(400).json({error: 'user not found'})
      }
      try {
        //add user to friends
        const user = await prisma.user.findUnique({
          where: {
            username: req.currentUser.username,
          },
        })
        if(user.id === friend.id){
          return res.status(400).json({error: 'you cannot add yourself'});
        } else if (await prisma.Friendship.count({
          where: {
            OR : [
              {
                AND : {
                  ownerId: {
                    equals: user.id
                  },
                  memberId: {
                    equals: friend.id
                  }
                } 
              },
              {
                AND : {
                  ownerId: {
                    equals: friend.id
                  },
                  memberId: {
                    equals: user.id
                  }
                 } 
              }
            ]
          },
        })) {
          return res.status(400).json({error: 'user already added'});
        }
        const friendship = await prisma.Friendship.create({
          data: {
            ownerId: user.id,
            memberId: friend.id
          },
        })
        //add user to friends
        const updatedUser = await prisma.user.findUnique({
          where: {
            username: req.currentUser.username,
          },
        })
        //update token
        return res.status(200).json({accessToken: await generateToken(updatedUser, prisma), id: friend.id});
      } catch {
        return res.status(500).json({error: 'process failed'});
      }
  }
}
//remove friend
export const removeUser = (prisma) => {
  return async (req: ModifiedRequest, res:Response) => {
      //find user
      const friend = await prisma.user.findUnique({
        where: {
          id: req.body.id,
        },
      })
      //if not found
      if (!friend) {
        return res.status(400).json({error: 'user not found'})
      }
      try {
        //add user to friends
        const user = await prisma.user.findUnique({
          where: {
            username: req.currentUser.username,
          },
        })
        //remove friendship
        const deletedFriend = await prisma.Friendship.deleteMany({
          where: {
            OR : [
              {
                AND : {
                  ownerId: {
                    equals: user.id
                  },
                  memberId: {
                    equals: friend.id
                  }
                } 
              },
              {
                AND : {
                  ownerId: {
                    equals: friend.id
                  },
                  memberId: {
                    equals: user.id
                  }
                 } 
              }
            ]
          },
        })
        //remove recent
        const deletedRecent = await prisma.Recent.deleteMany({
          where: {
            AND : {
              ownerId: {
                equals: user.id
              },
              memberId: {
                equals: friend.id
              }
            } 
          }
        })
        //remove recent
        const deletedPin = await prisma.Pin.deleteMany({
          where: {
            AND : {
              ownerId: {
                equals: user.id
              },
              memberId: {
                equals: friend.id
              }
            } 
          }
        })
        //add user to friends
        const updatedUser = await prisma.user.findUnique({
          where: {
            username: req.currentUser.username,
          },
        })
        //update token
        return res.status(200).json({accessToken: await generateToken(updatedUser, prisma)});
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
//get user id
export const getUsername = (prisma) => {
  return async (req: ModifiedRequest, res:Response) => {
    try {
      //find user
      const user = await prisma.User.findUnique({
        where: {
          id: req.body.id
        }
      })
      //return username
      return res.status(200).json({username: user.username});
    } catch {
      return res.status(500).json({error: 'process failed'});
    }
  }
}
//add to pinned
export const pinAdd = (prisma) => {
  return async (req: ModifiedRequest, res:Response) => {
    try {
      //find usertToPin
      const userToPin = await prisma.user.findUnique({
        where: {
          username: req.body.username,
        },
      })
      //find user sending request
      const user = await prisma.user.findUnique({
        where: {
          username: req.currentUser.username,
        },
      })
      //add user id to pinned
      const addedPin = await prisma.Pin.create({
        data: {
          ownerId: user.id,
          memberId: userToPin.id
        }
      })
      //update user
      const updatedUser = await prisma.user.findUnique({
        where: {
          username: req.currentUser.username,
        },
      })
      return res.status(200).json({accessToken: await generateToken(updatedUser, prisma)});
    } catch {
      return res.status(500).json({error: 'process failed'});
    }
  }
}
//remove from pinned
export const pinRemove = (prisma) => {
  return async (req: ModifiedRequest, res:Response) => {
    try {
      //find usertToUnPin
      const found = await prisma.user.findUnique({
        where: {
          username: req.body.username,
        },
      })
      //find user sending request
      const user = await prisma.user.findUnique({
        where: {
          username: req.currentUser.username,
        },
      })
      //remove user id from pinned
      const deleteUser = await prisma.Pin.deleteMany({
        where: {
          memberId: found.id,
        }
      })
       //update user
       const updatedUser = await prisma.user.findUnique({
        where: {
          username: req.currentUser.username,
        },
      })
      return res.status(200).json({accessToken: await generateToken(updatedUser, prisma)});
    } catch {
      return res.status(500).json({error: 'process failed'});
    }
  }
}
//get array of friends
export const getFriends = (prisma) => {
  return async (req: ModifiedRequest, res:Response) => {
    try {
       //find user sending request
       const user = await prisma.user.findUnique({
        where: {
          username: req.currentUser.username,
        },
      })
      const rawFriendships = await prisma.Friendship.findMany({
        where: {
          OR : [
            {
              ownerId: {
                equals: user.id
              }
            },
            {
              memberId: {
                equals: user.id
              }
            }
          ]
        },
      })
      const processedFriendships = rawFriendships.map((record)=>{
        return (user.id === record.ownerId ? record.memberId : record.ownerId)
      })
      return res.status(200).json({friends: processedFriendships});
    } catch {
      return res.status(500).json({error: 'process failed'});
    }
  }
}
//change username
export const changeUsername = (prisma) => {
  return async (req: ModifiedRequest, res:Response) => {
    try {
      //Validation
      const { error } = addUserValidation(req.body)
      if (error) return res.status(400).json({error: 'incorrect username'})
      //check if username taken
      const found = await prisma.user.findUnique({
        where: {
          username: req.body.username,
        },
      })
      if (found) return res.status(400).json({error: 'username taken'});
      //find user
      const updateUser = await prisma.User.update({
        where: {
          id: req.currentUser.id,
        },
        data: {
          username: req.body.username,
        },
      })
      //update user
      const updatedUser = await prisma.user.findUnique({
        where: {
          username: req.body.username,
        },
      })
      //update token
      return res.status(200).json({accessToken: await generateToken(updatedUser, prisma), message: 'successfully changed', newUsername: req.body.username});
    } catch {
      return res.status(500).json({error: 'process failed'});
    }
  }
}
//add to recents
export const addRecent = (prisma) => {
  return async (req: ModifiedRequest, res:Response) => {
    try {
      //find users
      const userToAdd = await prisma.user.findUnique({
        where: {
          id: req.body.id,
        },
      })
      const user = await prisma.user.findUnique({
        where: {
          id: req.currentUser.id,
        },
      })
      if(await prisma.Recent.count({
        where: {
          AND : [
            {
              ownerId: {
                equals: user.id
              }
            },
            {
              memberId: {
                equals: userToAdd.id
              }
            }
          ]
        },
      })){
        //add user id to recent
        const updatedRecent = await prisma.Recent.updateMany({
          where: {
            AND : [
              {
                ownerId: {
                  equals: user.id
                }
              },
              {
                memberId: {
                  equals: userToAdd.id
                }
              }
            ]
          },
          data: {
            lastCheckout: new Date()
          }
        })
      } else {
        //add user id to recent
        const addedRecent = await prisma.Recent.create({
          data: {
            ownerId: user.id,
            memberId: userToAdd.id,
            lastCheckout: new Date()
          }
        })
      }
      //update user
      const updatedUser = await prisma.user.findUnique({
        where: {
          username: req.currentUser.username,
        },
      })
      //update token
      return res.status(200).json({accessToken: await generateToken(updatedUser, prisma), message: 'successfully changed', newUsername: req.body.username});
    } catch {
      return res.status(500).json({error: 'process failed'});
    }
  }
}