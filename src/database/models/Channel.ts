import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("channels")
export class Channel {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 50, unique: true })
    slackChannelId!: string;

    @Column({ type: "varchar", length: 100 })
    channelName!: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    purpose?: string;

    @Column({ type: "boolean", default: true })
    isActive!: boolean;

    @CreateDateColumn()
    createdAt!: Date;
}
