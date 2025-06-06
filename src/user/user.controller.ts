import {
    Controller,
    Post,
    Body,
    Query,
    Get,
    Patch,
    Request,
    UseGuards,
} from '@nestjs/common';
import { User as UserModel } from 'generated/prisma';
import { UsersService } from './user.service';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UserController {
    constructor(
        private readonly userService: UsersService,
        private readonly authService: AuthService,
    ) {}

    @Post('create')
    async signupUser(
        @Body()
        userData: {
            email: string;
            name: string;
            password: string;
            birthDate: Date;
            cep: string;
            estado: string;
            cidade: string;
            uf: string;
            bairro: string;
            rua: string;
            numero: string;
        },
    ): Promise<Omit<UserModel, 'password'>> {
        const hashedPassword = await this.authService.hashPassword(
            userData.password,
        );
        const user = await this.userService.createUser({
            email: userData.email,
            name: userData.name,
            password: hashedPassword,
            birthDate: userData.birthDate,
            cep: userData.cep,
            estado: userData.estado,
            cidade: userData.cidade,
            uf: userData.uf,
            bairro: userData.bairro,
            rua: userData.rua,
            numero: userData.numero,
            points: 500,
        });
        // Não retorna a senha
        const { password, ...userWithoutPassword } = user;
        void password;
        return userWithoutPassword;
    }

    @Get('all')
    async getUsers(
        @Query('skip') skip?: number,
        @Query('take') take?: number,
    ): Promise<UserModel[]> {
        return this.userService.users({
            skip: skip ? Number(skip) : undefined,
            take: take ? Number(take) : undefined,
        });
    }

    @UseGuards(JwtAuthGuard)
    @Patch('update')
    async updateUserInfo(
        @Request() req,
        @Body()
        updateData: {
            name?: string;
            birthDate?: Date;
            cep?: string;
            estado?: string;
            cidade?: string;
            uf?: string;
            bairro?: string;
            rua?: string;
            numero?: string;
        },
    ) {
        const userId = Number(req.user.userId);
        // Não permite editar email e senha
        return this.userService.updateUser({
            where: { id: userId },
            data: updateData,
        });
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getMe(@Request() req) {
        const userId = Number(req.user.userId);
        const user = await this.userService.user({ id: userId });
        if (!user) return { message: 'Usuário não encontrado' };
        // Não retorna a senha
        const { password, ...userWithoutPassword } = user;
        void password;
        return userWithoutPassword;
    }
}
