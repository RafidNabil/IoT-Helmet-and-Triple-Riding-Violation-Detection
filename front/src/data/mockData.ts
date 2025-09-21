import { Violation, VehicleInfo, MessageLog } from '../types';

export const mockViolations: Violation[] = [
  {
    id: '1',
    timestamp: new Date('2024-01-15T14:30:00'),
    type: 'speeding',
    image: 'https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg',
    speed: 85,
    vehicleNumber: 'ABC-123',
    location: 'Main St & 5th Ave',
    status: 'processed'
  },
  {
    id: '2',
    timestamp: new Date('2024-01-15T15:45:00'),
    type: 'red_light',
    image: 'https://images.pexels.com/photos/358220/pexels-photo-358220.jpeg',
    vehicleNumber: 'XYZ-789',
    location: 'Broadway & Oak St',
    status: 'sent'
  },
  {
    id: '3',
    timestamp: new Date('2024-01-15T16:15:00'),
    type: 'wrong_lane',
    image: 'https://images.pexels.com/photos/707046/pexels-photo-707046.jpeg',
    location: 'Highway 101 Mile 15',
    status: 'pending'
  },
  {
    id: '4',
    timestamp: new Date('2024-01-15T17:00:00'),
    type: 'no_parking',
    image: 'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg',
    vehicleNumber: 'DEF-456',
    location: 'City Center Plaza',
    status: 'processed'
  },
  {
    id: '5',
    timestamp: new Date('2024-01-15T18:20:00'),
    type: 'speeding',
    image: 'https://images.pexels.com/photos/3136673/pexels-photo-3136673.jpeg',
    speed: 92,
    location: 'School Zone - Maple Ave',
    status: 'pending'
  }
];

export const mockVehicleInfo: Record<string, VehicleInfo> = {
  'ABC-123': {
    plateNumber: 'ABC-123',
    owner: 'John Smith',
    phoneNumber: '+1-555-0123',
    email: 'john.smith@email.com',
    make: 'Toyota',
    model: 'Camry',
    year: 2020
  },
  'XYZ-789': {
    plateNumber: 'XYZ-789',
    owner: 'Sarah Johnson',
    phoneNumber: '+1-555-0789',
    email: 'sarah.johnson@email.com',
    make: 'Honda',
    model: 'Civic',
    year: 2019
  },
  'DEF-456': {
    plateNumber: 'DEF-456',
    owner: 'Mike Davis',
    email: 'mike.davis@email.com',
    make: 'Ford',
    model: 'F-150',
    year: 2021
  }
};

export const mockMessageLogs: MessageLog[] = [
  {
    id: '1',
    violationId: '1',
    vehicleNumber: 'ABC-123',
    phoneNumber: '+1-555-0123',
    message: 'Traffic violation detected: Speeding (85 mph) on Main St & 5th Ave at 2:30 PM. Fine: $150',
    sentAt: new Date('2024-01-15T14:35:00'),
    status: 'sent',
    type: 'sms'
  },
  {
    id: '2',
    violationId: '2',
    vehicleNumber: 'XYZ-789',
    email: 'sarah.johnson@email.com',
    message: 'Traffic violation detected: Red light violation on Broadway & Oak St at 3:45 PM. Fine: $200',
    sentAt: new Date('2024-01-15T15:50:00'),
    status: 'sent',
    type: 'email'
  }
];