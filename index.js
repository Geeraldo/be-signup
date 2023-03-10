import express  from "express";
import db from "./config/Database.js";
import Users from "./models/User.js";
import { SignUp,getAllUsers, Login, Logout } from "./controller/UserController.js"
import { tokenVerify } from"./middleware/tokenVerify.js"
import { refreshToken }  from"./middleware/refreshToken.js"
import cookieParser from "cookie-parser";
const app = express();

try {
    await db.authenticate();
    console.log("database connected");
} catch (error) {
    console.log(error);
}

const router = express.Router();
app.use(express.json());
app.use(cookieParser());
app.use("/", router);

// Router.get('/users', UserController)
router.get('/user', tokenVerify, getAllUsers)
router.get('/refreshtoken', refreshToken)
router.post('/signup', SignUp)
router.post('/login', Login)
router.post('/logout', Logout)
app.listen(8000, () => console.log('running on 8000'))




export default router;