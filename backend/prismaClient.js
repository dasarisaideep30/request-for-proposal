const { PrismaClient } = require('@prisma/client');

let prisma;

if (process.env.NODE_ENV === 'production') {
    console.log('[DEBUG] Initializing PrismaClient in production...');
    try {
        prisma = new PrismaClient();
        console.log('[DEBUG] PrismaClient initialized successfully.');
    } catch (err) {
        console.error('[CRITICAL] PrismaClient initialization failed:', err);
        throw err;
    }
} else {
    if (!global.prisma) {
        console.log('[DEBUG] Initializing PrismaClient in development (global sync)...');
        try {
            global.prisma = new PrismaClient();
        } catch (err) {
            console.error('[CRITICAL] Global PrismaClient initialization failed:', err);
            throw err;
        }
    }
    prisma = global.prisma;
}

module.exports = prisma;
