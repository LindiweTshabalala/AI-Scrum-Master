import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("team_metrics")
export class TeamMetrics {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "date" })
    date!: Date;

    @Column({ type: "decimal", precision: 5, scale: 2 })
    standupParticipationRate!: number;

    @Column({ type: "decimal", precision: 3, scale: 2 })
    averageSentimentScore!: number;

    @Column({ type: "int" })
    activeBlockersCount!: number;

    @Column({ type: "int" })
    resolvedBlockersCount!: number;

    @CreateDateColumn()
    createdAt!: Date;
}
