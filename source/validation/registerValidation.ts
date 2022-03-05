const Joi = require('joi')

//register validation
export const registerValidation = (data) => {
    const schema = Joi.object({
        id: Joi.string().required(),
        username: Joi.string().min(6).required().max(20),
        email: Joi.string().min(6).required().max(30).email(),
        password: Joi.string().min(6).required().max(30)
    })
   return schema.validate(data)
};