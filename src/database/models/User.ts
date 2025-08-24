import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { StandupResponse } from "./StandupResponse";
import { UserReview } from "./UserReview";
import { Blocker } from "./Blocker";

@Entity("users")
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 50, unique: true })
    slackUserId!: string;

    @Column({ type: "varchar", length: 255, unique: true, nullable: true })
    email?: string;

    @Column({ type: "varchar", length: 100, nullable: true })
    displayName?: string;

    @Column({ type: "boolean", default: true })
    isActive!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    // Relationships
    @OneToMany(() => StandupResponse, standup => standup.user)
    standups!: StandupResponse[];

    @OneToMany(() => UserReview, review => review.user)
    reviews!: UserReview[];

    @OneToMany(() => Blocker, blocker => blocker.user)
    blockers!: Blocker[];
}
