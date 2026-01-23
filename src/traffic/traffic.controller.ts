import { Controller, Get, Delete, Query, UseGuards } from '@nestjs/common';
import { TrafficService } from './traffic.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('traffic')
@UseGuards(JwtAuthGuard)
export class TrafficController {
    constructor(private readonly trafficService: TrafficService) { }

    @Get('logs')
    async getLogs(@Query('limit') limit: string) {
        return this.trafficService.findAll(limit ? parseInt(limit) : 100);
    }

    @Delete('logs')
    async clearLogs() {
        await this.trafficService.clearLogs();
        return { message: 'Traffic logs cleared successfully' };
    }
}
