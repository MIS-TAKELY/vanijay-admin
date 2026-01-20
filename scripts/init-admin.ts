import { initializeAdminUser } from '@/lib/credentials';

async function main() {
    console.log('Initializing admin user...');
    try {
        await initializeAdminUser();
        console.log('Admin user initialized successfully!');
        console.log('Default credentials:');
        console.log('  Username: admin');
        console.log('  Password: admin');
        console.log('\nA backup email has been sent to mailitttome@gmail.com');
    } catch (error) {
        console.error('Failed to initialize admin user:', error);
        process.exit(1);
    }
}

main();
