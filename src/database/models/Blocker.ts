import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";
import { StandupResponse } from "./StandupResponse";

@Entity("blockers")
export class Blocker {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, user => user.blockers)
    @JoinColumn({ name: "userId" })
    user!: User;

    @Column({ type: "int" })
    userId!: number;

    @ManyToOne(() => StandupResponse)
    @JoinColumn({ name: "standupResponseId" })
    standupResponse!: StandupResponse;

    @Column({ type: "int" })
    standupResponseId!: number;

    @Column({ type: "text" })
    description!: string;

    @Column({ type: "varchar", length: 20, default: "OPEN" })
    status!: string;

    @Column({ type: "timestamp", nullable: true })
    resolvedAt?: Date;

    @Column({ type: "text", nullable: true })
    resolutionNotes?: string;

    @CreateDateColumn()
    createdAt!: Date;
}
