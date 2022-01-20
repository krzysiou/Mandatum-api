const { required } = require('joi')
const Joi = require('joi')
import { userData } from "../controllers/users"

//register validation
export const registerValidation = (data:userData) => {
    const schema = Joi.object({
        id: Joi.string(),
        name: Joi.string().min(6).required().max(20),
        email: Joi.string().min(6).required().max(30).email(),
        password: Joi.string().min(6).required().max(30)
    })
   return schema.validate(data)
} 