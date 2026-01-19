"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const typeorm_1 = require("@nestjs/typeorm");
const entities_1 = require("../database/entities");
async function updateUserTypes() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const userRepository = app.get((0, typeorm_1.getRepositoryToken)(entities_1.User));
    const adminRepository = app.get((0, typeorm_1.getRepositoryToken)(entities_1.Admin));
    const tutorRepository = app.get((0, typeorm_1.getRepositoryToken)(entities_1.Tutor));
    const studentRepository = app.get((0, typeorm_1.getRepositoryToken)(entities_1.Student));
    try {
        const users = await userRepository.find({
            where: { user_type: null },
            relations: ['admin_profile', 'tutor_profile', 'student_profile']
        });
        console.log(`Found ${users.length} users without user_type`);
        for (const user of users) {
            let userType = null;
            if (user.admin_profile) {
                userType = 'admin';
            }
            else if (user.tutor_profile) {
                userType = 'tutor';
            }
            else if (user.student_profile) {
                userType = 'tutee';
            }
            if (userType) {
                user.user_type = userType;
                await userRepository.save(user);
                console.log(`Updated user ${user.email} (ID: ${user.user_id}) to type: ${userType}`);
            }
            else {
                console.log(`Warning: User ${user.email} (ID: ${user.user_id}) has no profile - setting as tutee by default`);
                user.user_type = 'tutee';
                await userRepository.save(user);
            }
        }
        console.log('User type update completed successfully');
    }
    catch (error) {
        console.error('Error updating user types:', error);
    }
    finally {
        await app.close();
    }
}
updateUserTypes().catch(console.error);
//# sourceMappingURL=update-user-types.js.map