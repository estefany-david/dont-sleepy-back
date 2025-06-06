import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { BenefitService } from './user.service';

@Controller('benefit')
export class BenefitController {
    constructor(
        private readonly benefitService: BenefitService,
        private readonly authService: AuthService,
    ) {}

    @Post('create')
    async signupUser(
        @Body()
        data: {
            id: number;
            benefit: string;
            cost: number;
            userId: number;
        },
    ) {
        await this.benefitService.useBenefit(data);
    }
}
