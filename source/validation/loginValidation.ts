import { userData } from "../controllers/users"
const Joi = require('joi')

//register validation
export const loginValidation = (data:userData) => {
    const schema = Joi.object({
        username: Joi.string().min(6).required().max(20),
        password: Joi.string().min(6).required().max(30)
    })
   return schema.validate(data)
};