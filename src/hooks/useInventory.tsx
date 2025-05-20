import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Device, DeviceModel, InventoryStats, RemovalReason, CustomerInfo } from "@/types/inventory";

// Mock data for initial development
const initialDevices: Device[] = [
  {
    id: "1",
    modelName: "Verifone V240m",
    serialNumber: "VF-12345",
    entryDate: new Date(2023, 1, 15),
    exitDate: null,
    removalReason: null,
    customerInfo: null
  },
  {
    id: "2",
    modelName: "PAX A920",
    serialNumber: "PAX-67890",
    entryDate: new Date(2023, 2, 10),
    exitDate: new Date(2023, 5, 20),
    removalReason: "rental",
    customerInfo: {
      name: "חברת אלפא",
      terminalId: "TER-1234",
      email: "alpha@example.com",
      phone: "052-1234567",
      accountCode: "ACC-001"
    }
  },
  {
    id: "3",
    modelName: "Ingenico Move 5000",
    serialNumber: "ING-54321",
    entryDate: new Date(2023, 3, 5),
    exitDate: new Date(2023, 7, 12),
    removalReason: "sale",
    customerInfo: {
      name: "חברת ביטא",
      terminalId: "TER-5678",
      email: "beta@example.com",
      phone: "053-7654321",
      accountCode: "ACC-002"
    }
  },
];

export function useInventory() {
  const [devices, setDevices] = useState<Device[]>(() => {
    const savedDevices = localStorage.getItem("inventoryDevices");
    return savedDevices ? JSON.parse(savedDevices) : initialDevices;
  });
  
  const [stats, setStats] = useState<InventoryStats>({
    totalDevices: 0,
    availableDevices: 0,
    rentedDevices: 0,
    loanedDevices: 0,
    soldDevices: 0,
    developmentDevices: 0,
  });

  // Save to localStorage whenever devices change
  useEffect(() => {
    localStorage.setItem("inventoryDevices", JSON.stringify(devices));
    calculateStats();
  }, [devices]);

  const calculateStats = () => {
    const newStats: InventoryStats = {
      totalDevices: devices.length,
      availableDevices: devices.filter(d => d.exitDate === null).length,
      rentedDevices: devices.filter(d => d.removalReason === "rental").length,
      loanedDevices: devices.filter(d => d.removalReason === "loan").length,
      soldDevices: devices.filter(d => d.removalReason === "sale").length,
      developmentDevices: devices.filter(d => d.removalReason === "development").length,
    };
    setStats(newStats);
  };

  const getDeviceModels = (): DeviceModel[] => {
    const modelMap = new Map<string, { total: number, available: number }>();
    
    // Count devices by model
    devices.forEach(device => {
      if (!modelMap.has(device.modelName)) {
        modelMap.set(device.modelName, { total: 0, available: 0 });
      }
      
      const modelData = modelMap.get(device.modelName)!;
      modelData.total += 1;
      
      if (!device.exitDate) {
        modelData.available += 1;
      }
    });
    
    // Convert map to array of DeviceModel objects
    return Array.from(modelMap.entries()).map(([name, counts]) => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      totalCount: counts.total,
      availableCount: counts.available,
    }));
  };

  const addDevice = (
    modelName: string,
    serialNumber: string,
    entryDate: Date
  ): void => {
    const newDevice: Device = {
      id: uuidv4(),
      modelName,
      serialNumber,
      entryDate,
      exitDate: null,
      removalReason: null,
      customerInfo: null
    };
    
    setDevices(prev => [...prev, newDevice]);
  };

  const removeDevice = (
    deviceId: string,
    exitDate: Date,
    reason: RemovalReason,
    customerInfo: CustomerInfo
  ): void => {
    setDevices(prev =>
      prev.map(device =>
        device.id === deviceId
          ? { ...device, exitDate, removalReason: reason, customerInfo }
          : device
      )
    );
  };

  const returnDevice = (deviceId: string): void => {
    setDevices(prev =>
      prev.map(device =>
        device.id === deviceId
          ? { ...device, exitDate: null, removalReason: null, customerInfo: null }
          : device
      )
    );
  };

  const getDevicesByRemovalReason = (reason: RemovalReason): Device[] => {
    return devices.filter(device => device.removalReason === reason);
  };

  return {
    devices,
    stats,
    getDeviceModels,
    addDevice,
    removeDevice,
    returnDevice,
    getDevicesByRemovalReason,
  };
}
