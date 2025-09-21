import React, { useState } from 'react';
import { mockViolations, mockVehicleInfo } from '../data/mockData';
import { Violation } from '../types';
import { format } from 'date-fns';
import { Search, Filter, Edit2, Eye, Car } from 'lucide-react';

export const ViolationLog: React.FC = () => {
  const [violations, setViolations] = useState(mockViolations);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const filteredViolations = violations.filter(violation => {
    const matchesSearch = violation.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (violation.vehicleNumber && violation.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || violation.type === filterType;
    const matchesStatus = filterStatus === 'all' || violation.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleEditVehicleNumber = (id: string, currentNumber: string | undefined) => {
    setEditingId(id);
    setEditValue(currentNumber || '');
  };

  const saveVehicleNumber = (id: string) => {
    setViolations(prev => 
      prev.map(violation => 
        violation.id === id 
          ? { ...violation, vehicleNumber: editValue.toUpperCase() }
          : violation
      )
    );
    setEditingId(null);
    setEditValue('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getViolationTypeColor = (type: string) => {
    switch (type) {
      case 'speeding': return 'bg-red-100 text-red-800';
      case 'red_light': return 'bg-orange-100 text-orange-800';
      case 'wrong_lane': return 'bg-purple-100 text-purple-800';
      case 'no_parking': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search location or vehicle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white"
            >
              <option value="all">All Types</option>
              <option value="speeding">Speeding</option>
              <option value="red_light">Red Light</option>
              <option value="wrong_lane">Wrong Lane</option>
              <option value="no_parking">No Parking</option>
            </select>
          </div>

          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processed">Processed</option>
              <option value="sent">Sent</option>
            </select>
          </div>

          <div className="text-right">
            <span className="text-sm text-gray-600">
              {filteredViolations.length} violations found
            </span>
          </div>
        </div>
      </div>

      {/* Violations Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Violation
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time & Location
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type & Speed
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle Number
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredViolations.map((violation) => (
                <tr key={violation.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={violation.image} 
                        alt="Violation" 
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {format(violation.timestamp, 'MMM dd, yyyy')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {format(violation.timestamp, 'HH:mm:ss')}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {violation.location}
                      </p>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getViolationTypeColor(violation.type)}`}>
                        {violation.type.replace('_', ' ')}
                      </span>
                      {violation.speed && (
                        <p className="text-sm text-red-600 font-medium">
                          {violation.speed} mph
                        </p>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    {editingId === violation.id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none"
                          placeholder="ABC-123"
                        />
                        <button
                          onClick={() => saveVehicleNumber(violation.id)}
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-gray-600 hover:text-gray-800 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        {violation.vehicleNumber ? (
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                            {violation.vehicleNumber}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">Not recorded</span>
                        )}
                        <button
                          onClick={() => handleEditVehicleNumber(violation.id, violation.vehicleNumber)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(violation.status)}`}>
                      {violation.status}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        <Eye className="h-4 w-4" />
                      </button>
                      {violation.vehicleNumber && mockVehicleInfo[violation.vehicleNumber] && (
                        <button className="text-green-600 hover:text-green-800">
                          <Car className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};