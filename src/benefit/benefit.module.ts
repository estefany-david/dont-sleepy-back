import { Module } from '@nestjs/common';
import { BenefitService } from './user.service';
import { PrismaService } from '../prisma.service';
import { AuthModule } from '../auth/auth.module';
import { BenefitController } from './benefit.controller';

@Module({
    imports: [AuthModule],
    controllers: [BenefitController],
    providers: [BenefitService, PrismaService],
    exports: [BenefitService],
})
export class BenefitModule {}
