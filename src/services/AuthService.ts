import { v4 as uuidv4 } from 'uuid';
import { db, type DeviceInfo } from '../lib/db-setup';

export class AuthService {
  private deviceId: string;

  constructor() {
    this.deviceId = this.getOrCreateDeviceId();
  }

  private getOrCreateDeviceId(): string {
    const storedId = localStorage.getItem('deviceId');
    if (storedId) return storedId;

    const newId = `device_${uuidv4()}`;
    localStorage.setItem('deviceId', newId);
    return newId;
  }

  async registerDevice() {
    await db.devices.put({
      id: this.deviceId,
      name: navigator.userAgent,
      ip: await this.getClientIP(),
      lastSeen: new Date()
    });
  }

  async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Error getting IP:', error);
      return 'unknown';
    }
  }

  async isAuthorized(): Promise<boolean> {
    try {
      const deviceInfo = await db.devices.get(this.deviceId);
      return !!deviceInfo;
    } catch (error) {
      return false;
    }
  }

  getDeviceId(): string {
    return this.deviceId;
  }

  async updateLastSeen() {
    try {
      const deviceInfo = await db.devices.get(this.deviceId);
      await db.devices.put({
        ...deviceInfo,
        lastSeen: new Date()
      });
    } catch (error) {
      console.error('Error updating last seen:', error);
    }
  }
}

export const authService = new AuthService(); 