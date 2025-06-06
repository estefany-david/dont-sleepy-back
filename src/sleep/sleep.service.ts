import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Sleep } from 'generated/prisma';

@Injectable()
export class SleepService {
    constructor(private prisma: PrismaService) {}

    async createSleep(data: {
        start: Date;
        end: Date;
        userId: number;
    }): Promise<Sleep> {
        const startDate = new Date(data.start);
        const endDate = new Date(data.end);
        const duration = Math.floor(
            (endDate.getTime() - startDate.getTime()) / 1000,
        ); // duração em segundos

        await this.prisma.user.update({
            where: {
                id: data.userId,
            },
            data: {
                points: {
                    increment:
                        duration < 1000 * 60 * 60
                            ? duration * 10
                            : duration / 10,
                },
            },
        });

        return this.prisma.sleep.create({
            data: {
                start: startDate,
                end: endDate,
                duration,
                userId: data.userId,
            },
        });
    }

    async getUserSleeps(userId: number): Promise<Sleep[]> {
        return this.prisma.sleep.findMany({ where: { userId } });
    }

    async getSleepById(id: number, userId: number): Promise<Sleep | null> {
        const numericId = Number(id);
        if (isNaN(numericId) || numericId <= 0) return null;
        const sleep = await this.prisma.sleep.findUnique({
            where: { id: numericId },
        });
        if (!sleep || sleep.userId !== Number(userId)) return null;
        return sleep;
    }

    async updateSleep(
        id: number,
        userId: number,
        data: { start?: Date; end?: Date },
    ): Promise<Sleep | null> {
        const numericId = Number(id);
        if (isNaN(numericId) || numericId <= 0) return null;
        const sleep = await this.getSleepById(numericId, userId);
        if (!sleep) return null;
        const startDate = data.start ? new Date(data.start) : sleep.start;
        const endDate = data.end ? new Date(data.end) : sleep.end;
        const duration = Math.floor(
            (endDate.getTime() - startDate.getTime()) / 1000,
        );
        return this.prisma.sleep.update({
            where: { id: numericId },
            data: { start: startDate, end: endDate, duration },
        });
    }

    async deleteSleep(id: number, userId: number): Promise<Sleep | null> {
        const numericId = Number(id);
        if (isNaN(numericId) || numericId <= 0) return null;
        const sleep = await this.getSleepById(numericId, userId);
        if (!sleep) return null;
        return this.prisma.sleep.delete({ where: { id: numericId } });
    }

    async countUserSleepsInPeriod(
        userId: number,
        start: Date,
        end: Date,
    ): Promise<number> {
        return this.prisma.sleep.count({
            where: {
                userId,
                start: {
                    gte: start,
                    lte: end,
                },
            },
        });
    }

    async countUserSleepsWeekly(
        userId: number,
        referenceDate: Date,
    ): Promise<number> {
        const ref = new Date(referenceDate);
        const day = ref.getDay();
        const diffToMonday = (day + 6) % 7;
        const monday = new Date(ref);
        monday.setDate(ref.getDate() - diffToMonday);
        monday.setHours(0, 0, 0, 0);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);
        return this.countUserSleepsInPeriod(userId, monday, sunday);
    }

    async countUserSleepsMonthly(
        userId: number,
        referenceDate: Date,
    ): Promise<number> {
        const ref = new Date(referenceDate);
        const firstDay = new Date(
            ref.getFullYear(),
            ref.getMonth(),
            1,
            0,
            0,
            0,
            0,
        );
        const lastDay = new Date(
            ref.getFullYear(),
            ref.getMonth() + 1,
            0,
            23,
            59,
            59,
            999,
        );
        return this.countUserSleepsInPeriod(userId, firstDay, lastDay);
    }

    async countUserSleepsYearly(
        userId: number,
        referenceDate: Date,
    ): Promise<number> {
        const ref = new Date(referenceDate);
        const firstDay = new Date(ref.getFullYear(), 0, 1, 0, 0, 0, 0);
        const lastDay = new Date(ref.getFullYear(), 11, 31, 23, 59, 59, 999);
        return this.countUserSleepsInPeriod(userId, firstDay, lastDay);
    }

    async timeSinceLastSleep(
        userId: number,
    ): Promise<{ days: number; hours: number }> {
        const lastSleep = await this.prisma.sleep.findFirst({
            where: { userId },
            orderBy: { end: 'desc' },
        });
        const now = new Date();
        const lastEnd = lastSleep ? new Date(lastSleep.end) : null;
        const diffMs = lastEnd ? now.getTime() - lastEnd.getTime() : 0;
        const diffDays = lastEnd
            ? Math.floor(diffMs / (1000 * 60 * 60 * 24))
            : null;
        const diffHours = lastEnd
            ? Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            : null;
        return {
            days: diffDays ?? 0,
            hours: diffHours ?? 0,
        };
    }

    async getLastMonthSleeps(
        userId: number,
    ): Promise<
        Array<{ date: string; duration: number; start: Date; end: Date }>
    > {
        const now = new Date();
        const firstDay = new Date(
            now.getFullYear(),
            now.getMonth(),
            1,
            0,
            0,
            0,
            0,
        );
        const sleeps = await this.prisma.sleep.findMany({
            where: {
                userId,
                start: {
                    gte: firstDay,
                    lte: now,
                },
            },
            orderBy: { start: 'desc' },
        });
        return sleeps.map((sleep) => ({
            date: sleep.start.toISOString().split('T')[0],
            duration: sleep.duration,
            start: sleep.start,
            end: sleep.end,
        }));
    }
}
