import fs from 'fs';
import path from 'path';
import { Client } from '@gradio/client';

export default class VideoProcessor {
    constructor(folderStatusPath, piUploadsDir, interval = 10000) {
        this.folderStatusPath = folderStatusPath;
        this.piUploadsDir = piUploadsDir;
        this.interval = interval;

        this.status = this.loadStatus();

        // Track if a side video is being processed
        this.processingSide = false;

        this.start();
    }

    loadStatus() {
        if (fs.existsSync(this.folderStatusPath)) {
            return JSON.parse(fs.readFileSync(this.folderStatusPath, 'utf8'));
        }
        return { folders: {} };
    }

    saveStatus() {
        fs.writeFileSync(this.folderStatusPath, JSON.stringify(this.status, null, 2));
    }

    async processSideVideo(folderName) {
        const videoPath = path.join(this.piUploadsDir, folderName, 'side.mp4');
        if (!fs.existsSync(videoPath)) return;

        console.log(`[SIDE] Sending video for processing: ${folderName}/side.mp4`);

        this.status.folders[folderName].side.status = 'processing';
        this.saveStatus();
        this.processingSide = true;

        try {
            const client = await Client.connect("nabil48/bike-helmet-detector");

            console.log(`[SIDE] Video sent to Gradio model... waiting for response.`);

            // Read the video file as buffer
            const videoBuffer = fs.readFileSync(videoPath);

            const result = await client.predict("/predict", {
                video_file: {
                    name: "side.mp4",    // filename
                    data: videoBuffer    // actual bytes
                }
            });

            console.log(`[SIDE] Response received from model for folder: ${folderName}`);

            const outputDir = path.join(this.piUploadsDir, folderName, 'outputs');
            fs.mkdirSync(outputDir, { recursive: true });

            const outputPath = path.join(outputDir, 'side_output.zip');

            const buffer = Buffer.isBuffer(result.data)
                ? result.data
                : Buffer.from(result.data, 'base64');

            fs.writeFileSync(outputPath, buffer);
            console.log(`[SIDE] Saved processed ZIP to: ${outputPath}`);

            this.status.folders[folderName].side.status = 'done';
            this.status.folders[folderName].side.result = outputPath;

            const folderInfo = this.status.folders[folderName];
            if (folderInfo.back?.status === 'done' && folderInfo.side.status === 'done') {
                folderInfo.processed = true;
                console.log(`[FOLDER] Fully processed: ${folderName}`);
            }

        } catch (err) {
            console.error(`[SIDE] Error processing folder ${folderName}:`, err);
            this.status.folders[folderName].side.status = 'waiting';
        }

        this.processingSide = false;
        this.saveStatus();
    }

    checkQueue() {
        // 🔹 Reload status from file every check
        this.status = this.loadStatus();

        for (const [folder, info] of Object.entries(this.status.folders)) {
            if (info.deleted || info.processed) continue;

            if (!info.side) info.side = { status: 'waiting', result: null };

            if (!this.processingSide && info.side.status === 'waiting') {
                this.processSideVideo(folder);
                break; // only one at a time
            }
        }
    }


    start() {
        this.timer = setInterval(() => this.checkQueue(), this.interval);
    }

    stop() {
        clearInterval(this.timer);
    }
}
