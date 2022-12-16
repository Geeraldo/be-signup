import Users from "../models/User.js";
import bcrypt  from "bcrypt";
import Joi from "joi";
import passwordComplexity from 'joi-password-complexity'
import EmailSender from "../services/Mail.js"
import  Jwt  from "jsonwebtoken";
import * as dotenv from "dotenv"
dotenv.config()

export const getAllUsers = async(req,res) => {
    try {
        const users = await Users.findAll({
            attributes:['id','name','email']
        });
        res.json(users);
    } catch (error) {
    console.log(error);
    }
}

export const SignUp = async(req,res) => {
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
    const validation = Joi.object({
        name: Joi.string()
            .alphanum()
            .min(3)
            .max(30)
            .required()
            .messages({
                "string.base": `Username should be a type of 'text'.`,
                "string.empty": `Username cannot be an empty field.`,
                "string.min": `Username should have a minimum length of 8.`,
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
        const value = await validation.validateAsync({ name: name, email: email, confPassword:confPassword ,password:password, });
        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(value.password,salt)
        await Users.create({
            name:value.name,
            email:value.email,
            password:hashPassword,
            is_login: 0
        });
        await EmailSender.sendMessage(
            email,
            'Sign Up Sucessfull',
            'Sign Up',
            `<h1> Hi ${email}, Congratulation Sign Up is successfull! </h1>`
        )
        res.status(200).send({
            message:"Regsiter Successfull"
        })
    } catch (error) {
        res.status(500).send({
            message: error.message.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '')
        })
    }

}

export const Login = async(req,res) => {
    try {
        const user = await Users.findAll({
            where:{
                email:req.body.email
            }
        });
        const match = await bcrypt.compare(req.body.password, user[0].password)
        if(!match) return res.status(400).send({
            message:"Wrong Password"
        })
        const userId = user[0].id;
        const name = user[0].name;
        const email = user[0].email;
        const accessToken = Jwt.sign({userId, name, email},process.env.ACCESS_TOKEN_SECRET,{
            expiresIn: '10s'
        })
        const refreshToken = Jwt.sign({userId, name, email},process.env.REFRESH_TOKEN_SECRET,{
            expiresIn:'1d'
        });
        await Users.update({
            refresh_token:refreshToken,
            is_login:1
        },{
            where:{
                id:userId
            }
        });
        res.cookie('refreshToken',refreshToken,{
            httpOnly:true,
            maxAge: 24 * 60 * 60 * 1000
        });
        res.status(200).send({ accessToken })

    } catch (error) {
        res.status(404).send({
            message:"email or password invalid"
        })
    }
}
export const Logout = async(req,res) => {
    const refreshToken = req.cookies.refreshToken;
    if(!refreshToken) return res.status(204).send();
    const user = await Users.findAll({
        where:{
            refresh_token:refreshToken
        }
    });
    if(!user[0]) return res.status(204).send()
    const userId = user[0].id;
    await Users.update({
        refresh_token:null,
        is_login:0
    },{
        where:{
            id:userId
        }
    });
    res.clearCookie('refreshToken')
    return res.status(200).send({
        message:"Logout Successfull!"
    })
}