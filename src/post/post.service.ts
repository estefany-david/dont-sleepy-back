import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Post, Prisma } from 'generated/prisma';

@Injectable()
export class PostsService {
    constructor(private prisma: PrismaService) {}

    async post(
        postWhereUniqueInput: Prisma.PostWhereUniqueInput,
    ): Promise<Post | null> {
        return await this.prisma.post.findUnique({
            where: postWhereUniqueInput,
        });
    }

    posts(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.PostWhereUniqueInput;
        where?: Prisma.PostWhereInput;
        orderBy?: Prisma.PostOrderByWithRelationInput;
    }): Promise<Post[]> {
        const { skip, take, cursor, where, orderBy } = params;
        return this.prisma.post.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy,
        });
    }

    async createPost(data: Prisma.PostCreateInput): Promise<Post> {
        return await this.prisma.post.create({
            data,
        });
    }

    async updatePost(params: {
        where: Prisma.PostWhereUniqueInput;
        data: Prisma.PostUpdateInput;
    }): Promise<Post> {
        const { data, where } = params;
        return await this.prisma.post.update({
            data,
            where,
        });
    }

    async deletePost(where: Prisma.PostWhereUniqueInput): Promise<Post> {
        return await this.prisma.post.delete({
            where,
        });
    }
}
