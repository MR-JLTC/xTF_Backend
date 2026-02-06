import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Post('conversations')
    async createConversation(@Request() req, @Body() body: { targetUserId: number }) {
        // Current user initiates
        return this.chatService.createConversation(req.user.user_id, body.targetUserId);
    }

    @Get('conversations')
    async getConversations(@Request() req) {
        return this.chatService.getConversations(req.user.user_id);
    }

    @Get('conversations/:conversationId/messages')
    async getMessages(@Param('conversationId') conversationId: string) {
        return this.chatService.getMessages(conversationId);
    }
}
