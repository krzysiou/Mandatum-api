const Joi = require('joi')

//add friend validation
export const addUserValidation = (data:{username: string}) => {
    const schema = Joi.object({
        username: Joi.string().min(6).required().max(20)
    })
   return schema.validate(data)
};