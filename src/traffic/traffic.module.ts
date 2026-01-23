import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrafficLog } from '../database/entities/traffic-log.entity';
import { TrafficService } from './traffic.service';
import { TrafficController } from './traffic.controller';
import { TrafficLoggerMiddleware } from './traffic-logger.middleware';

@Module({
    imports: [TypeOrmModule.forFeature([TrafficLog])],
    providers: [TrafficService, TrafficLoggerMiddleware],
    controllers: [TrafficController],
    exports: [TrafficService],
})
export class TrafficModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(TrafficLoggerMiddleware)
            .forRoutes({ path: '*', method: RequestMethod.ALL });
    }
}
