import { Sequelize } from "sequelize";
import * as dotenv from "dotenv"
dotenv.config()


const db = new Sequelize({
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host:process.env.DB_HOST,
    dialect:'mysql'
});

export default db;