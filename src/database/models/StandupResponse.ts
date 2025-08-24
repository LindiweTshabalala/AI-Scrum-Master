import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm"

@Entity('standup_responses')
export class StandupResponse {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar' })
    userId!: string;

    @Column({ type: 'varchar' })
    username!: string;

    @Column({ type: 'varchar' })
    teamId!: string;

    @CreateDateColumn()
    date!: Date;

    @Column('jsonb', { nullable: false })
    response!: {
        yesterday: string;
        today: string;
        blockers: string;
    };

    @Column('decimal', { precision: 3, scale: 2, default: 0 })
    sentiment!: number;

    @Column('decimal', { precision: 3, scale: 2, default: 0 })
    productivity!: number;

    @Column('text', { nullable: true })
    aiSummary!: string;

    @Column('jsonb', { nullable: false })
    metrics!: {
        taskCompletion: number;
        blockersResolved: boolean;
        responseTime: number;
        detailLevel: number;
    };
}