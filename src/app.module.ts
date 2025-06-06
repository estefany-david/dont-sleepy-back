import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { userModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { SleepModule } from './sleep/sleep.module';
import { BenefitModule } from './benefit/benefit.module';

@Module({
    imports: [userModule, AuthModule, SleepModule, BenefitModule],
    controllers: [AppController],
    providers: [AppService, PrismaService],
})
export class AppModule {}
