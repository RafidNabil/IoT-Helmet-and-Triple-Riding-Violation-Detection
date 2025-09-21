import React from 'react';
import { mockViolations } from '../data/mockData';
import { AlertTriangle, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

export const Dashboard: React.FC = () => {
  const todayViolations = mockViolations.filter(
    v => format(v.timestamp, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  );

  const stats = [
    {
      title: 'Today\'s Violations',
      value: todayViolations.length.toString(),
      icon: AlertTriangle,
      color: 'bg-red-500',
      change: '+12%'
    },
    {
      title: 'Total Processed',
      value: mockViolations.filter(v => v.status === 'processed').length.toString(),
      icon: CheckCircle,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: 'Pending Review',
      value: mockViolations.filter(v => v.status === 'pending').length.toString(),
      icon: Clock,
      color: 'bg-yellow-500',
      change: '-5%'
    },
    {
      title: 'Messages Sent',
      value: mockViolations.filter(v => v.status === 'sent').length.toString(),
      icon: TrendingUp,
      color: 'bg-blue-500',
      change: '+15%'
    }
  ];

  const violationTypes = mockViolations.reduce((acc, violation) => {
    acc[violation.type] = (acc[violation.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const recentViolations = mockViolations
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <p className="text-green-600 text-sm font-medium mt-1">{stat.change} from yesterday</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Violations */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Recent Violations</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentViolations.map((violation) => (
                <div key={violation.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <img 
                    src={violation.image} 
                    alt="Violation" 
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 capitalize">
                        {violation.type.replace('_', ' ')} 
                        {violation.speed && ` (${violation.speed} mph)`}
                      </p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        violation.status === 'processed' ? 'bg-green-100 text-green-800' :
                        violation.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {violation.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      {violation.location} • {format(violation.timestamp, 'MMM dd, HH:mm')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Violation Types Chart */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Violation Types</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {Object.entries(violationTypes).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span className="font-medium text-gray-900 capitalize">
                      {type.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${(count / mockViolations.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-gray-600 font-medium w-6 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};