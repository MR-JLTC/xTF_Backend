"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TutorsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../database/entities");
const email_service_1 = require("../email/email.service");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
let TutorsService = class TutorsService {
    constructor(tutorsRepository, usersRepository, coursesRepository, universitiesRepository, documentsRepository, availabilityRepository, tutorSubjectRepository, tutorSubjectDocumentRepository, subjectRepository, subjectApplicationRepository, subjectApplicationDocumentRepository, bookingRequestRepository, notificationRepository, paymentRepository, payoutRepository, studentRepository, emailService) {
        this.tutorsRepository = tutorsRepository;
        this.usersRepository = usersRepository;
        this.coursesRepository = coursesRepository;
        this.universitiesRepository = universitiesRepository;
        this.documentsRepository = documentsRepository;
        this.availabilityRepository = availabilityRepository;
        this.tutorSubjectRepository = tutorSubjectRepository;
        this.tutorSubjectDocumentRepository = tutorSubjectDocumentRepository;
        this.subjectRepository = subjectRepository;
        this.subjectApplicationRepository = subjectApplicationRepository;
        this.subjectApplicationDocumentRepository = subjectApplicationDocumentRepository;
        this.bookingRequestRepository = bookingRequestRepository;
        this.notificationRepository = notificationRepository;
        this.paymentRepository = paymentRepository;
        this.payoutRepository = payoutRepository;
        this.studentRepository = studentRepository;
        this.emailService = emailService;
    }
    findPendingApplications() {
        return this.tutorsRepository.find({
            where: { status: 'pending' },
            relations: [
                'user',
                'university',
                'course',
                'documents',
                'subjects',
                'subjects.subject',
                'availabilities'
            ],
        });
    }
    async updateStatus(id, status, adminNotes) {
        const tutor = await this.tutorsRepository.findOne({
            where: { tutor_id: id },
            relations: ['user']
        });
        if (!tutor) {
            throw new common_1.NotFoundException(`Tutor with ID ${id} not found`);
        }
        tutor.status = status;
        let adminNotesToSave = null;
        if (status === 'rejected') {
            if (adminNotes !== undefined && adminNotes !== null && adminNotes.trim().length > 0) {
                const trimmedNotes = adminNotes.trim();
                adminNotesToSave = trimmedNotes;
                tutor.admin_notes = adminNotesToSave;
                console.log(`[TutorService] REJECTION - Admin notes received: "${adminNotes}"`);
                console.log(`[TutorService] REJECTION - Trimmed admin notes to save: "${adminNotesToSave}"`);
                console.log(`[TutorService] REJECTION - Setting tutor.admin_notes property = "${adminNotesToSave}"`);
                console.log(`[TutorService] REJECTION - This MUST be saved to tutors.admin_notes column in database`);
            }
            else {
                console.error(`[TutorService] ERROR: Rejecting tutor ${id} but adminNotes is missing or empty!`);
                console.error(`[TutorService] Received adminNotes:`, adminNotes);
                console.error(`[TutorService] This should not happen - modal should require rejection reason.`);
            }
        }
        else if (adminNotes !== undefined && adminNotes !== null) {
            const trimmedNotes = adminNotes.trim();
            adminNotesToSave = trimmedNotes.length > 0 ? trimmedNotes : null;
            tutor.admin_notes = adminNotesToSave;
            console.log(`[TutorService] Admin notes provided for ${status}: "${adminNotesToSave || 'null'}"`);
        }
        console.log(`[TutorService] BEFORE SAVE - tutor.admin_notes = "${tutor.admin_notes || 'null'}"`);
        let savedTutor = await this.tutorsRepository.save(tutor);
        console.log(`[TutorService] AFTER SAVE - savedTutor.admin_notes = "${savedTutor.admin_notes || 'null'}"`);
        if (status === 'rejected') {
            if (adminNotesToSave !== null) {
                const updateResult = await this.tutorsRepository.update({ tutor_id: id }, { admin_notes: adminNotesToSave });
                console.log(`[TutorService] Explicitly updated tutors.admin_notes column using update() method`);
                console.log(`[TutorService] Update result affected rows:`, updateResult.affected);
                console.log(`[TutorService] Value saved: "${adminNotesToSave}"`);
                const reloadedTutor = await this.tutorsRepository.findOne({
                    where: { tutor_id: id },
                    relations: ['user']
                });
                if (reloadedTutor) {
                    console.log(`[TutorService] VERIFICATION - Reloaded tutor ${id} from database after explicit update:`);
                    console.log(`[TutorService]   - Status: ${reloadedTutor.status}`);
                    console.log(`[TutorService]   - Admin Notes from tutors.admin_notes column:`, reloadedTutor.admin_notes ? `"${reloadedTutor.admin_notes}"` : 'NULL');
                    if (!reloadedTutor.admin_notes || reloadedTutor.admin_notes !== adminNotesToSave) {
                        console.error(`[TutorService] ERROR: Admin notes NOT saved correctly!`);
                        console.error(`[TutorService] Expected: "${adminNotesToSave}"`);
                        console.error(`[TutorService] Actual from DB: "${reloadedTutor.admin_notes || 'NULL'}"`);
                    }
                    else {
                        console.log(`[TutorService] SUCCESS: Admin notes verified in database!`);
                    }
                    savedTutor = reloadedTutor;
                }
            }
            else {
                console.error(`[TutorService] ERROR: Cannot update admin_notes - adminNotesToSave is null for rejected status!`);
            }
        }
        console.log(`[TutorService] FINAL VERIFICATION - Tutor ${id} in database:`);
        console.log(`[TutorService]   - Status: '${savedTutor.status}'`);
        console.log(`[TutorService]   - Admin Notes (tutors.admin_notes column):`, savedTutor.admin_notes
            ? `"${savedTutor.admin_notes.substring(0, 100)}${savedTutor.admin_notes.length > 100 ? '...' : ''}"`
            : 'NULL');
        if (status === 'approved') {
            const user = tutor.user;
            if (user) {
                await this.usersRepository.save(user);
            }
            try {
                await this.emailService.sendTutorApplicationApprovalEmail({
                    name: user?.name || 'Tutor',
                    email: user?.email || '',
                });
            }
            catch (error) {
                console.error('Failed to send tutor application approval email:', error);
            }
        }
        else if (status === 'rejected') {
            const notesForEmail = savedTutor.admin_notes && savedTutor.admin_notes.trim().length > 0
                ? savedTutor.admin_notes.trim()
                : undefined;
            console.log(`[TutorService] Sending rejection email to ${tutor.user?.email}`);
            console.log(`[TutorService] Admin notes from database (admin_notes column):`, notesForEmail ? `"${notesForEmail.substring(0, 50)}${notesForEmail.length > 50 ? '...' : ''}"` : 'none');
            try {
                await this.emailService.sendTutorApplicationRejectionEmail({
                    name: tutor.user?.name || 'Tutor',
                    email: tutor.user?.email || '',
                    adminNotes: notesForEmail,
                });
                console.log(`[TutorService] Rejection email sent successfully to ${tutor.user?.email}`);
            }
            catch (error) {
                console.error('[TutorService] Failed to send tutor application rejection email:', error);
            }
        }
        return savedTutor;
    }
    async getTutorByEmail(email) {
        const user = await this.usersRepository.findOne({
            where: { email },
            relations: ['tutor_profile', 'student_profile', 'admin_profile']
        });
        if (!user) {
            throw new Error('User not found with this email');
        }
        let userType = 'unknown';
        let tutorId = null;
        if (user.tutor_profile) {
            userType = 'tutor';
            tutorId = user.tutor_profile.tutor_id;
        }
        else if (user.student_profile) {
            userType = 'student';
        }
        else if (user.admin_profile) {
            userType = 'admin';
        }
        return {
            tutor_id: tutorId,
            user_id: user.user_id,
            user_type: userType
        };
    }
    async updateExistingUserToTutor(userId, data) {
        const user = await this.usersRepository.findOne({
            where: { user_id: userId },
            relations: ['tutor_profile', 'tutor_profile.university', 'tutor_profile.course']
        });
        if (!user) {
            throw new Error('User not found');
        }
        if (data.full_name) {
            user.name = data.full_name;
        }
        await this.usersRepository.save(user);
        let tutor = user.tutor_profile;
        if (!tutor) {
            tutor = this.tutorsRepository.create({ user: user });
        }
        if (data.university_id) {
            const university = await this.universitiesRepository.findOne({ where: { university_id: data.university_id } });
            if (!university)
                throw new common_1.BadRequestException('Invalid university ID');
            tutor.university = university;
            tutor.university_id = university.university_id;
        }
        let resolvedCourseId = data.course_id ?? null;
        if (!resolvedCourseId && data.course_name && data.course_name.trim().length > 0) {
            const uni = tutor.university || await this.universitiesRepository.findOne({ where: { university_id: tutor.university_id } });
            if (uni) {
                const existingCourse = await this.coursesRepository.findOne({
                    where: { course_name: data.course_name.trim(), university: { university_id: uni.university_id } },
                    relations: ['university']
                });
                if (existingCourse) {
                    resolvedCourseId = existingCourse.course_id;
                }
                else {
                    const newCourse = this.coursesRepository.create({
                        course_name: data.course_name.trim(),
                        university: uni
                    });
                    const savedCourse = await this.coursesRepository.save(newCourse);
                    resolvedCourseId = savedCourse.course_id;
                }
            }
        }
        if (resolvedCourseId) {
            const course = await this.coursesRepository.findOne({ where: { course_id: resolvedCourseId } });
            tutor.course = course;
            tutor.course_id = course.course_id;
        }
        if (data.bio !== undefined) {
            tutor.bio = data.bio;
        }
        if (data.year_level !== undefined) {
            tutor.year_level = Number(data.year_level);
        }
        if (data.gcash_number !== undefined) {
            tutor.gcash_number = data.gcash_number;
        }
        tutor.status = 'pending';
        const savedTutor = await this.tutorsRepository.save(tutor);
        return { success: true, tutor_id: savedTutor.tutor_id };
    }
    async updateTutor(tutorId, data) {
        const tutor = await this.tutorsRepository.findOne({
            where: { tutor_id: tutorId },
            relations: ['user', 'university', 'course']
        });
        if (!tutor) {
            throw new Error('Tutor not found');
        }
        if (data.full_name) {
            tutor.user.name = data.full_name;
            await this.usersRepository.save(tutor.user);
        }
        if (data.university_id) {
            const university = await this.universitiesRepository.findOne({ where: { university_id: data.university_id } });
            if (!university)
                throw new common_1.BadRequestException('Invalid university ID');
            tutor.university = university;
            tutor.university_id = university.university_id;
        }
        let resolvedCourseId = data.course_id ?? null;
        if (!resolvedCourseId && data.course_name && data.course_name.trim().length > 0) {
            const uni = tutor.university || await this.universitiesRepository.findOne({ where: { university_id: tutor.university_id } });
            if (uni) {
                const existingCourse = await this.coursesRepository.findOne({
                    where: { course_name: data.course_name.trim(), university: { university_id: uni.university_id } },
                    relations: ['university']
                });
                if (existingCourse) {
                    resolvedCourseId = existingCourse.course_id;
                }
                else {
                    const newCourse = this.coursesRepository.create({
                        course_name: data.course_name.trim(),
                        university: uni
                    });
                    const savedCourse = await this.coursesRepository.save(newCourse);
                    resolvedCourseId = savedCourse.course_id;
                }
            }
        }
        if (resolvedCourseId) {
            const course = await this.coursesRepository.findOne({ where: { course_id: resolvedCourseId } });
            tutor.course = course;
            tutor.course_id = course.course_id;
        }
        if (data.bio !== undefined) {
            tutor.bio = data.bio;
        }
        if (data.year_level !== undefined) {
            tutor.year_level = Number(data.year_level);
        }
        if (data.gcash_number !== undefined) {
            tutor.gcash_number = data.gcash_number;
        }
        if (data.session_rate_per_hour !== undefined) {
            tutor.session_rate_per_hour = data.session_rate_per_hour;
        }
        await this.tutorsRepository.save(tutor);
        return { success: true };
    }
    async applyTutor(data) {
        const existing = await this.usersRepository.findOne({ where: { email: data.email } });
        if (existing) {
            throw new Error('Email already registered');
        }
        const hashed = await bcrypt.hash(data.password, 10);
        let resolvedCourseId = data.course_id ?? null;
        let universityEntity;
        let courseEntity;
        if (data.university_id) {
            universityEntity = await this.universitiesRepository.findOne({ where: { university_id: data.university_id } });
            if (!universityEntity) {
                throw new common_1.BadRequestException('Invalid university ID');
            }
        }
        if (!resolvedCourseId && data.course_name && data.course_name.trim().length > 0 && universityEntity) {
            const existingCourse = await this.coursesRepository.findOne({ where: { course_name: data.course_name.trim(), university: { university_id: universityEntity.university_id } }, relations: ['university'] });
            if (existingCourse) {
                resolvedCourseId = existingCourse.course_id;
            }
            else {
                const newCourse = this.coursesRepository.create({ course_name: data.course_name.trim(), university: universityEntity });
                const savedCourse = await this.coursesRepository.save(newCourse);
                resolvedCourseId = savedCourse.course_id;
            }
        }
        if (resolvedCourseId) {
            courseEntity = await this.coursesRepository.findOne({ where: { course_id: resolvedCourseId } });
        }
        const user = this.usersRepository.create({
            name: data.name && data.name.trim().length > 0 ? data.name : data.email.split('@')[0],
            email: data.email,
            password: hashed,
            user_type: 'tutor',
            status: 'active',
        });
        const savedUser = await this.usersRepository.save(user);
        const tutor = this.tutorsRepository.create({
            user: savedUser,
            bio: (data.bio || '').trim(),
            status: 'pending',
            gcash_qr_url: `/tutor_documents/gcashQR_${savedUser.user_id}`,
            year_level: Number(data.year_level) || undefined,
            gcash_number: data.gcash_number || '',
            ...(universityEntity && { university: universityEntity, university_id: universityEntity.university_id }),
            ...(courseEntity && { course: courseEntity, course_id: courseEntity.course_id }),
        });
        const savedTutor = await this.tutorsRepository.save(tutor);
        return { success: true, user_id: savedUser.user_id, tutor_id: savedTutor.tutor_id };
    }
    async getDocuments(tutorId) {
        const tutor = await this.tutorsRepository.findOne({ where: { tutor_id: tutorId } });
        if (!tutor)
            throw new common_1.NotFoundException('Tutor not found');
        const documents = await this.documentsRepository.find({
            where: { tutor: { tutor_id: tutorId } },
            order: { document_id: 'DESC' }
        });
        return documents.map(doc => ({
            id: doc.document_id,
            document_id: doc.document_id,
            file_url: doc.file_url,
            file_name: doc.file_name,
            file_type: doc.file_type
        }));
    }
    async saveDocuments(tutorId, files) {
        const tutor = await this.tutorsRepository.findOne({ where: { tutor_id: tutorId } });
        if (!tutor)
            throw new Error('Tutor not found');
        const toSave = files.map((f) => this.documentsRepository.create({
            tutor,
            file_url: `/tutor_documents/${f.filename}`,
            file_name: f.filename,
            file_type: f.mimetype,
        }));
        await this.documentsRepository.save(toSave);
        return { success: true };
    }
    async saveProfileImage(tutorId, file) {
        let tutor = await this.tutorsRepository.findOne({ where: { tutor_id: tutorId }, relations: ['user'] });
        if (!tutor) {
            tutor = await this.tutorsRepository.findOne({ where: { user: { user_id: tutorId } }, relations: ['user'] });
        }
        if (!tutor)
            throw new Error('Tutor not found');
        if (!file) {
            const userId = tutor.user.user_id;
            const placeholderUrl = `/user_profile_images/userProfile_${userId}`;
            await this.usersRepository.update({ user_id: userId }, { profile_image_url: placeholderUrl });
            return { success: true, profile_image_url: placeholderUrl };
        }
        const userId = tutor.user.user_id;
        const ext = path.extname(file.filename);
        const newFilename = `userProfile_${userId}${ext}`;
        const oldPath = path.join(process.cwd(), 'tutor_documents', file.filename);
        const newPath = path.join(process.cwd(), 'user_profile_images', newFilename);
        const targetDir = path.join(process.cwd(), 'user_profile_images');
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }
        try {
            fs.renameSync(oldPath, newPath);
            console.log(`Renamed profile image from ${file.filename} to ${newFilename}`);
        }
        catch (error) {
            console.error('Error renaming profile image file:', error);
            throw new Error('Failed to save profile image');
        }
        const fileUrl = `/user_profile_images/${newFilename}`;
        await this.usersRepository.update({ user_id: userId }, { profile_image_url: fileUrl });
        await this.deleteOldProfileImages(userId);
        return { success: true, profile_image_url: fileUrl };
    }
    async saveGcashQR(tutorId, file) {
        let tutor = await this.tutorsRepository.findOne({ where: { tutor_id: tutorId }, relations: ['user'] });
        if (!tutor) {
            tutor = await this.tutorsRepository.findOne({ where: { user: { user_id: tutorId } }, relations: ['user'] });
        }
        if (!tutor)
            throw new Error('Tutor not found');
        if (!file) {
            const userId = tutor.user.user_id;
            const placeholderUrl = `/tutor_documents/gcashQR_${userId}`;
            await this.tutorsRepository.update({ tutor_id: tutor.tutor_id }, { gcash_qr_url: placeholderUrl });
            return { success: true, gcash_qr_url: placeholderUrl };
        }
        const userId = tutor.user.user_id;
        const ext = path.extname(file.filename);
        const newFilename = `gcashQR_${userId}${ext}`;
        const oldPath = path.join(process.cwd(), 'tutor_documents', file.filename);
        const newPath = path.join(process.cwd(), 'tutor_documents', newFilename);
        try {
            fs.renameSync(oldPath, newPath);
            console.log(`Renamed GCash QR from ${file.filename} to ${newFilename}`);
        }
        catch (error) {
            console.error('Error renaming GCash QR file:', error);
            throw new Error('Failed to save GCash QR');
        }
        const fileUrl = `/tutor_documents/${newFilename}`;
        await this.tutorsRepository.update({ tutor_id: tutor.tutor_id }, { gcash_qr_url: fileUrl });
        await this.deleteOldGcashQRFiles(userId);
        return { success: true, gcash_qr_url: fileUrl };
    }
    async saveAvailability(tutorIdOrUserId, slots) {
        let tutor = await this.tutorsRepository.findOne({ where: { tutor_id: tutorIdOrUserId }, relations: ['user'] });
        if (!tutor) {
            tutor = await this.tutorsRepository.findOne({ where: { user: { user_id: tutorIdOrUserId } }, relations: ['user'] });
        }
        if (!tutor)
            throw new Error('Tutor not found');
        await this.availabilityRepository.delete({ tutor: { tutor_id: tutor.tutor_id } });
        const entities = slots.map(s => this.availabilityRepository.create({ tutor, day_of_week: s.day_of_week, start_time: s.start_time, end_time: s.end_time }));
        await this.availabilityRepository.save(entities);
        return { success: true };
    }
    async saveSubjects(tutorId, subjectNames, providedCourseId) {
        const tutor = await this.tutorsRepository.findOne({ where: { tutor_id: tutorId }, relations: ['user'] });
        if (!tutor)
            throw new Error('Tutor not found');
        const tutorCourseId = tutor.course_id;
        if (providedCourseId && tutorCourseId && providedCourseId !== tutorCourseId) {
            throw new Error(`Course ID mismatch: Provided course_id (${providedCourseId}) does not match tutor's course_id (${tutorCourseId}).`);
        }
        const effectiveCourseId = providedCourseId || tutorCourseId;
        let courseEntity;
        if (effectiveCourseId) {
            courseEntity = await this.coursesRepository.findOne({ where: { course_id: effectiveCourseId } });
            if (!courseEntity) {
                throw new Error(`Course with ID ${effectiveCourseId} not found.`);
            }
        }
        const toCreate = [];
        for (const rawName of subjectNames) {
            const name = (rawName || '').trim();
            if (!name)
                continue;
            let subject = null;
            if (courseEntity) {
                subject = await this.subjectRepository.findOne({
                    where: {
                        subject_name: name,
                        course: { course_id: courseEntity.course_id }
                    },
                    relations: ['course']
                });
                if (!subject) {
                    const existingWithDifferentCourse = await this.subjectRepository.findOne({
                        where: { subject_name: name },
                        relations: ['course']
                    });
                    if (existingWithDifferentCourse) {
                        const existingCourseId = existingWithDifferentCourse.course?.course_id;
                        if (existingCourseId && existingCourseId !== courseEntity.course_id) {
                            console.log(`Subject "${name}" exists in course_id ${existingCourseId}, creating new subject for course_id ${courseEntity.course_id}`);
                            const created = this.subjectRepository.create({
                                subject_name: name,
                                course: courseEntity
                            });
                            subject = await this.subjectRepository.save(created);
                            subject = await this.subjectRepository.findOne({
                                where: { subject_id: subject.subject_id },
                                relations: ['course']
                            }) || subject;
                            console.log(`Created new subject "${name}" with course_id ${subject?.course?.course_id || courseEntity.course_id}, subject_id: ${subject.subject_id} (duplicate name allowed for different course)`);
                        }
                        else if (!existingCourseId) {
                            existingWithDifferentCourse.course = courseEntity;
                            subject = await this.subjectRepository.save(existingWithDifferentCourse);
                            subject = await this.subjectRepository.findOne({
                                where: { subject_id: subject.subject_id },
                                relations: ['course']
                            }) || subject;
                            console.log(`Updated existing subject "${name}" to have course_id ${subject?.course?.course_id || courseEntity.course_id}, subject_id: ${subject.subject_id}`);
                        }
                    }
                    else {
                        const created = this.subjectRepository.create({
                            subject_name: name,
                            course: courseEntity
                        });
                        subject = await this.subjectRepository.save(created);
                        subject = await this.subjectRepository.findOne({
                            where: { subject_id: subject.subject_id },
                            relations: ['course']
                        }) || subject;
                        console.log(`Created new subject "${name}" with course_id ${subject?.course?.course_id || courseEntity.course_id}, subject_id: ${subject.subject_id}`);
                    }
                }
            }
            else {
                subject = await this.subjectRepository.findOne({ where: { subject_name: name } });
                if (!subject) {
                    const created = this.subjectRepository.create({ subject_name: name });
                    subject = await this.subjectRepository.save(created);
                    console.log(`Created new subject "${name}" without course, subject_id: ${subject.subject_id}`);
                }
                else {
                    subject = await this.subjectRepository.findOne({
                        where: { subject_id: subject.subject_id },
                        relations: ['course']
                    }) || subject;
                    console.log(`Found existing subject "${name}" without course, subject_id: ${subject.subject_id}`);
                }
            }
            if (effectiveCourseId && subject) {
                const subjectCourseId = subject.course?.course_id;
                if (subjectCourseId && subjectCourseId !== effectiveCourseId) {
                    throw new Error(`Subject "${name}" belongs to course ID ${subjectCourseId}, but tutor is registered with course ID ${effectiveCourseId}. Cannot associate subject from different course.`);
                }
            }
            const link = this.tutorSubjectRepository.create({
                tutor,
                subject,
                status: 'pending'
            });
            toCreate.push(link);
            console.log(`Created TutorSubject link for tutor_id ${tutorId}, subject_id ${subject.subject_id}, subject_name "${name}"`);
        }
        const deleteResult = await this.tutorSubjectRepository.delete({ tutor: { tutor_id: tutorId } });
        console.log(`Deleted ${deleteResult.affected || 0} existing TutorSubject entries for tutor_id ${tutorId}`);
        const savedTutorSubjects = await this.tutorSubjectRepository.save(toCreate);
        console.log(`Saved ${savedTutorSubjects.length} TutorSubject entries for tutor_id ${tutorId}`);
        savedTutorSubjects.forEach((ts, idx) => {
            console.log(`  TutorSubject[${idx}]: tutor_subject_id=${ts.tutor_subject_id}, subject_id=${ts.subject?.subject_id || 'N/A'}, subject_name="${subjectNames[idx]}"`);
        });
        return {
            success: true,
            subjects_saved: savedTutorSubjects.length,
            tutor_subject_ids: savedTutorSubjects.map(ts => ts.tutor_subject_id)
        };
    }
    async createBookingRequest(tutorId, studentUserId, data) {
        const tutor = await this.tutorsRepository.findOne({ where: { tutor_id: tutorId }, relations: ['user'] });
        if (!tutor)
            throw new common_1.NotFoundException('Tutor not found');
        const student = await this.usersRepository.findOne({ where: { user_id: studentUserId } });
        if (!student)
            throw new common_1.NotFoundException('Student not found');
        if (!data.subject || !data.date || !data.time || !data.duration) {
            throw new common_1.BadRequestException('Missing required booking fields');
        }
        const parseTimeToMinutes = (t) => {
            const parts = t.split(':').map(p => parseInt(p, 10));
            if (isNaN(parts[0]))
                return NaN;
            const minutes = (parts[0] || 0) * 60 + (parts[1] || 0);
            return minutes;
        };
        const requestedStart = parseTimeToMinutes(data.time);
        const requestedEnd = requestedStart + Math.round(Number(data.duration) * 60);
        if (isNaN(requestedStart) || requestedStart < 0)
            throw new common_1.BadRequestException('Invalid time format');
        const requestedDate = new Date(data.date);
        if (isNaN(requestedDate.getTime()))
            throw new common_1.BadRequestException('Invalid date');
        const dowMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayOfWeek = dowMap[requestedDate.getDay()];
        const availabilities = await this.availabilityRepository.find({ where: { tutor: { tutor_id: tutor.tutor_id } } });
        const availForDay = availabilities.filter(a => (a.day_of_week || '').toLowerCase() === dayOfWeek.toLowerCase());
        if (!availForDay || availForDay.length === 0) {
            throw new common_1.BadRequestException('Tutor has no availability on the requested day');
        }
        const fitsInAvailability = availForDay.some(a => {
            const aStart = parseTimeToMinutes(a.start_time);
            const aEnd = parseTimeToMinutes(a.end_time);
            if (isNaN(aStart) || isNaN(aEnd))
                return false;
            return requestedStart >= aStart && requestedEnd <= aEnd;
        });
        if (!fitsInAvailability) {
            throw new common_1.BadRequestException('Requested time is outside tutor availability');
        }
        const existing = await this.bookingRequestRepository.find({ where: { tutor: { tutor_id: tutor.tutor_id }, date: requestedDate } });
        const blockingStatuses = ['pending', 'accepted', 'awaiting_payment', 'confirmed'];
        const hasConflict = existing.some((e) => {
            if (!blockingStatuses.includes(e.status))
                return false;
            const eStart = parseTimeToMinutes(e.time);
            const eEnd = eStart + Math.round(Number(e.duration) * 60);
            return requestedStart < eEnd && eStart < requestedEnd;
        });
        if (hasConflict) {
            throw new common_1.BadRequestException('Requested time conflicts with an existing booking');
        }
        const entity = this.bookingRequestRepository.create({
            tutor,
            student,
            subject: data.subject,
            date: requestedDate,
            time: data.time,
            duration: Number(data.duration),
            student_notes: data.student_notes || null,
            status: 'pending',
        });
        console.log(`createBookingRequest: About to save booking with tutor_id=${tutor.tutor_id}, tutor entity:`, {
            tutor_id: tutor.tutor_id,
            has_tutor: !!entity.tutor,
            tutor_object: entity.tutor ? { tutor_id: entity.tutor.tutor_id } : 'missing'
        });
        const saved = await this.bookingRequestRepository.save(entity);
        const verifyBooking = await this.bookingRequestRepository.findOne({
            where: { id: saved.id },
            relations: ['tutor', 'student']
        });
        console.log(`createBookingRequest: saved booking id=${saved.id} tutor_id=${tutor.tutor_id} tutor_user_id=${tutor.user?.user_id} student_user_id=${student?.user_id}`);
        console.log(`createBookingRequest: booking details:`, {
            id: saved.id,
            subject: saved.subject,
            date: saved.date,
            time: saved.time,
            status: saved.status,
            tutor_id: tutor.tutor_id,
            student_id: student?.user_id,
            verified_tutor_id: verifyBooking?.tutor?.tutor_id || verifyBooking?.tutor_id || 'NOT FOUND'
        });
        const studentUserName = student?.name || 'A student';
        const tutorNotification = this.notificationRepository.create({
            userId: tutor.user?.user_id?.toString(),
            receiver_id: tutor.user?.user_id,
            userType: 'tutor',
            message: `${studentUserName} has requested a booking for ${data.subject}`,
            timestamp: new Date(),
            read: false,
            sessionDate: data.date,
            subjectName: data.subject,
            booking: saved
        });
        try {
            console.log(`createBookingRequest: Saving notification for tutor user_id=${tutor.user?.user_id}`);
            const savedNotif = await this.notificationRepository.save(tutorNotification);
            console.log(`createBookingRequest: Notification saved id=${savedNotif?.notification_id}`);
        }
        catch (err) {
            console.error('createBookingRequest: Failed to save tutor notification', err);
        }
        return { success: true, bookingId: saved.id };
    }
    async getStudentBookingRequests(studentUserId) {
        const student = await this.usersRepository.findOne({ where: { user_id: studentUserId } });
        if (!student)
            throw new common_1.NotFoundException('Student not found');
        const requests = await this.bookingRequestRepository.find({
            where: { student: { user_id: studentUserId } },
            relations: ['tutor', 'tutor.user', 'payments'],
            order: { created_at: 'DESC' }
        });
        try {
            console.log(`getStudentBookingRequests: returning ${requests.length} bookings for student_user_id=${studentUserId}`);
            requests.forEach(r => console.log(`  booking id=${r.id} status=${r.status} tutee_rating=${r.tutee_rating}`));
        }
        catch (e) {
        }
        return requests;
    }
    async getTutorStatus(idParam) {
        console.log(`[getTutorStatus] 🔍 Starting status check for ID: ${idParam}`);
        const rawQuery = await this.tutorsRepository.query(`SELECT t.*, u.user_id, u.name 
       FROM tutors t 
       JOIN users u ON t.user_id = u.user_id 
       WHERE u.user_id = $1`, [idParam]);
        console.log('[getTutorStatus] 📝 Raw DB Query Result:', rawQuery);
        let tutor;
        if (rawQuery && rawQuery.length > 0) {
            tutor = rawQuery[0];
            console.log('[getTutorStatus] ✅ Found tutor by user_id in raw query:', {
                tutor_id: tutor.tutor_id,
                user_id: tutor.user_id,
                raw_status: tutor.status
            });
        }
        else {
            console.log(`[getTutorStatus] 🔍 Raw query found nothing, trying repository query...`);
            tutor = await this.tutorsRepository.findOne({
                where: { user: { user_id: idParam } },
                relations: ['user']
            });
            if (!tutor) {
                console.log(`[getTutorStatus] 🔍 Not found by user_id, trying tutor_id: ${idParam}`);
                tutor = await this.tutorsRepository.findOne({
                    where: { tutor_id: idParam },
                    relations: ['user']
                });
            }
        }
        if (!tutor) {
            console.error(`[getTutorStatus] ❌ Tutor not found for either user_id or tutor_id: ${idParam}`);
            throw new common_1.NotFoundException('Tutor not found');
        }
        console.log('[getTutorStatus] 📊 Raw tutor data:', {
            tutor_id: tutor.tutor_id,
            user_id: tutor.user_id || (tutor.user && tutor.user.user_id),
            raw_status: tutor.status,
            status_type: typeof tutor.status
        });
        console.log(`[getTutorStatus] 📊 Raw tutor data from DB:`, {
            tutor_id: tutor.tutor_id,
            user_id: tutor.user_id || (tutor.user && tutor.user.user_id),
            raw_status: tutor.status,
            status_type: typeof tutor.status,
            admin_notes: tutor.admin_notes || 'none'
        });
        const normalizedStatus = String(tutor.status || '').toLowerCase();
        const isApproved = normalizedStatus === 'approved';
        console.log(`[getTutorStatus] 🔄 Status normalization:`, {
            original_status: tutor.status,
            normalized_status: normalizedStatus,
            is_approved: isApproved
        });
        const response = {
            is_verified: isApproved,
            status: normalizedStatus,
            admin_notes: tutor.admin_notes || null
        };
        console.log('[getTutorStatus] ✅ Returning response:', response);
        return response;
    }
    async getTutorId(userId) {
        console.log('Looking for tutor with user_id:', userId);
        const user = await this.usersRepository.findOne({
            where: { user_id: userId },
            relations: ['tutor_profile']
        });
        if (!user || !user.tutor_profile) {
            throw new common_1.NotFoundException('Tutor not found');
        }
        console.log('Found tutor profile for user:', user.tutor_profile.tutor_id);
        return user.tutor_profile.tutor_id;
    }
    async updateOnlineStatus(userId, status) {
        try {
            const tutor = await this.tutorsRepository.findOne({
                where: { user: { user_id: userId } },
                relations: ['user']
            });
            if (!tutor) {
                console.warn(`Tutor not found for user_id: ${userId}`);
                return;
            }
            tutor.activity_status = status;
            await this.tutorsRepository.save(tutor);
            console.log(`Tutor ${tutor.tutor_id} (user_id: ${userId}) online status updated to: ${status}`);
        }
        catch (error) {
            console.error(`Failed to update online status for user_id ${userId}:`, error);
            throw error;
        }
    }
    async getTutorProfile(userId) {
        let tutor = await this.tutorsRepository.findOne({
            where: { tutor_id: userId },
            relations: ['user', 'subjects', 'subjects.subject']
        });
        if (!tutor) {
            tutor = await this.tutorsRepository.findOne({
                where: { user: { user_id: userId } },
                relations: ['user', 'subjects', 'subjects.subject']
            });
        }
        if (!tutor)
            throw new common_1.NotFoundException('Tutor not found');
        const approvedSubjects = tutor.subjects?.filter(ts => ts.status === 'approved') || [];
        return {
            bio: tutor.bio,
            profile_photo: tutor.user.profile_image_url,
            gcash_number: tutor.gcash_number || '',
            gcash_qr: tutor.gcash_qr_url || '',
            session_rate_per_hour: tutor.session_rate_per_hour || null,
            course_id: tutor.course_id || null,
            subjects: approvedSubjects.map(ts => ts.subject?.subject_name || ''),
            rating: 0,
            total_reviews: 0
        };
    }
    async updateTutorProfile(userId, data) {
        const tutor = await this.tutorsRepository.findOne({
            where: { user: { user_id: userId } },
            relations: ['user']
        });
        if (!tutor)
            throw new common_1.NotFoundException('Tutor not found');
        if (data.bio !== undefined)
            tutor.bio = data.bio;
        if (data.gcash_number !== undefined)
            tutor.gcash_number = data.gcash_number;
        await this.tutorsRepository.save(tutor);
        return { success: true };
    }
    async getTutorAvailability(userId) {
        let tutor = await this.tutorsRepository.findOne({
            where: { tutor_id: userId },
            relations: ['user']
        });
        if (!tutor) {
            tutor = await this.tutorsRepository.findOne({
                where: { user: { user_id: userId } },
                relations: ['user']
            });
        }
        if (!tutor)
            throw new common_1.NotFoundException('Tutor not found');
        const availabilities = await this.availabilityRepository.find({
            where: { tutor: { tutor_id: tutor.tutor_id } }
        });
        return availabilities;
    }
    async getSubjectApplications(userId) {
        const tutor = await this.tutorsRepository.findOne({
            where: { user: { user_id: userId } },
            relations: ['user']
        });
        if (!tutor)
            throw new common_1.NotFoundException('Tutor not found');
        return this.getTutorSubjectApplications(tutor.tutor_id);
    }
    async getTutorSubjectApplications(tutorId) {
        const applications = await this.tutorSubjectRepository.find({
            where: { tutor: { tutor_id: tutorId } },
            relations: ['subject', 'documents'],
            order: { created_at: 'DESC' }
        });
        console.log(`Found ${applications.length} subject applications for tutor ${tutorId}`);
        applications.forEach(app => {
            console.log(`Application ${app.tutor_subject_id}: ${app.subject.subject_name} - ${app.status} - Notes: ${app.admin_notes || 'None'}`);
        });
        return applications.map(app => ({
            id: app.tutor_subject_id,
            subject_name: app.subject.subject_name,
            status: app.status,
            admin_notes: app.admin_notes,
            created_at: app.created_at,
            updated_at: app.updated_at,
            documents: app.documents || []
        }));
    }
    async getAllPendingTutorSubjects() {
        const tutorSubjects = await this.tutorSubjectRepository.find({
            where: { status: 'pending' },
            relations: ['tutor', 'tutor.user', 'subject', 'documents'],
            order: { created_at: 'DESC' }
        });
        return tutorSubjects;
    }
    async updateTutorSubjectStatus(tutorSubjectId, status, adminNotes) {
        console.log('Updating tutor subject status:', { tutorSubjectId, status, adminNotes });
        const tutorSubject = await this.tutorSubjectRepository.findOne({
            where: { tutor_subject_id: tutorSubjectId },
            relations: ['tutor', 'tutor.user', 'subject']
        });
        if (!tutorSubject) {
            throw new common_1.NotFoundException('Tutor subject not found');
        }
        tutorSubject.status = status;
        if (adminNotes) {
            tutorSubject.admin_notes = adminNotes;
            console.log('Admin notes saved:', adminNotes);
        }
        else {
            console.log('No admin notes provided');
        }
        const updatedTutorSubject = await this.tutorSubjectRepository.save(tutorSubject);
        if (status === 'approved') {
            try {
                await this.emailService.sendSubjectApprovalEmail({
                    name: tutorSubject.tutor?.user?.name || 'Tutor',
                    email: tutorSubject.tutor?.user?.email || '',
                    subjectName: tutorSubject.subject?.subject_name || 'Subject',
                });
            }
            catch (error) {
                console.error('Failed to send subject approval email:', error);
            }
        }
        else if (status === 'rejected') {
            try {
                await this.emailService.sendSubjectRejectionEmail({
                    name: tutorSubject.tutor?.user?.name || 'Tutor',
                    email: tutorSubject.tutor?.user?.email || '',
                    subjectName: tutorSubject.subject?.subject_name || 'Subject',
                    adminNotes: adminNotes,
                });
            }
            catch (error) {
                console.error('Failed to send subject rejection email:', error);
            }
        }
        return updatedTutorSubject;
    }
    async submitSubjectApplication(tutorId, subjectName, files, isReapplication = false) {
        try {
            console.log('Starting subject application submission:', { tutorId, subjectName, filesCount: files?.length || 0 });
            const tutor = await this.tutorsRepository.findOne({
                where: { tutor_id: tutorId },
                relations: ['user', 'course']
            });
            if (!tutor)
                throw new common_1.NotFoundException('Tutor not found');
            console.log('Tutor found:', tutor.tutor_id);
            const tutorCourseId = tutor.course_id;
            let courseEntity;
            if (tutorCourseId) {
                courseEntity = await this.coursesRepository.findOne({ where: { course_id: tutorCourseId } });
                if (!courseEntity) {
                    throw new Error(`Tutor's course with ID ${tutorCourseId} not found.`);
                }
                console.log('Tutor course found:', courseEntity.course_id, courseEntity.course_name);
            }
            else {
                console.log('Tutor has no course_id assigned');
            }
            const trimmedName = (subjectName || '').trim();
            if (!trimmedName) {
                throw new Error('Subject name cannot be empty');
            }
            let subject = null;
            if (courseEntity) {
                subject = await this.subjectRepository.findOne({
                    where: {
                        subject_name: trimmedName,
                        course: { course_id: courseEntity.course_id }
                    },
                    relations: ['course']
                });
                if (!subject) {
                    const existingWithDifferentCourse = await this.subjectRepository.findOne({
                        where: { subject_name: trimmedName },
                        relations: ['course']
                    });
                    if (existingWithDifferentCourse) {
                        const existingCourseId = existingWithDifferentCourse.course?.course_id;
                        if (existingCourseId && existingCourseId !== courseEntity.course_id) {
                            console.log(`Subject "${trimmedName}" exists in course_id ${existingCourseId}, creating new subject for course_id ${courseEntity.course_id}`);
                            const created = this.subjectRepository.create({
                                subject_name: trimmedName,
                                course: courseEntity
                            });
                            subject = await this.subjectRepository.save(created);
                            subject = await this.subjectRepository.findOne({
                                where: { subject_id: subject.subject_id },
                                relations: ['course']
                            }) || subject;
                            console.log(`Created new subject "${trimmedName}" with course_id ${subject?.course?.course_id || courseEntity.course_id}, subject_id: ${subject.subject_id} (duplicate name allowed for different course)`);
                        }
                        else if (!existingCourseId) {
                            existingWithDifferentCourse.course = courseEntity;
                            subject = await this.subjectRepository.save(existingWithDifferentCourse);
                            subject = await this.subjectRepository.findOne({
                                where: { subject_id: subject.subject_id },
                                relations: ['course']
                            }) || subject;
                            console.log(`Updated existing subject "${trimmedName}" to have course_id ${subject?.course?.course_id || courseEntity.course_id}, subject_id: ${subject.subject_id}`);
                        }
                    }
                    else {
                        const created = this.subjectRepository.create({
                            subject_name: trimmedName,
                            course: courseEntity
                        });
                        subject = await this.subjectRepository.save(created);
                        subject = await this.subjectRepository.findOne({
                            where: { subject_id: subject.subject_id },
                            relations: ['course']
                        }) || subject;
                        console.log(`Created new subject "${trimmedName}" with course_id ${subject?.course?.course_id || courseEntity.course_id}, subject_id: ${subject.subject_id}`);
                    }
                }
                else {
                    console.log('Subject found in course:', subject.subject_id);
                }
            }
            else {
                subject = await this.subjectRepository.findOne({
                    where: { subject_name: trimmedName },
                    relations: ['course']
                });
                if (!subject) {
                    const created = this.subjectRepository.create({ subject_name: trimmedName });
                    subject = await this.subjectRepository.save(created);
                    console.log(`Created new subject "${trimmedName}" without course, subject_id: ${subject.subject_id}`);
                }
                else {
                    subject = await this.subjectRepository.findOne({
                        where: { subject_id: subject.subject_id },
                        relations: ['course']
                    }) || subject;
                    console.log(`Found existing subject "${trimmedName}" without course, subject_id: ${subject.subject_id}`);
                }
            }
            if (tutorCourseId && subject) {
                const subjectCourseId = subject.course?.course_id;
                if (subjectCourseId && subjectCourseId !== tutorCourseId) {
                    throw new Error(`Subject "${trimmedName}" belongs to course ID ${subjectCourseId}, but tutor is registered with course ID ${tutorCourseId}. Cannot associate subject from different course.`);
                }
            }
            const existingTutorSubject = await this.tutorSubjectRepository.findOne({
                where: {
                    tutor: { tutor_id: tutor.tutor_id },
                    subject: { subject_id: subject.subject_id }
                },
                relations: ['documents']
            });
            let savedTutorSubject;
            if (existingTutorSubject) {
                if (existingTutorSubject.status === 'approved') {
                    throw new Error('You have already been approved for this subject expertise');
                }
                else if (existingTutorSubject.status === 'pending') {
                    if (files && files.length > 0) {
                        console.log('Found existing pending TutorSubject, attaching documents to it');
                        savedTutorSubject = existingTutorSubject;
                    }
                    else {
                        throw new Error('You have already applied for this subject expertise and it is pending review');
                    }
                }
                else if (existingTutorSubject.status === 'rejected') {
                    existingTutorSubject.status = 'pending';
                    existingTutorSubject.admin_notes = null;
                    savedTutorSubject = await this.tutorSubjectRepository.save(existingTutorSubject);
                    if (isReapplication && (!files || files.length === 0)) {
                        const existingDocs = existingTutorSubject.documents || [];
                        if (existingDocs.length > 0) {
                            console.log(`Reapplying rejected subject "${trimmedName}" with ${existingDocs.length} existing documents (no new files)`);
                            return { success: true, message: 'Subject reapplication submitted successfully' };
                        }
                    }
                }
            }
            else {
                if (!files || files.length === 0) {
                    throw new Error('At least one file is required for new subject application');
                }
                const tutorSubject = this.tutorSubjectRepository.create({
                    tutor,
                    subject,
                    status: 'pending'
                });
                savedTutorSubject = await this.tutorSubjectRepository.save(tutorSubject);
            }
            if (files && files.length > 0) {
                try {
                    console.log('Creating documents for tutor subject:', savedTutorSubject.tutor_subject_id);
                    console.log('Subject name:', trimmedName, 'Files count:', files.length);
                    const existingDocs = await this.tutorSubjectDocumentRepository.find({
                        where: { tutorSubject: { tutor_subject_id: savedTutorSubject.tutor_subject_id } }
                    });
                    if (existingDocs.length > 0) {
                        console.log(`Clearing ${existingDocs.length} existing documents for tutor subject ${savedTutorSubject.tutor_subject_id}`);
                        await this.tutorSubjectDocumentRepository.remove(existingDocs);
                    }
                    const documents = files.map(file => {
                        console.log('Processing file:', file.filename, file.mimetype);
                        return this.tutorSubjectDocumentRepository.create({
                            tutorSubject: savedTutorSubject,
                            file_url: `/tutor_documents/${file.filename}`,
                            file_name: file.filename,
                            file_type: file.mimetype
                        });
                    });
                    console.log('Saving documents:', documents.length);
                    const savedDocuments = await this.tutorSubjectDocumentRepository.save(documents);
                    console.log(`Successfully saved ${savedDocuments.length} document(s) for tutor subject:`, savedTutorSubject.tutor_subject_id);
                    if (!savedDocuments || savedDocuments.length === 0) {
                        throw new Error('Failed to save documents - no documents were saved');
                    }
                }
                catch (error) {
                    console.error('Error saving documents:', error);
                    throw new Error(`Failed to save documents for subject "${trimmedName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }
            else {
                console.log('No files provided for tutor subject:', savedTutorSubject.tutor_subject_id);
            }
            return { success: true, tutorSubjectId: savedTutorSubject.tutor_subject_id };
        }
        catch (error) {
            console.error('Error in submitSubjectApplication:', error);
            throw error;
        }
    }
    async getBookingRequests(userId) {
        let tutor = await this.tutorsRepository.findOne({ where: { tutor_id: userId } });
        if (!tutor) {
            tutor = await this.tutorsRepository.findOne({
                where: { user: { user_id: userId } },
                relations: ['user']
            });
        }
        if (!tutor) {
            console.warn(`getBookingRequests: Tutor not found for id/user_id=${userId}`);
            throw new common_1.NotFoundException('Tutor not found');
        }
        console.log(`getBookingRequests: Looking for bookings with tutor_id=${tutor.tutor_id}`);
        const rawCount = await this.bookingRequestRepository
            .createQueryBuilder('br')
            .where('br.tutor_id = :tutorId', { tutorId: tutor.tutor_id })
            .getCount();
        console.log(`getBookingRequests: Raw count of bookings with tutor_id=${tutor.tutor_id}: ${rawCount}`);
        const requests = await this.bookingRequestRepository
            .createQueryBuilder('br')
            .leftJoinAndSelect('br.student', 'student')
            .leftJoinAndSelect('br.tutor', 'tutor')
            .leftJoinAndSelect('tutor.user', 'tutorUser')
            .where('br.tutor_id = :tutorId', { tutorId: tutor.tutor_id })
            .orderBy('br.created_at', 'DESC')
            .getMany();
        console.log(`getBookingRequests: found ${requests.length} requests for tutor_id=${tutor.tutor_id}`);
        console.log(`getBookingRequests: booking IDs:`, requests.map((r) => ({
            id: r.id,
            subject: r.subject,
            status: r.status,
            date: r.date,
            tutor_id_in_booking: r.tutor?.tutor_id || r.tutor_id || 'missing',
            student_id: r.student?.user_id || 'missing'
        })));
        const altRequests = await this.bookingRequestRepository.find({
            where: { tutor: tutor },
            relations: ['student', 'tutor'],
            order: { created_at: 'DESC' }
        });
        console.log(`getBookingRequests: Alternative query found ${altRequests.length} requests`);
        return requests;
    }
    async updateBookingRequestStatus(bookingId, status) {
        const request = await this.bookingRequestRepository.findOne({
            where: { id: bookingId },
            relations: ['tutor', 'tutor.user', 'student']
        });
        if (!request)
            throw new common_1.NotFoundException('Booking request not found');
        const student = await this.usersRepository.findOne({
            where: { user_id: request.student.user_id }
        });
        if (!student)
            throw new common_1.NotFoundException('Student not found');
        const tutor = await this.tutorsRepository.findOne({
            where: { tutor_id: request.tutor.tutor_id },
            relations: ['user']
        });
        if (!tutor)
            throw new common_1.NotFoundException('Tutor not found');
        const acceptanceTime = new Date();
        request.status = status;
        if (status === 'accepted') {
            request.status = 'awaiting_payment';
        }
        const savedRequest = await this.bookingRequestRepository.save(request);
        const hourlyRate = Number(tutor.session_rate_per_hour) || 0;
        const duration = Number(request.duration) || 0;
        const totalAmount = hourlyRate * duration;
        const bookingDate = new Date(request.date);
        const formattedDate = bookingDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const formattedAcceptanceDate = acceptanceTime.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const formattedAcceptanceTime = acceptanceTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
        const tutorName = tutor.user?.name || 'Tutor';
        const notificationMessage = status === 'accepted'
            ? `${tutorName} has approved your booking on ${formattedDate} for ${duration} hour${duration !== 1 ? 's' : ''}. Please pay the corresponding amount of ₱${totalAmount.toFixed(2)}. Accepted on ${formattedAcceptanceDate} at ${formattedAcceptanceTime}.`
            : `Your booking request for ${request.subject} was declined.`;
        const sessionDate = request.date instanceof Date ? request.date : new Date(request.date);
        const studentNotification = this.notificationRepository.create({
            userId: student.user_id.toString(),
            receiver_id: student.user_id,
            userType: 'tutee',
            message: notificationMessage,
            timestamp: acceptanceTime,
            read: false,
            sessionDate: sessionDate,
            subjectName: request.subject,
            booking: savedRequest
        });
        const savedNotification = await this.notificationRepository.save(studentNotification);
        console.log(`updateBookingRequestStatus: Created notification for student user_id=${student.user_id} about booking approval`);
        console.log(`updateBookingRequestStatus: Notification ID=${savedNotification.notification_id}, userId=${savedNotification.userId}, userType=${savedNotification.userType}`);
        console.log(`updateBookingRequestStatus: Message=${notificationMessage.substring(0, 100)}...`);
        if (status === 'accepted') {
            const tutorNotification = this.notificationRepository.create({
                userId: tutor.user?.user_id?.toString(),
                receiver_id: tutor.user?.user_id,
                userType: 'tutor',
                message: `You approved a booking with ${student.name || 'a student'} for ${request.subject} on ${formattedDate}.`,
                timestamp: acceptanceTime,
                read: false,
                sessionDate: sessionDate,
                subjectName: request.subject,
                booking: savedRequest
            });
            await this.notificationRepository.save(tutorNotification);
            console.log(`updateBookingRequestStatus: Created notification for tutor user_id=${tutor.user?.user_id} about approval`);
        }
        return { success: true };
    }
    async updatePaymentStatus(bookingId, status) {
        const request = await this.bookingRequestRepository.findOne({
            where: { id: bookingId },
            relations: ['tutor', 'tutor.user', 'student', 'student.user']
        });
        if (!request)
            throw new common_1.NotFoundException('Booking request not found');
        if (status === 'approved') {
            request.status = 'upcoming';
        }
        else {
            request.status = 'payment_rejected';
        }
        const savedRequest = await this.bookingRequestRepository.save(request);
        if (status !== 'approved') {
            const notifications = [
                this.notificationRepository.create({
                    userId: request.student.user_id.toString(),
                    receiver_id: request.student.user_id,
                    userType: 'tutee',
                    message: `Your payment for the ${request.subject} session was rejected by the tutor. Please try again.`,
                    timestamp: new Date(),
                    read: false,
                    sessionDate: request.date,
                    subjectName: request.subject,
                    booking: savedRequest
                }),
                this.notificationRepository.create({
                    userId: request.tutor.user.user_id.toString(),
                    receiver_id: request.tutor.user.user_id,
                    userType: 'tutor',
                    message: `You rejected the payment for ${request.subject} from ${request.student.name}`,
                    timestamp: new Date(),
                    read: false,
                    sessionDate: request.date,
                    subjectName: request.subject,
                    booking: savedRequest
                })
            ];
            await Promise.all(notifications.map(n => this.notificationRepository.save(n)));
        }
        return { success: true };
    }
    async markBookingAsCompleted(bookingId, status, file) {
        const request = await this.bookingRequestRepository.findOne({
            where: { id: bookingId },
            relations: ['tutor', 'tutor.user', 'student']
        });
        if (!request)
            throw new common_1.NotFoundException('Booking request not found');
        if (request.status === 'completed' || request.status === 'cancelled') {
            return { success: false, message: 'Booking already completed or cancelled' };
        }
        if (file) {
            const proofUrl = `/tutor_documents/${file.filename}`;
            request.session_proof_url = proofUrl;
        }
        request.status = status;
        request.tutor_marked_done_at = new Date();
        const saved = await this.bookingRequestRepository.save(request);
        try {
            const notification = this.notificationRepository.create({
                userId: request.student.user_id.toString(),
                receiver_id: request.student.user_id,
                userType: 'tutee',
                message: `Your session for ${request.subject} on ${new Date(request.date).toLocaleDateString()} has been marked as completed by the tutor and is awaiting your confirmation.`,
                timestamp: new Date(),
                read: false,
                sessionDate: request.date,
                subjectName: request.subject,
                booking: saved
            });
            await this.notificationRepository.save(notification);
        }
        catch (e) {
            console.warn('Failed to create completion notification:', e);
        }
        return { success: true };
    }
    async uploadPaymentProof(bookingId, file) {
        const request = await this.bookingRequestRepository.findOne({
            where: { id: bookingId },
            relations: ['tutor', 'tutor.user', 'student']
        });
        if (!request) {
            throw new common_1.NotFoundException('Booking request not found');
        }
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        const fileUrl = `/tutor_documents/${file.filename}`;
        request.payment_proof = fileUrl;
        if (request.status === 'pending' || request.status === 'declined' || request.status === 'cancelled') {
            throw new common_1.BadRequestException('Cannot upload payment proof for this booking status');
        }
        request.status = 'awaiting_payment';
        const saved = await this.bookingRequestRepository.save(request);
        const existingPayment = await this.paymentRepository.findOne({
            where: { booking_request_id: bookingId }
        });
        if (existingPayment) {
            existingPayment.payment_proof_url = fileUrl;
            await this.paymentRepository.save(existingPayment);
        }
        const notification = this.notificationRepository.create({
            userId: request.tutor?.user?.user_id?.toString(),
            receiver_id: request.tutor?.user?.user_id,
            userType: 'tutor',
            message: `Payment proof uploaded by ${request.student?.name || 'student'} for ${request.subject}`,
            timestamp: new Date(),
            read: false,
            sessionDate: request.date,
            subjectName: request.subject,
            booking: saved
        });
        await this.notificationRepository.save(notification);
        return { success: true, payment_proof: fileUrl };
    }
    async getTutorSessions(userId) {
        return [];
    }
    async getTutorPayments(userId) {
        let tutor = await this.tutorsRepository.findOne({ where: { tutor_id: userId } });
        if (!tutor) {
            tutor = await this.tutorsRepository.findOne({
                where: { user: { user_id: userId } },
                relations: ['user']
            });
        }
        if (!tutor) {
            console.warn(`getTutorPayments: Tutor not found for id/user_id=${userId}`);
            throw new common_1.NotFoundException('Tutor not found');
        }
        const payments = await this.paymentRepository.find({
            where: { tutor_id: tutor.tutor_id },
            relations: ['student', 'student.user', 'tutor', 'tutor.user', 'bookingRequest'],
            order: { created_at: 'DESC' }
        });
        return payments.map((p) => ({
            id: p.payment_id,
            payment_id: p.payment_id,
            booking_request_id: p.booking_request_id || null,
            subject_id: p.subject_id || null,
            subject_name: p.subject?.subject_name || null,
            amount: Number(p.amount),
            status: p.status,
            created_at: p.created_at,
            student_name: p.student?.user?.name || 'Unknown Student',
            student_id: p.student_id,
            tutor_id: p.tutor_id,
            dispute_status: p.dispute_status,
        }));
    }
    async getTutorPayouts(userId) {
        let tutor = await this.tutorsRepository.findOne({ where: { tutor_id: userId } });
        if (!tutor) {
            tutor = await this.tutorsRepository.findOne({
                where: { user: { user_id: userId } },
                relations: ['user']
            });
        }
        if (!tutor) {
            console.warn(`getTutorPayouts: Tutor not found for id/user_id=${userId}`);
            throw new common_1.NotFoundException('Tutor not found');
        }
        const payouts = await this.payoutRepository.find({
            where: { tutor_id: tutor.tutor_id },
            relations: ['payment', 'tutor'],
            order: { created_at: 'DESC' }
        });
        return payouts.map((p) => ({
            payout_id: p.payout_id,
            payment_id: p.payment_id,
            tutor_id: p.tutor_id,
            amount_released: Number(p.amount_released),
            status: p.status,
            release_proof_url: p.release_proof_url,
            rejection_reason: p.rejection_reason,
            admin_notes: p.admin_notes,
            created_at: p.created_at,
        }));
    }
    async getTutorEarningsStats(userId) {
        let tutor = await this.tutorsRepository.findOne({ where: { tutor_id: userId } });
        if (!tutor) {
            tutor = await this.tutorsRepository.findOne({
                where: { user: { user_id: userId } },
                relations: ['user']
            });
        }
        if (!tutor) {
            console.warn(`getTutorEarningsStats: Tutor not found for id/user_id=${userId}`);
            throw new common_1.NotFoundException('Tutor not found');
        }
        const payments = await this.paymentRepository.find({
            where: { tutor_id: tutor.tutor_id }
        });
        const confirmedPayments = payments.filter((p) => p.status === 'confirmed' || p.status === 'paid');
        const pendingPayments = payments.filter((p) => p.status === 'pending');
        const total_earnings = confirmedPayments.reduce((sum, p) => sum + Number(p.amount), 0);
        const pending_earnings = pendingPayments.reduce((sum, p) => sum + Number(p.amount), 0);
        const completedBookings = await this.bookingRequestRepository.find({
            where: { tutor: { tutor_id: tutor.tutor_id }, status: 'completed' }
        });
        const total_hours = completedBookings.reduce((sum, b) => sum + Number(b.duration || 0), 0);
        const average_rating = 0;
        return {
            total_earnings,
            pending_earnings,
            completed_sessions: completedBookings.length,
            average_rating,
            total_hours
        };
    }
    async deleteOldProfileImages(userId) {
        const user = await this.usersRepository.findOne({ where: { user_id: userId } });
        if (!user)
            return;
        const userProfileImagesPath = path.join(process.cwd(), 'user_profile_images');
        try {
            const files = fs.readdirSync(userProfileImagesPath);
            const profileImagePattern = new RegExp(`^userProfile_${userId}(\\..*)?$`);
            const filesToDelete = files.filter(file => {
                const matchesPattern = profileImagePattern.test(file);
                const isCurrentFile = user.profile_image_url && file === path.basename(user.profile_image_url);
                return matchesPattern && !isCurrentFile;
            });
            console.log(`Found ${filesToDelete.length} old profile image files to delete for user ${userId}:`, filesToDelete);
            for (const file of filesToDelete) {
                const filePath = path.join(userProfileImagesPath, file);
                try {
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                        console.log(`Successfully deleted old profile image: ${file}`);
                    }
                }
                catch (error) {
                    console.error(`Error deleting file ${file}:`, error);
                }
            }
        }
        catch (error) {
            console.error('Error reading user_profile_images directory:', error);
        }
    }
    async deleteOldGcashQRFiles(userId) {
        const tutor = await this.tutorsRepository.findOne({ where: { user: { user_id: userId } } });
        if (!tutor)
            return;
        const tutorDocumentsPath = path.join(process.cwd(), 'tutor_documents');
        try {
            const files = fs.readdirSync(tutorDocumentsPath);
            const gcashQRPattern = new RegExp(`^gcashQR_${userId}(\\..*)?$`);
            const filesToDelete = files.filter(file => {
                const matchesPattern = gcashQRPattern.test(file);
                const isCurrentFile = tutor.gcash_qr_url && file === path.basename(tutor.gcash_qr_url);
                return matchesPattern && !isCurrentFile;
            });
            console.log(`Found ${filesToDelete.length} old GCash QR files to delete for user ${userId}:`, filesToDelete);
            for (const file of filesToDelete) {
                const filePath = path.join(tutorDocumentsPath, file);
                try {
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                        console.log(`Successfully deleted old GCash QR: ${file}`);
                    }
                }
                catch (error) {
                    console.error(`Error deleting file ${file}:`, error);
                }
            }
        }
        catch (error) {
            console.error('Error reading tutor_documents directory:', error);
        }
    }
};
exports.TutorsService = TutorsService;
exports.TutorsService = TutorsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Tutor)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.Course)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.University)),
    __param(4, (0, typeorm_1.InjectRepository)(entities_1.TutorDocument)),
    __param(5, (0, typeorm_1.InjectRepository)(entities_1.TutorAvailability)),
    __param(6, (0, typeorm_1.InjectRepository)(entities_1.TutorSubject)),
    __param(7, (0, typeorm_1.InjectRepository)(entities_1.TutorSubjectDocument)),
    __param(8, (0, typeorm_1.InjectRepository)(entities_1.Subject)),
    __param(9, (0, typeorm_1.InjectRepository)(entities_1.SubjectApplication)),
    __param(10, (0, typeorm_1.InjectRepository)(entities_1.SubjectApplicationDocument)),
    __param(11, (0, typeorm_1.InjectRepository)(entities_1.BookingRequest)),
    __param(12, (0, typeorm_1.InjectRepository)(entities_1.Notification)),
    __param(13, (0, typeorm_1.InjectRepository)(entities_1.Payment)),
    __param(14, (0, typeorm_1.InjectRepository)(entities_1.Payout)),
    __param(15, (0, typeorm_1.InjectRepository)(entities_1.Student)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        email_service_1.EmailService])
], TutorsService);
//# sourceMappingURL=tutors.service.js.map