import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, User } from 'generated/prisma';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    async user(
        userWhereUniqueInput: Prisma.UserWhereUniqueInput,
    ): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: userWhereUniqueInput,
        });
    }

    async users(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.UserWhereUniqueInput;
        where?: Prisma.UserWhereInput;
        orderBy?: Prisma.UserOrderByWithRelationInput;
    }): Promise<User[]> {
        const { skip, take, cursor, where, orderBy } = params;
        return this.prisma.user.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy,
        });
    }

    async createUser(data: Prisma.UserCreateInput): Promise<User> {
        return this.prisma.user.create({
            data: {
                email: data.email,
                name: data.name,
                password: data.password,
                birthDate: new Date(data.birthDate),
                cep: data.cep,
                estado: data.estado,
                cidade: data.cidade,
                uf: data.uf,
                bairro: data.bairro,
                rua: data.rua,
                numero: data.numero,
                points: data.points,
            },
        });
    }

    async updateUser(params: {
        where: Prisma.UserWhereUniqueInput;
        data: Prisma.UserUpdateInput;
    }): Promise<User> {
        const { where, data } = params;
        if (data.birthDate !== undefined) {
            if (
                typeof data.birthDate === 'string' &&
                /^\d{4}-\d{2}-\d{2}$/.test(data.birthDate.trim())
            ) {
                data.birthDate = new Date(data.birthDate + 'T00:00:00.000Z');
            } else if (
                typeof data.birthDate === 'string' &&
                !/^\d{4}-\d{2}-\d{2}$/.test(data.birthDate.trim())
            ) {
                delete data.birthDate;
            } else if (data.birthDate === '' || data.birthDate === null) {
                delete data.birthDate;
            }
        }
        return this.prisma.user.update({
            data,
            where,
        });
    }

    async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
        return this.prisma.user.delete({
            where,
        });
    }
}
