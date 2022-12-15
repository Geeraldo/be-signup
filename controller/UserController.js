import Users from "../models/User.js";
import bcrypt  from "bcrypt";
import Joi from "joi";
import passwordComplexity from 'joi-password-complexity'

export const getAllUsers = async(req,res) => {
    try {
        const users = await Users.findAll();
        res.json(users);
    } catch (error) {
    console.log(error);
    }
}

export const Register = async(req,res) => {
    const { name, email, password, confPassword} = req.body;
    const complexityOptions = {
        min: 8,
        max: 30,
        lowerCase: 1,
        upperCase: 1,
        numeric: 1,
        symbol: 1,
        requirementCount: 6,
      };
    const schema = Joi.object({
        name: Joi.string()
            .alphanum()
            .min(3)
            .max(30)
            .required()
            .messages({
                "string.base": `Username should be a type of 'text'.`,
                "string.empty": `Username cannot be an empty field.`,
                "string.min": `Username should have a minimum length of 3.`,
                "any.required": `Username is a required field.`,
            }),
        password: passwordComplexity(complexityOptions).required(),
        confPassword: Joi.any().valid(Joi.ref('password')).messages({
            "any.only" : `Password not match'.`
        }),
        email: Joi.string()
            .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
    })
    try {
        const value = await schema.validateAsync({ name: name, email: email, confPassword:confPassword ,password:password, });
        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(value.password,salt)
        await Users.create({
            name:value.name,
            email:value.email,
            password:hashPassword,
            is_login:'1'
        });
        res.status(200).send({
            message:"Regsiter Successfull"
        })
    } catch (error) {
        res.status(500).send({
            message: error.message.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '')
        })
    }



}