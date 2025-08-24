import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";

@Entity("user_reviews")
export class UserReview {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, user => user.reviews)
    @JoinColumn({ name: "userId" })
    user!: User;

    @Column({ type: "int" })
    userId!: number;

    @Column({ type: "date" })
    reviewPeriodStart!: Date;

    @Column({ type: "date" })
    reviewPeriodEnd!: Date;

    @Column({ type: "decimal", precision: 3, scale: 2 })
    technicalScore!: number;

    @Column({ type: "decimal", precision: 3, scale: 2 })
    collaborationScore!: number;

    @Column("text", { array: true })
    keyStrengths!: string[];

    @Column("text", { array: true })
    areasForImprovement!: string[];

    @Column("text", { array: true })
    notableContributions!: string[];

    @Column({ type: "text", nullable: true })
    reviewerNotes?: string;

    @CreateDateColumn()
    createdAt!: Date;
}
