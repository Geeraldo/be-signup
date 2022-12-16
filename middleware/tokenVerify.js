import  Jwt  from "jsonwebtoken"
import * as dotenv from "dotenv"
dotenv.config()

export const tokenVerify = (req, res,next) =>{
const  header = req.headers['authorization'];
const token = header && header.split(' ')[1];
if(token == null) return res.status(401).send({
    message: "Token not found"
})
Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
    if (err) return res.status(403).send({
        message:err.message
    })
    req.email = decoded.email;
    next();
})
}