import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";

@Entity("standup_responses")
export class StandupResponse {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, user => user.standups)
    @JoinColumn({ name: "userId" })
    user!: User;

    @Column({ type: "int" })
    userId!: number;

    @Column({ type: "date" })
    date!: Date;

    @Column({ type: "text" })
    yesterdayWork!: string;

    @Column({ type: "text" })
    todayWork!: string;

    @Column({ type: "text", nullable: true })
    blockers?: string;

    @Column({ type: "decimal", precision: 3, scale: 2, nullable: true })
    sentimentScore?: number;

    @Column({ type: "decimal", precision: 3, scale: 2, nullable: true })
    productivityScore?: number;

    @CreateDateColumn()
    createdAt!: Date;
}
