import React, { useEffect, useState } from "react";
import { Folder, FileVideo, Loader2, CheckCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Video = {
  name: string;
  status: "waiting" | "processing" | "done" | "processed";
  zip_url?: string;
};

type FolderData = {
  folder: string;
  videos: Video[];
};

export const FolderStatusPage: React.FC = () => {
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const res = await fetch("http://localhost:3000/folder-status");
      const data = await res.json();

      const formatted: FolderData[] = Object.entries(data.folders || {}).map(
        ([folderName, folderData]: any) => ({
          folder: folderName,
          videos: [
            { name: "back", status: folderData.back.status, zip_url: folderData.back.result },
            { name: "side", status: folderData.side.status, zip_url: folderData.side.result },
          ],
        })
      );

      setFolders(formatted);
    } catch (err) {
      console.error("Error fetching folder status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const renderStatus = (video: Video) => {
    switch (video.status) {
      case "waiting":
        return (
          <span className="flex items-center text-yellow-600">
            <Clock className="w-4 h-4 mr-1" /> Waiting
          </span>
        );
      case "processing":
        return (
          <span className="flex items-center text-blue-600">
            <Loader2 className="w-4 h-4 mr-1 animate-spin" /> Processing
          </span>
        );
      case "done":
      case "processed":
        return (
          <span className="flex items-center text-green-600">
            <CheckCircle className="w-4 h-4 mr-1" /> Done
          </span>
        );
      default:
        return <span className="text-gray-500">Unknown</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Folder & Video Status</h1>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="space-y-6">
          {folders.map((folder) => (
            <div
              key={folder.folder}
              className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:bg-gray-100"
              onClick={() => navigate(`/upload/${encodeURIComponent(folder.folder)}`)}
            >
              <div className="flex items-center mb-4">
                <Folder className="w-6 h-6 text-indigo-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">{folder.folder}</h2>
              </div>
              <div className="space-y-2">
                {folder.videos.map((video) => (
                  <div
                    key={video.name}
                    className="flex justify-between items-center border-b border-gray-200 py-2"
                  >
                    <div className="flex items-center text-gray-700">
                      <FileVideo className="w-4 h-4 mr-2" />
                      {video.name}
                    </div>
                    {renderStatus(video)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
