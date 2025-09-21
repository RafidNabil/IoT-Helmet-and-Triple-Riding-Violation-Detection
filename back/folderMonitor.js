import fs from 'fs';
import path from 'path';

export default class FolderMonitor {
    constructor(piUploadsDir, recordsDir, jsonFile = 'folderStatus.json', interval = 30000) {
        this.piUploadsDir = piUploadsDir;
        this.recordsDir = recordsDir;
        this.jsonPath = path.join(process.cwd(), jsonFile); // use cwd for consistency
        this.interval = interval;

        this.status = this.loadStatus();
        this.start();
    }

    loadStatus() {
        if (fs.existsSync(this.jsonPath)) {
            try {
                const data = fs.readFileSync(this.jsonPath, 'utf8');
                return JSON.parse(data);
            } catch (err) {
                console.error('Error reading JSON status file:', err);
                return { folders: {} };
            }
        } else {
            return { folders: {} };
        }
    }

    saveStatus() {
        try {
            fs.writeFileSync(this.jsonPath, JSON.stringify(this.status, null, 2));
        } catch (err) {
            console.error('Error saving JSON status file:', err);
        }
    }

    checkFolders() {
        const piDirs = fs.readdirSync(this.piUploadsDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        const now = new Date().toISOString();

        for (const dir of piDirs) {
            const recordPath = path.join(this.recordsDir, dir);
            const processed = fs.existsSync(recordPath);

            if (!this.status.folders[dir]) {
                // New folder
                this.status.folders[dir] = {
                    processed: processed,
                    back: { status: processed ? 'done' : 'waiting', result: null },
                    side: { status: processed ? 'done' : 'waiting', result: null },
                    lastChecked: now
                };
            } else {
                const folderStatus = this.status.folders[dir];
                folderStatus.processed = processed;

                // Ensure side/back objects exist
                if (!folderStatus.back) folderStatus.back = { status: 'waiting', result: null };
                if (!folderStatus.side) folderStatus.side = { status: 'waiting', result: null };

                // Only reset to waiting if not processing
                if (!processed) {
                    if (folderStatus.back.status !== 'processing') folderStatus.back.status = 'waiting';
                    if (folderStatus.side.status !== 'processing') folderStatus.side.status = 'waiting';
                } else {
                    folderStatus.back.status = 'done';
                    folderStatus.side.status = 'done';
                }

                folderStatus.lastChecked = now;
            }
        }

        // Mark removed folders
        for (const dir of Object.keys(this.status.folders)) {
            if (!piDirs.includes(dir)) this.status.folders[dir].deleted = true;
        }

        this.saveStatus();
    }

    start() {
        this.checkFolders();
        this.timer = setInterval(() => this.checkFolders(), this.interval);
    }

    stop() {
        clearInterval(this.timer);
    }

    getStatus() {
        const processed = [];
        const unprocessed = [];

        for (const [folder, info] of Object.entries(this.status.folders)) {
            if (info.deleted) continue;
            if (info.processed) processed.push(folder);
            else unprocessed.push(folder);
        }

        return { processed, unprocessed };
    }
}
