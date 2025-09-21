export interface Violation {
  id: string;
  timestamp: Date;
  type: 'speeding' | 'red_light' | 'wrong_lane' | 'no_parking';
  image: string;
  speed?: number;
  vehicleNumber?: string;
  location: string;
  status: 'pending' | 'processed' | 'sent';
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'operator';
}

export interface MessageLog {
  id: string;
  violationId: string;
  vehicleNumber: string;
  phoneNumber?: string;
  email?: string;
  message: string;
  sentAt: Date;
  status: 'sent' | 'failed' | 'pending';
  type: 'sms' | 'email';
}

export interface VehicleInfo {
  plateNumber: string;
  owner: string;
  phoneNumber?: string;
  email?: string;
  make: string;
  model: string;
  year: number;
}