"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const fs = require("fs");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const allowedOrigins = process.env.FRONTEND_URL
        ? [process.env.FRONTEND_URL, 'http://localhost:3001']
        : ['http://localhost:3001', '*'];
    app.enableCors({
        origin: process.env.NODE_ENV === 'production'
            ? allowedOrigins.filter(origin => origin !== '*')
            : '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });
    const docsDir = (0, path_1.join)(process.cwd(), 'tutor_documents');
    if (!fs.existsSync(docsDir)) {
        fs.mkdirSync(docsDir, { recursive: true });
    }
    const express = require('express');
    app.use('/tutor_documents', express.static(docsDir, {
        setHeaders: (res, path) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        }
    }));
    const userProfileImagesDir = (0, path_1.join)(process.cwd(), 'user_profile_images');
    if (!fs.existsSync(userProfileImagesDir)) {
        fs.mkdirSync(userProfileImagesDir, { recursive: true });
    }
    app.use('/user_profile_images', express.static(userProfileImagesDir, {
        setHeaders: (res, path) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        }
    }));
    const adminQrDir = (0, path_1.join)(process.cwd(), 'admin_qr');
    if (!fs.existsSync(adminQrDir)) {
        fs.mkdirSync(adminQrDir, { recursive: true });
    }
    app.use('/admin_qr', express.static(adminQrDir, {
        setHeaders: (res, path) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        }
    }));
    app.setGlobalPrefix('api', {
        exclude: ['/']
    });
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 Server is running on port ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map