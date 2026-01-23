import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrafficLog } from '../database/entities/traffic-log.entity';

@Injectable()
export class TrafficService {
    constructor(
        @InjectRepository(TrafficLog)
        private trafficLogRepository: Repository<TrafficLog>,
    ) { }

    async findAll(limit: number = 100) {
        return this.trafficLogRepository.find({
            order: { timestamp: 'DESC' },
            take: limit,
        });
    }

    async clearLogs() {
        return this.trafficLogRepository.clear();
    }
}
