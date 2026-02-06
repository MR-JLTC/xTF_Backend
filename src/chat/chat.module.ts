import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Conversation } from '../database/entities/conversation.entity';
import { Message } from '../database/entities/message.entity';
import { User } from '../database/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        TypeOrmModule.forFeature([Conversation, Message, User]),
        AuthModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: '60m' },
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [ChatGateway, ChatService],
    controllers: [ChatController],
})
export class ChatModule { }
