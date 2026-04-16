const { PrismaClient } = require('@prisma/client');

/**
 * Lazy-loaded Prisma Client to ensure it doesn't crash during 
 * the initial require() phase in serverless environments.
 */
let prisma;

const getPrismaClient = () => {
    if (!prisma) {
        console.log('[DEBUG] Initializing PrismaClient (Lazy)...');
        try {
            prisma = new PrismaClient({
                log: ['error', 'warn'],
                errorFormat: 'pretty',
            });
            console.log('[DEBUG] PrismaClient Instance Created.');
        } catch (err) {
            console.error('[CRITICAL] Failed to create PrismaClient:', err);
            // In serverless, we sometimes need to return a mock or throw
            throw err;
        }
    }
    return prisma;
};

// For backward compatibility with existing requires
module.exports = new Proxy({}, {
    get: (target, prop) => {
        return getPrismaClient()[prop];
    }
});
