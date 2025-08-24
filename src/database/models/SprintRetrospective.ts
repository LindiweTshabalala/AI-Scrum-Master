import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("sprint_retrospectives")
export class SprintRetrospective {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 100, nullable: true })
    sprintName?: string;

    @Column({ type: "date" })
    startDate!: Date;

    @Column({ type: "date" })
    endDate!: Date;

    @Column({ type: "text" })
    summary!: string;

    @Column("text", { array: true })
    keyWins!: string[];

    @Column("text", { array: true })
    keyChallenges!: string[];

    @Column("text", { array: true })
    actionItems!: string[];

    @Column({ type: "decimal", precision: 3, scale: 2, nullable: true })
    teamSentimentScore?: number;

    @CreateDateColumn()
    createdAt!: Date;
}
