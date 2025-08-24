import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm"

@Entity('performance_reports')
export class PerformanceReport {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar' })
    userId!: string;

    @Column('jsonb', { nullable: false })
    period!: {
        start: Date;
        end: Date;
    };

    @Column('jsonb', { nullable: false })
    metrics!: {
        averageProductivity: number;
        averageSentiment: number;
        taskCompletionRate: number;
        consistencyScore: number;
        blockerResolutionRate: number;
        communicationScore: number;
    };

    @Column('text', { nullable: false })
    summary!: string;

    @Column('text', { array: true, nullable: false })
    recommendations!: string[];

    @CreateDateColumn()
    createdAt!: Date;
}