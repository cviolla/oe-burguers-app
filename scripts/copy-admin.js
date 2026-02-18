import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const adminDistDir = path.join(rootDir, 'admin', 'dist');
const targetAdminDir = path.join(distDir, 'admin');

async function copyFolderRecursiveSync(source, target) {
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
    }

    const files = fs.readdirSync(source);

    for (const file of files) {
        const curSource = path.join(source, file);
        const curTarget = path.join(target, file);

        if (fs.lstatSync(curSource).isDirectory()) {
            copyFolderRecursiveSync(curSource, curTarget);
        } else {
            fs.copyFileSync(curSource, curTarget);
        }
    }
}

async function copyAdmin() {
    try {
        console.log('Copying admin files to dist/admin...');

        if (!fs.existsSync(adminDistDir)) {
            console.error('Admin dist directory not found. Make sure to build admin first.');
            process.exit(1);
        }

        copyFolderRecursiveSync(adminDistDir, targetAdminDir);

        console.log('Admin files copied successfully!');
    } catch (err) {
        console.error('Error copying admin files:', err);
        process.exit(1);
    }
}

copyAdmin();
