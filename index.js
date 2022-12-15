import express  from "express";
import db from "./config/Database.js";
import Users from "./models/User.js";
import { Register,getAllUsers } from "./controller/UserController.js"


const app = express();

try {
    await db.authenticate();
    console.log("database connected");
} catch (error) {
    console.log(error);
}

const router = express.Router();
app.use(express.json());
app.use("/", router);

// Router.get('/users', UserController)
router.get('/user', getAllUsers)
router.post('/register', Register)

app.listen(8000, () => console.log('running on 8000'))




export default router;