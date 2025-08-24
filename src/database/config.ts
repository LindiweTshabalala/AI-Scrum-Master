import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import { User } from "./models/User";
import { StandupResponse } from "./models/StandupResponse";
import { SprintRetrospective } from "./models/SprintRetrospective";
import { UserReview } from "./models/UserReview";
import { Channel } from "./models/Channel";
import { Blocker } from "./models/Blocker";
import { TeamMetrics } from "./models/TeamMetrics";

const config: PostgresConnectionOptions = {
    type: "postgres",
    host: process.env.DB_HOST || "aimigos.cyl8y60smh3c.us-east-1.rds.amazonaws.com",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "aimigos123",
    database: process.env.DB_NAME || "ai-scrum-auto",
    synchronize: true, // Be careful with this in production
    logging: false,
    ssl: {
        rejectUnauthorized: false // Use this only for development
    },
    entities: [
        User,
        StandupResponse,
        SprintRetrospective,
        UserReview,
        Channel,
        Blocker,
        TeamMetrics
    ],
    subscribers: [],
    migrations: []
};

export const AppDataSource = new DataSource(config);
