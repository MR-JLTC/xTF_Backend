import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrafficLog } from '../database/entities/traffic-log.entity';

@Injectable()
export class TrafficLoggerMiddleware implements NestMiddleware {
    constructor(
        @InjectRepository(TrafficLog)
        private trafficLogRepository: Repository<TrafficLog>,
    ) { }

    async use(req: Request, res: Response, next: NextFunction) {
        // Skip logging for health checks or static files if needed
        if (req.originalUrl.includes('/health') || req.originalUrl.includes('/favicon.ico')) {
            return next();
        }

        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
        const { method, originalUrl, headers } = req;
        const userAgent = headers['user-agent'] || '';

        // Extract potential user from token if already decoded (unlikely at middleware level unless auth is global)
        // But we can check for custom headers or common patterns

        let activity = `Accessed ${method} ${originalUrl}`;

        // Try to make activity more readable
        if (originalUrl.includes('/auth/login')) activity = 'Attempted Login';
        if (originalUrl.includes('/auth/register')) activity = 'Attempted Registration';
        if (originalUrl.includes('/tutors/apply')) activity = 'Tutor Application Started';
        if (originalUrl.includes('/payments/request')) activity = 'Payment Requested';

        const log = this.trafficLogRepository.create({
            ip_address: Array.isArray(ip) ? ip[0] : (ip as string),
            method,
            url: originalUrl,
            user_agent: userAgent,
            activity,
        });

        try {
            // Save asynchronously to not block the request
            this.trafficLogRepository.save(log).catch(err => {
                console.error('Error saving traffic log:', err);
            });
        } catch (e) {
            // Ignore errors in logging to prevent breaking the app
        }

        next();
    }
}
