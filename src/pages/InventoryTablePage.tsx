import React from "react";
import InventoryTable from "@/components/DeviceInventory/InventoryTable";
import { Device } from "@/types/inventory";
import { useInventory } from "@/hooks/useInventory";

const InventoryTablePage: React.FC = () => {
  const { devices, removeDevice, returnDevice } = useInventory();

  const handleRemoveDevice = (deviceId: string, exitDate: Date, reason: any, customerInfo: any) => {
    removeDevice(deviceId, exitDate, reason, customerInfo);
  };

  const handleReturnDevice = (deviceId: string) => {
    returnDevice(deviceId);
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-right mb-2">טבלת מלאי מכשירים</h1>
          <p className="text-gray-600 text-right">ניהול ועריכת מכשירי הסליקה במלאי</p>
        </div>
        
        <InventoryTable 
          devices={devices}
          onRemoveDevice={handleRemoveDevice}
          onReturnDevice={handleReturnDevice}
        />
      </div>
    </div>
  );
};

export default InventoryTablePage;