import React, { useState, useEffect, DragEvent } from 'react';
import { useParams } from 'react-router-dom';
import { Upload as UploadIcon } from 'lucide-react';

export const Upload: React.FC = () => {
    const { folderName: paramFolderName } = useParams<{ folderName: string }>();

    const [zipFile, setZipFile] = useState<File | null>(null);
    const [status, setStatus] = useState('');
    const [processing, setProcessing] = useState(false);

    const [croppedImages, setCroppedImages] = useState<string[]>([]);
    const [enhancedImages, setEnhancedImages] = useState<string[]>([]);
    const [bikeImages, setBikeImages] = useState<string[]>([]);
    const [csvData, setCsvData] = useState<string[][]>([]);
    const [riderHelmetCounts, setRiderHelmetCounts] = useState<any[]>([]);
    const [finalPlate, setFinalPlate] = useState<string>('');
    const [finalCount, setFinalCount] = useState<{ riders: number; helmets: number } | null>(null);
    const [violationEmail, setViolationEmail] = useState<string | null>(null);

    const [dragOver, setDragOver] = useState(false);
    const [modalImage, setModalImage] = useState<string | null>(null);

    const resetData = () => {
        setCroppedImages([]);
        setEnhancedImages([]);
        setBikeImages([]);
        setCsvData([]);
        setRiderHelmetCounts([]);
        setFinalPlate('');
        setFinalCount(null);
        setViolationEmail(null);
    };

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const stagedFetch = async (folderName: string) => {
        try {
            setStatus('Processing cropped license plates...');
            const croppedRes = await fetch(`http://localhost:3000/get-images/${encodeURIComponent(folderName)}/cropped`);
            const croppedData: string[] = await croppedRes.json();
            await delay(500);
            setCroppedImages(croppedData);

            setStatus('Enhancing license plates...');
            const enhancedRes = await fetch(`http://localhost:3000/get-images/${encodeURIComponent(folderName)}/enhanced`);
            const enhancedData: string[] = await enhancedRes.json();
            await delay(500);
            setEnhancedImages(enhancedData);

            setStatus('Detecting riders and helmets...');
            const bikeRes = await fetch(`http://localhost:3000/get-images/${encodeURIComponent(folderName)}/bike`);
            const bikeData: string[] = await bikeRes.json();
            await delay(500);
            setBikeImages(bikeData);

            setStatus('Fetching plate results...');
            const csvRes = await fetch(`http://localhost:3000/records/${encodeURIComponent(folderName)}/outputs/plate_results.csv`);
            const csvText = await csvRes.text();
            await delay(500);
            setCsvData(csvText.split('\n').map(r => r.split(',')));

            setStatus('Counting riders and helmets...');
            const rhRes = await fetch(`http://localhost:3000/get-rider-helmet-counts/${encodeURIComponent(folderName)}`);
            await delay(500);
            setRiderHelmetCounts(await rhRes.json());

            setStatus('Finalizing plate number...');
            const finalPlateRes = await fetch(`http://localhost:3000/get-final-plate/${encodeURIComponent(folderName)}`);
            await delay(500);
            const finalPlateData = (await finalPlateRes.json()).finalPlate;
            setFinalPlate(finalPlateData);

            setStatus('Calculating final rider & helmet counts...');
            await delay(500);
            const finalCountRes = await fetch(`http://localhost:3000/get-final-count/${encodeURIComponent(folderName)}`);
            const finalCountData = await finalCountRes.json();
            setFinalCount(finalCountData);

            if ((finalCountData.helmets < finalCountData.riders || finalCountData.riders > 2) && finalPlateData) {
                try {
                    setStatus('Fetching contact email...');
                    const emailRes = await fetch(`http://localhost:3000/get-contact/${encodeURIComponent(finalPlateData)}`);
                    const emailData = await emailRes.json();
                    const email = emailData.email;
                    setViolationEmail(email);

                    if (email) {
                        setStatus('Sending violation email...');
                        const reportRes = await fetch(`http://localhost:3000/report-violation`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                plate: finalPlateData,
                                email,
                                riders: finalCountData.riders,
                                helmets: finalCountData.helmets
                            })
                        });
                        const reportData = await reportRes.json();
                        if (reportData.success) {
                            setStatus(`Email sent to ${email}`);
                        } else {
                            setStatus(`Failed to send email: ${reportData.error}`);
                        }
                    } else {
                        setStatus('No email found for this plate');
                    }
                } catch (err) {
                    console.error(err);
                    setStatus('Error sending email');
                }
            } else {
                setStatus('Processing complete!');
            }

            setProcessing(false);
        } catch (err) {
            console.error(err);
            setStatus('Error fetching results.');
            setProcessing(false);
        }
    };

    // ✅ Handle drag-and-drop
    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);

        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].name.endsWith('.zip')) {
            setZipFile(files[0]);
            setStatus('Processing...');
            setProcessing(true);
            resetData();
            const folderName = files[0].name.replace(/\.[^/.]+$/, '');
            stagedFetch(folderName);
        } else {
            setStatus('Please drop a valid .zip file');
        }
    };
    const handleDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDragOver(true); };
    const handleDragLeave = () => setDragOver(false);

    // ✅ Trigger fetch if folderName exists in URL
    useEffect(() => {
        if (paramFolderName) {
            setStatus('Loading folder contents...');
            setProcessing(true);
            resetData();
            stagedFetch(paramFolderName);
        }
    }, [paramFolderName]);

    return (
        <div className="p-6 space-y-4">
            {/* Drag & Drop */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}`}
            >
                <UploadIcon className="h-8 w-8 text-gray-500 mb-2" />
                <p className="text-gray-700">{zipFile ? zipFile.name : 'Drag & drop a ZIP file here'}</p>
            </div>

            {status && <p className={`font-semibold ${processing ? 'text-blue-600' : 'text-green-600'}`}>{status}</p>}

            {processing && (
                <div className="flex justify-center items-center space-x-2 mt-4">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-400"></div>
                </div>
            )}

            {/* Sections */}
            {croppedImages.length > 0 && <SectionGrid title="Cropped Plates" images={croppedImages} setModal={setModalImage} />}
            {enhancedImages.length > 0 && <SectionGrid title="Enhanced Plates" images={enhancedImages} setModal={setModalImage} />}
            {bikeImages.length > 0 && <SectionGrid title="Rider & Helmet Frames" images={bikeImages} setModal={setModalImage} />}
            {csvData.length > 0 && <TableSection title="Detected Plates (CSV)" data={csvData} />}
            {riderHelmetCounts.length > 0 && <ObjectTableSection title="Rider & Helmet Counts" data={riderHelmetCounts} />}
            {finalPlate && <div className="mt-4"><h3 className="font-semibold text-gray-900">Final Plate Number</h3><p className="text-lg font-bold">{finalPlate}</p></div>}
            {finalCount && <div className="mt-4"><h3 className="font-semibold text-gray-900">Final Counts</h3><p className="text-lg font-bold">Riders count: {finalCount.riders}</p><p className="text-lg font-bold">Helmets count: {finalCount.helmets}</p></div>}

            {/* Violations */}
            {finalCount && (
                <div className="mt-6">
                    <h3 className="font-semibold text-gray-900 text-xl mb-2">Violations</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={`p-4 rounded-lg shadow-md flex items-center space-x-4 ${finalCount.helmets < finalCount.riders ? 'bg-red-100 border border-red-400' : 'bg-green-100 border border-green-400'}`}>
                            <div className="text-2xl">{finalCount.helmets < finalCount.riders ? '⚠️' : '✅'}</div>
                            <div><p className="font-bold text-lg">{finalCount.helmets < finalCount.riders ? 'Helmet Violation!' : 'No Helmet Violation'}</p></div>
                        </div>
                        <div className={`p-4 rounded-lg shadow-md flex items-center space-x-4 ${finalCount.riders > 2 ? 'bg-red-100 border border-red-400' : 'bg-green-100 border border-green-400'}`}>
                            <div className="text-2xl">{finalCount.riders > 2 ? '⚠️' : '✅'}</div>
                            <div><p className="font-bold text-lg">{finalCount.riders > 2 ? 'Triple Rider Violation!' : 'No Triple Rider Violation'}</p></div>
                        </div>
                    </div>

                    {(finalCount.helmets < finalCount.riders || finalCount.riders > 2) && violationEmail && (
                        <div className="mt-4 p-4 rounded-lg border-2 border-red-500 bg-red-50 flex flex-col items-center">
                            <p className="font-bold text-lg text-red-700">Email for Violation:</p>
                            <p className="text-xl font-extrabold text-red-900">{violationEmail}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {modalImage && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={() => setModalImage(null)}>
                    <img src={modalImage} alt="Full Screen" className="max-h-full max-w-full rounded-lg" />
                </div>
            )}
        </div>
    );
};

// ------------------- Helper Components -------------------
const SectionGrid: React.FC<{ title: string, images: string[], setModal: (src: string) => void }> = ({ title, images, setModal }) => (
    <div>
        <h3 className="font-semibold text-gray-900 mt-4">{title}</h3>
        <div className="grid grid-cols-4 gap-2 mt-2">
            {images.map((src, idx) => (
                <img key={idx} src={src} alt={`${title}-${idx}`} className="w-20 h-20 object-cover rounded-lg cursor-pointer" onClick={() => setModal(src)} />
            ))}
        </div>
    </div>
);

const TableSection: React.FC<{ title: string, data: string[][] }> = ({ title, data }) => (
    <div className="overflow-x-auto mt-4">
        <h3 className="font-semibold text-gray-900 mt-4">{title}</h3>
        <table className="min-w-full border border-gray-300 mt-2">
            <thead>
                <tr className="bg-gray-100">
                    {data[0].map((h, i) => <th key={i} className="border px-2 py-1 text-left">{h}</th>)}
                </tr>
            </thead>
            <tbody>
                {data.slice(1).map((row, rIdx) => (
                    <tr key={rIdx}>{row.map((cell, cIdx) => <td key={cIdx} className="border px-2 py-1">{cell}</td>)}</tr>
                ))}
            </tbody>
        </table>
    </div>
);

const ObjectTableSection: React.FC<{ title: string, data: any[] }> = ({ title, data }) => (
    <div className="overflow-x-auto mt-4">
        <h3 className="font-semibold text-gray-900 mt-4">{title}</h3>
        <table className="min-w-full border border-gray-300 mt-2">
            <thead>
                <tr className="bg-gray-100">
                    {Object.keys(data[0]).map((h, i) => (
                        <th key={i} className="border px-2 py-1 text-left">{h}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.map((row, rIdx) => (
                    <tr key={rIdx}>
                        {Object.values(row).map((cell, cIdx) => (
                            <td key={cIdx} className="border px-2 py-1">{cell}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);
