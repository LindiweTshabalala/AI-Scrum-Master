import { AppDataSource } from "../database/config"
import { StandupResponse } from "../database/models/StandupResponse"
import { Between } from "typeorm"

export class StandupService {
    private standupRepository = AppDataSource.getRepository(StandupResponse)

    async saveStandupResponse(standupData: Partial<StandupResponse>): Promise<StandupResponse> {
        const standup = this.standupRepository.create(standupData)
        return await this.standupRepository.save(standup)
    }

    async getUserStandups(userId: string, startDate: Date, endDate: Date): Promise<StandupResponse[]> {
        return await this.standupRepository.find({
            where: {
                userId,
                date: Between(startDate, endDate)
            },
            order: {
                date: "DESC"
            }
        })
    }
}