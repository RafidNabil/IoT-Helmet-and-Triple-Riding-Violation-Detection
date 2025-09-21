// index.js
import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import nodemailer from 'nodemailer';
import multer from 'multer';
import unzipper from 'unzipper';
import FolderMonitor from './folderMonitor.js';
import VideoProcessor from './videoProcessor.js';
import { fileURLToPath } from 'url';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ------------------- Paths -------------------
const piUploadsDir = path.join(__dirname, 'pi_uploads');
const recordsDir = path.join(__dirname, 'records');
const folderStatusPath = path.join(__dirname, 'folderStatus.json');

// ------------------- Folder Monitor -------------------
const folderMonitor = new FolderMonitor(piUploadsDir, recordsDir, 'folderStatus.json', 30000);
app.get('/status-folders', (req, res) => {
    res.json(folderMonitor.getStatus());
});


// ------------------- Folder Status -------------------
app.get('/folder-status', (req, res) => {
    try {
        if (!fs.existsSync(folderStatusPath)) {
            return res.json({ folders: {} });
        }
        const data = JSON.parse(fs.readFileSync(folderStatusPath, 'utf8'));
        res.json(data);
    } catch (err) {
        console.error('Error reading folderStatus.json:', err);
        res.status(500).json({ error: 'Failed to read folder status' });
    }
});


// ------------------- Video Processor -------------------
const videoProcessor = new VideoProcessor(folderStatusPath, piUploadsDir, 10000);

// ------------------- Multer storage -------------------
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const tempDir = path.join(__dirname, 'pi_uploads');
        fs.mkdirSync(tempDir, { recursive: true });
        cb(null, tempDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage });

// ------------------- Upload route -------------------
app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const originalName = req.file.originalname;
    const baseName = originalName.replace(/\.[^/.]+$/, "");
    const targetDir = path.join(piUploadsDir, baseName);

    fs.mkdirSync(targetDir, { recursive: true });

    const uploadedPath = path.join(piUploadsDir, originalName);
    const finalZipPath = path.join(targetDir, originalName);

    fs.renameSync(uploadedPath, finalZipPath);

    if (originalName.endsWith('.zip')) {
        fs.createReadStream(finalZipPath)
            .pipe(unzipper.Extract({ path: targetDir }))
            .on('close', () => {
                fs.unlinkSync(finalZipPath);

                // Initialize folder status
                if (!fs.existsSync(folderStatusPath)) {
                    fs.writeFileSync(folderStatusPath, JSON.stringify({ folders: {} }, null, 2));
                }
                const statusData = JSON.parse(fs.readFileSync(folderStatusPath, 'utf8'));
                statusData.folders[baseName] = {
                    processed: false,
                    back: { status: 'waiting', result: null },
                    side: { status: 'waiting', result: null },
                    lastChecked: new Date().toISOString()
                };
                fs.writeFileSync(folderStatusPath, JSON.stringify(statusData, null, 2));

                res.json({ success: true, message: 'Zip uploaded and extracted successfully', folder: baseName });
            })
            .on('error', (err) => {
                res.status(500).json({ error: 'Failed to extract zip', details: err.toString() });
            });
    } else {
        res.json({ success: true, message: 'File uploaded successfully', folder: baseName });
    }
});

// ------------------- Folder check -------------------
app.get('/check-folder/:folderName', (req, res) => {
    const folderName = req.params.folderName;
    const folderPath = path.join(piUploadsDir, folderName);
    fs.access(folderPath, fs.constants.F_OK, (err) => {
        res.json({ exists: !err });
    });
});

// ------------------- License plate images -------------------
app.get('/get-images/:folderName/cropped', (req, res) => {
    const folderName = req.params.folderName;
    const folderPath = path.join(__dirname, 'records', folderName, 'outputs', 'cropped_plates');
    fs.readdir(folderPath, (err, files) => {
        if (err) return res.status(500).json({ error: 'Cannot read folder' });
        const urls = files.map(file => `http://localhost:3000/records/${encodeURIComponent(folderName)}/outputs/cropped_plates/${encodeURIComponent(file)}`);
        res.json(urls);
    });
});

app.get('/get-images/:folderName/enhanced', (req, res) => {
    const folderName = req.params.folderName;
    const folderPath = path.join(__dirname, 'records', folderName, 'outputs', 'enhanced_plates');
    fs.readdir(folderPath, (err, files) => {
        if (err) return res.status(500).json({ error: 'Cannot read folder' });
        const urls = files.map(file => `http://localhost:3000/records/${encodeURIComponent(folderName)}/outputs/enhanced_plates/${encodeURIComponent(file)}`);
        res.json(urls);
    });
});

app.get('/get-images/:folderName/bike', (req, res) => {
    const folderName = req.params.folderName;
    const folderPath = path.join(__dirname, 'records', folderName, 'bike_frames');
    fs.readdir(folderPath, (err, files) => {
        if (err) return res.status(500).json({ error: 'Cannot read folder' });
        const urls = files.map(file => `http://localhost:3000/records/${encodeURIComponent(folderName)}/bike_frames/${encodeURIComponent(file)}`);
        res.json(urls);
    });
});

// ------------------- CSV / text files -------------------
app.get('/get-plate-csv/:folderName', (req, res) => {
    const folderName = req.params.folderName;
    const filePath = path.join(__dirname, 'records', folderName, 'outputs', 'plate_results.csv');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Cannot read CSV file' });
        const rows = data.trim().split('\n').slice(1);
        const plates = rows.map(row => ({ plate: row }));
        res.json(plates);
    });
});
// final plate
app.get('/get-final-plate/:folderName', (req, res) => {
    const folderName = req.params.folderName;
    const filePath = path.join(__dirname, 'records', folderName, 'outputs', 'final_plate_number.txt');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Cannot read final plate file' });
        res.json({ finalPlate: data.trim() });
    });
});

// rider_helmet_counts.txt
app.get('/get-rider-helmet-counts/:folderName', (req, res) => {
    const folderName = req.params.folderName;
    const filePath = path.join(__dirname, 'records', folderName, 'rider_helmet_counts.txt');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Cannot read rider_helmet_counts.txt' });
        const lines = data.trim().split('\n');
        const headers = lines[0].split('\t');
        const rows = lines.slice(1).map(line => {
            const parts = line.split('\t');
            return {
                [headers[0]]: parts[0],
                [headers[1]]: parseInt(parts[1]),
                [headers[2]]: parseInt(parts[2])
            };
        });
        res.json(rows);
    });
});

// final_counts.txt
app.get('/get-final-count/:folderName', (req, res) => {
    const folderName = req.params.folderName;
    const filePath = path.join(__dirname, 'records', folderName, 'final_counts.txt');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Cannot read final_counts.txt' });
        const lines = data.trim().split('\n');
        const headers = lines[0].split('\t');
        const values = lines[1].split('\t');
        res.json({
            riders: parseInt(values[0]),
            helmets: parseInt(values[1])
        });
    });
});

// ------------------- Fetch contact email -------------------
app.get('/get-contact/:plate', (req, res) => {
    const plate = req.params.plate;
    const filePath = path.join(__dirname, 'records', 'Contant_Info.txt');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Cannot read Contant_Info.txt' });
        const lines = data.trim().split('\n');
        const foundLine = lines.find(line => line.includes(plate));
        if (!foundLine) return res.json({ email: null });
        const parts = foundLine.trim().split(' ');
        const email = parts[parts.length - 1]; // assume last part is email
        res.json({ email });
    });
});

// ------------------- Report violation & send email -------------------
app.post('/report-violation', async (req, res) => {
    const { plate, email, riders, helmets } = req.body;

    if (!email) return res.status(400).json({ error: 'Missing email' });

    console.log(`Violation reported for plate ${plate} to ${email}`);

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'rafidnabil3@gmail.com',
                pass: 'vqau nuws upvt rtck'
            }
        });

        const message = {
            from: 'rafidnabil3@gmail.com',
            to: email,
            subject: '⚠️ Traffic Violation Detected',
            text: `Dear user,\n\nA traffic violation has been detected for your vehicle.\n\nPlate: ${plate}\nRiders: ${riders}\nHelmets: ${helmets}\n\nPlease take necessary action.\n\nRegards,\nTraffic Authority`
        };

        const info = await transporter.sendMail(message);
        console.log('Email sent:', info.response);

        res.json({ success: true, message: 'Email sent successfully', info: info.response });
    } catch (err) {
        console.error('Email send error:', err);
        res.status(500).json({ success: false, error: 'Failed to send email', details: err.toString() });
    }
});

// ------------------- Serve static files -------------------
app.use('/records', express.static(path.join(__dirname, 'records')));

// ------------------- Start server -------------------
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
