
export type RemovalReason = "rental" | "loan" | "sale" | "development" | null;

export interface Device {
  id: string;
  modelName: string;
  serialNumber: string;
  entryDate: Date;
  exitDate: Date | null;
  removalReason: RemovalReason;
}

export interface DeviceModel {
  id: string;
  name: string;
  totalCount: number;
  availableCount: number;
}

export interface InventoryStats {
  totalDevices: number;
  availableDevices: number;
  rentedDevices: number;
  loanedDevices: number;
  soldDevices: number;
  developmentDevices: number;
}
