import React, { useState } from 'react';
import { mockMessageLogs, mockVehicleInfo, mockViolations } from '../data/mockData';
import { MessageLog, VehicleInfo } from '../types';
import { format } from 'date-fns';
import { Search, Send, Phone, Mail, MessageSquare, CheckCircle, XCircle, Clock } from 'lucide-react';

export const Messages: React.FC = () => {
  const [messageLogs, setMessageLogs] = useState(mockMessageLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [messageText, setMessageText] = useState('');
  const [messageType, setMessageType] = useState<'sms' | 'email'>('sms');

  const filteredLogs = messageLogs.filter(log => 
    log.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.phoneNumber && log.phoneNumber.includes(searchTerm)) ||
    (log.email && log.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSendMessage = () => {
    if (!selectedVehicle || !messageText.trim()) return;

    const vehicle = mockVehicleInfo[selectedVehicle];
    if (!vehicle) return;

    const newMessage: MessageLog = {
      id: `msg-${Date.now()}`,
      violationId: 'manual',
      vehicleNumber: selectedVehicle,
      phoneNumber: messageType === 'sms' ? vehicle.phoneNumber : undefined,
      email: messageType === 'email' ? vehicle.email : undefined,
      message: messageText,
      sentAt: new Date(),
      status: 'sent',
      type: messageType
    };

    setMessageLogs(prev => [newMessage, ...prev]);
    setMessageText('');
    setSelectedVehicle('');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return null;
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'sms' ? <Phone className="h-4 w-4" /> : <Mail className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Send New Message */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Send New Message</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Vehicle
            </label>
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">Choose vehicle...</option>
              {Object.keys(mockVehicleInfo).map(plate => (
                <option key={plate} value={plate}>
                  {plate} - {mockVehicleInfo[plate].owner}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message Type
            </label>
            <select
              value={messageType}
              onChange={(e) => setMessageType(e.target.value as 'sms' | 'email')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="sms">SMS</option>
              <option value="email">Email</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSendMessage}
              disabled={!selectedVehicle || !messageText.trim()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>Send Message</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message Content
          </label>
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Enter your message here..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
          />
        </div>

        {selectedVehicle && mockVehicleInfo[selectedVehicle] && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Vehicle Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Owner:</strong> {mockVehicleInfo[selectedVehicle].owner}</p>
                <p><strong>Vehicle:</strong> {mockVehicleInfo[selectedVehicle].year} {mockVehicleInfo[selectedVehicle].make} {mockVehicleInfo[selectedVehicle].model}</p>
              </div>
              <div>
                {mockVehicleInfo[selectedVehicle].phoneNumber && (
                  <p><strong>Phone:</strong> {mockVehicleInfo[selectedVehicle].phoneNumber}</p>
                )}
                {mockVehicleInfo[selectedVehicle].email && (
                  <p><strong>Email:</strong> {mockVehicleInfo[selectedVehicle].email}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Message Logs */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Message History</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-gray-600" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        {log.vehicleNumber}
                      </span>
                      <div className="flex items-center space-x-1 text-gray-600">
                        {getTypeIcon(log.type)}
                        <span className="text-sm">
                          {log.type === 'sms' ? log.phoneNumber : log.email}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 text-sm mb-2">{log.message}</p>
                    
                    <p className="text-xs text-gray-500">
                      Sent on {format(log.sentAt, 'MMM dd, yyyy at HH:mm')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getStatusIcon(log.status)}
                  <span className="text-sm font-medium text-gray-600 capitalize">
                    {log.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredLogs.length === 0 && (
          <div className="p-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No messages found</p>
          </div>
        )}
      </div>
    </div>
  );
};