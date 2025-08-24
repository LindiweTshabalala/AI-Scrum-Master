import { AppDataSource } from "../database/config";
import { StandupResponse } from "../database/models/StandupResponse";
import { User } from "../database/models/User";
import { Between } from "typeorm";
import { GeminiAnalysis } from "../types/gemini";

export class StandupService {
    private standupRepository = AppDataSource.getRepository(StandupResponse);
    private userRepository = AppDataSource.getRepository(User);

    async saveStandupResponse(
        slackUserId: string, 
        email: string | undefined,
        standupData: {
            date: Date;
            yesterdayWork: string;
            todayWork: string;
            blockers?: string;
            analysis?: GeminiAnalysis;
        }
    ): Promise<StandupResponse> {
        console.log("Starting saveStandupResponse with:", { slackUserId, email });
        
        let savedUser: User;
        try {
            // First, find or create the user
            console.log("Searching for user with slackUserId:", slackUserId);
            let existingUser = await this.userRepository.findOne({ where: { slackUserId } });
            
            if (!existingUser) {
                console.log("User not found, creating new user");
                const newUser = this.userRepository.create({
                    slackUserId,
                    email,
                    isActive: true
                });
                savedUser = await this.userRepository.save(newUser);
                console.log("New user saved successfully:", savedUser);
            } else {
                console.log("Found existing user:", existingUser);
                savedUser = existingUser;
            }

            // Create the standup response
            console.log("Creating standup entity...");
            const standup = this.standupRepository.create({
                user: savedUser,
                date: standupData.date,
                yesterdayWork: standupData.yesterdayWork,
                todayWork: standupData.todayWork,
                blockers: standupData.blockers,
                sentimentScore: standupData.analysis?.sentiment,
                productivityScore: standupData.analysis?.productivity
            });

            console.log("Created standup entity:", JSON.stringify(standup, null, 2));
            console.log("Attempting to save standup...");
            
            const savedStandup = await this.standupRepository.save(standup);
            console.log("Successfully saved standup:", JSON.stringify(savedStandup, null, 2));
            return savedStandup;
        } catch (error) {
            console.error("Error saving standup:", error);
            throw error;
        }
    }

    async getUserStandups(userId: number, startDate: Date, endDate: Date): Promise<StandupResponse[]> {
        return await this.standupRepository.find({
            where: {
                userId,
                date: Between(startDate, endDate)
            },
            order: {
                date: "DESC"
            },
            relations: ["user"]
        });
    }
}
