"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDatabase = exports.connectDatabase = void 0;
const prisma_1 = require("../lib/prisma");
const connectDatabase = async () => {
    try {
        await prisma_1.prisma.$connect();
        console.log('✅ Database connected successfully');
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    }
};
exports.connectDatabase = connectDatabase;
const disconnectDatabase = async () => {
    await prisma_1.prisma.$disconnect();
};
exports.disconnectDatabase = disconnectDatabase;
exports.default = prisma_1.prisma;
