import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class BenefitService {
    constructor(private prisma: PrismaService) {}

    async useBenefit(data: {
        id: number;
        benefit: string;
        cost: number;
        userId: number;
    }) {
        await this.prisma.user.update({
            where: {
                id: data.userId,
            },
            data: {
                points: { decrement: data.cost },
            },
        });

        await this.prisma.userBenefits.create({
            data,
        });
    }
}
