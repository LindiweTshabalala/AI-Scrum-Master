import { DataSource } from "typeorm"
import { config } from "../config/env"
import { StandupResponse } from "./models/StandupResponse"
import { PerformanceReport } from "./models/PerformanceReport"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: config.db.host,
    port: config.db.port,
    username: config.db.user,
    password: config.db.password,
    database: config.db.name,
    synchronize: true, 
    logging: false,
    entities: [StandupResponse, PerformanceReport],
    ssl: {
        rejectUnauthorized: false 
    },
    extra: {
        ssl: {
            rejectUnauthorized: false
        }
    }
})