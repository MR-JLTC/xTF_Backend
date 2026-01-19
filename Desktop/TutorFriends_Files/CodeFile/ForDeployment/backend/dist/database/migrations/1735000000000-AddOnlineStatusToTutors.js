"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddOnlineStatusToTutors1735000000000 = void 0;
const typeorm_1 = require("typeorm");
class AddOnlineStatusToTutors1735000000000 {
    async up(queryRunner) {
        await queryRunner.addColumn('tutors', new typeorm_1.TableColumn({
            name: 'activity_status',
            type: 'enum',
            enum: ['online', 'offline'],
            default: "'offline'",
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropColumn('tutors', 'activity_status');
    }
}
exports.AddOnlineStatusToTutors1735000000000 = AddOnlineStatusToTutors1735000000000;
//# sourceMappingURL=1735000000000-AddOnlineStatusToTutors.js.map