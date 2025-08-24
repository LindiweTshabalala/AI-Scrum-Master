import "reflect-metadata";
import { AppDataSource } from "../database/config";

async function initializeDatabase() {
    try {
        await AppDataSource.initialize();
        console.log("Database initialized successfully!");
        
        // Ensure the database is up to date with our entity schemas
        await AppDataSource.synchronize();
        console.log("Database schema synchronized!");
        
        process.exit(0);
    } catch (error) {
        console.error("Error during database initialization:", error);
        process.exit(1);
    }
}

initializeDatabase();
