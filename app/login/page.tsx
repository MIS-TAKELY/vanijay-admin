import UnifiedAuth from '@/components/auth/UnifiedAuth';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Login - Admin Panel',
    description: 'Login to your dashboard',
};

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <UnifiedAuth />
        </div>
    );
}
