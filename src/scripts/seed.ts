import "reflect-metadata";
import { AppDataSource } from "../database/config";
import { User } from "../database/models/User";
import { Channel } from "../database/models/Channel";
import { StandupResponse } from "../database/models/StandupResponse";

async function seed() {
    try {
        // Initialize the database connection
        await AppDataSource.initialize();
        console.log("Database connection initialized");

        // Create test users
        const userRepository = AppDataSource.getRepository(User);
        const users = await Promise.all([
            userRepository.save({
                slackUserId: "U123456",
                displayName: "John Doe",
                email: "john@example.com",
            }),
            userRepository.save({
                slackUserId: "U789012",
                displayName: "Jane Smith",
                email: "jane@example.com",
            })
        ]);
        console.log("Created test users");

        // Create test channel
        const channelRepository = AppDataSource.getRepository(Channel);
        const channel = await channelRepository.save({
            slackChannelId: "C123456",
            channelName: "team-awesome",
            purpose: "Team Awesome's channel for daily standups",
        });
        console.log("Created test channel");

        // Create test standup responses
        const standupResponseRepository = AppDataSource.getRepository(StandupResponse);
        const standupResponses = await Promise.all([
            standupResponseRepository.save({
                user: users[0],
                channel: channel,
                yesterdayWork: "Completed API integration",
                todayWork: "Working on database optimization",
                blockers: "None",
                date: new Date(),
            }),
            standupResponseRepository.save({
                user: users[1],
                channel: channel,
                yesterdayWork: "Finished UI design",
                todayWork: "Starting frontend implementation",
                blockers: "Waiting for API documentation",
                date: new Date(),
            })
        ]);
        console.log("Created test standup responses");

        console.log("Seeding completed successfully!");
    } catch (error) {
        console.error("Error during seeding:", error);
    } finally {
        // Close the database connection
        await AppDataSource.destroy();
    }
}

// Run the seed function
seed();
