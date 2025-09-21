import React, { useState, useEffect } from 'react';
import { mockViolations } from '../data/mockData';
import { Violation } from '../types';
import { format } from 'date-fns';
import { Play, Pause, Camera, AlertTriangle, Activity } from 'lucide-react';

export const VideoProcessing: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [currentFrame, setCurrentFrame] = useState('https://images.pexels.com/photos/2168275/pexels-photo-2168275.jpeg');
  const [detectedViolation, setDetectedViolation] = useState<Violation | null>(null);
  const [frameCount, setFrameCount] = useState(1247);

  // Simulate live processing
  useEffect(() => {
    if (!isProcessing) return;

    const interval = setInterval(() => {
      setFrameCount(prev => prev + 1);
      
      // Randomly detect a violation (10% chance every 3 seconds)
      if (Math.random() < 0.1) {
        const randomViolation = mockViolations[Math.floor(Math.random() * mockViolations.length)];
        setDetectedViolation({
          ...randomViolation,
          id: `new-${Date.now()}`,
          timestamp: new Date()
        });
        setCurrentFrame(randomViolation.image);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isProcessing]);

  const recentViolations = mockViolations
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Live Feed Controls */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">Live Camera Feed</h2>
            <div className="flex items-center space-x-2">
              {isProcessing && (
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              )}
              <span className={`text-sm font-medium ${isProcessing ? 'text-red-600' : 'text-gray-600'}`}>
                {isProcessing ? 'LIVE' : 'PAUSED'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Frame: {frameCount.toLocaleString()}</span>
            <button
              onClick={() => setIsProcessing(!isProcessing)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isProcessing 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {isProcessing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span>{isProcessing ? 'Pause' : 'Resume'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Frame */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Current Frame</h3>
              <div className="flex items-center space-x-2">
                <Camera className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">Main St & 5th Ave</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <img 
              src={currentFrame} 
              alt="Live feed" 
              className="w-full h-80 object-cover"
            />
            {detectedViolation && (
              <div className="absolute inset-0 bg-red-500/10 border-4 border-red-500 animate-pulse"></div>
            )}
            <div className="absolute bottom-4 left-4 bg-black/75 text-white px-3 py-1 rounded-lg text-sm">
              {format(new Date(), 'HH:mm:ss')}
            </div>
          </div>
        </div>

        {/* Latest Detection */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Latest Detection</h3>
          </div>
          
          <div className="p-6">
            {detectedViolation ? (
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 capitalize">
                      {detectedViolation.type.replace('_', ' ')} Violation
                    </h4>
                    <p className="text-gray-600 text-sm mt-1">
                      Detected at {format(detectedViolation.timestamp, 'HH:mm:ss')}
                    </p>
                    <p className="text-gray-600 text-sm">
                      Location: {detectedViolation.location}
                    </p>
                    {detectedViolation.speed && (
                      <p className="text-red-600 font-medium text-sm mt-2">
                        Speed: {detectedViolation.speed} mph
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                    Process Violation
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No violations detected</p>
                <p className="text-sm">Monitoring traffic conditions...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Detections */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Recent Detections</h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentViolations.map((violation) => (
              <div key={violation.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <img 
                  src={violation.image} 
                  alt="Violation" 
                  className="w-full h-32 object-cover"
                />
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-900 capitalize">
                      {violation.type.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      violation.status === 'processed' ? 'bg-green-100 text-green-800' :
                      violation.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {violation.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {format(violation.timestamp, 'MMM dd, HH:mm')}
                  </p>
                  {violation.speed && (
                    <p className="text-xs text-red-600 font-medium mt-1">
                      {violation.speed} mph
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};