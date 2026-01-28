import { Controller, Get } from '@nestjs/common';
import * as net from 'net';
import { URL } from 'url';

@Controller('debug')
export class DebugController {
    @Get('db-check')
    async checkDbConnection() {
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) {
            return { status: 'error', message: 'DATABASE_URL not set' };
        }

        try {
            // Parse DATABASE_URL to get host
            // Format: postgres://user:pass@host:port/db
            const parsed = new URL(dbUrl);
            const host = parsed.hostname;

            const results = {
                host,
                port5432: await this.checkPort(host, 5432),
                port6543: await this.checkPort(host, 6543),
                recommendation: ''
            };

            if (results.port5432 === 'OPEN' && results.port6543 === 'CLOSED') {
                results.recommendation = 'Port 6543 is blocked. Change DATABASE_URL to use port 5432.';
            } else if (results.port6543 === 'OPEN') {
                results.recommendation = 'Port 6543 is open. Connection should work if SSL is configured correctly.';
            } else {
                results.recommendation = 'Both ports blocked. Check if Supabase project is PAUSED or Network Restrictions are active.';
            }

            return results;
        } catch (error) {
            return { status: 'error', message: 'Failed to parse DATABASE_URL', error: error.message };
        }
    }

    private checkPort(host: string, port: number): Promise<string> {
        return new Promise((resolve) => {
            const socket = new net.Socket();
            const timeout = 3000; // 3 seconds timeout

            socket.setTimeout(timeout);

            socket.on('connect', () => {
                socket.destroy();
                resolve('OPEN');
            });

            socket.on('timeout', () => {
                socket.destroy();
                resolve('TIMEOUT');
            });

            socket.on('error', (err) => {
                socket.destroy();
                resolve(`CLOSED (${err.message})`);
            });

            socket.connect(port, host);
        });
    }
}
