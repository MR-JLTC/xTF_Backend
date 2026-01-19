"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddBookingIdToNotifications1683470000000 = void 0;
const typeorm_1 = require("typeorm");
class AddBookingIdToNotifications1683470000000 {
    async up(queryRunner) {
        await queryRunner.addColumn('notifications', new typeorm_1.TableColumn({
            name: 'booking_id',
            type: 'int',
            isNullable: true,
        }));
        await queryRunner.createForeignKey('notifications', new typeorm_1.TableForeignKey({
            columnNames: ['booking_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'booking_requests',
            onDelete: 'CASCADE',
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropForeignKey('notifications', 'booking_id');
        await queryRunner.dropColumn('notifications', 'booking_id');
    }
}
exports.AddBookingIdToNotifications1683470000000 = AddBookingIdToNotifications1683470000000;
//# sourceMappingURL=1683470000000-AddBookingIdToNotifications.js.map