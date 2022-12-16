import Users from "../models/User.js";
import  Jwt  from "jsonwebtoken";
import * as dotenv from "dotenv"
dotenv.config()

export const refreshToken = async (req,res) => {
    try {
    const refreshToken = req.cookies.refreshToken;
    if(!refreshToken) return res.status(401).send();
    const user = await Users.findAll({
        where:{
            refresh_token:refreshToken
        }
    });
    if(!user[0]) return res.status(403).send()
    Jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET,(err,decoded) =>{
        if(err) return res.status(403).send({
            message:err.message
        });
        const userId = user[0].id;
        const name = user[0].name;
        const email = user[0].email;
        const accessToken = Jwt.sign({userId, name, email},process.env.ACCESS_TOKEN_SECRET,{
            expiresIn: '30s'
        });
        res.status(200).send({ accessToken })
    });
    } catch (error) {

    }
}