
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Grid3X3 } from "lucide-react";
import AddDeviceForm from "./AddDeviceForm";
import InventoryTable from "./InventoryTable";
import DeviceDetails from "./DeviceDetails";
import { useInventory } from "@/hooks/useInventory";
import { Device } from "@/types/inventory";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const InventoryDashboard: React.FC = () => {
  const {
    devices,
    stats,
    getDeviceModels,
    addDevice,
    removeDevice,
    returnDevice,
  } = useInventory();
  
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredDevices = devices.filter((device) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      device.modelName.toLowerCase().includes(searchLower) ||
      device.serialNumber.toLowerCase().includes(searchLower)
    );
  });
  
  // Sort devices to show available first, then by entry date (newest first)
  const sortedDevices = [...filteredDevices].sort((a, b) => {
    // First sort by availability
    if (a.exitDate === null && b.exitDate !== null) return -1;
    if (a.exitDate !== null && b.exitDate === null) return 1;
    
    // Then by entry date (newest first)
    return new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime();
  });

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">ניהול מלאי מכשירי סליקה</h1>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="חיפוש מכשיר..."
            className="pl-8 text-right"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Link to="/rented-devices">
          <Button variant="outline" className="w-full h-full py-4 flex flex-col items-center justify-center">
            <div className="font-bold">מכשירים בהשכרה</div>
            <div className="text-lg font-semibold text-blue-600">{stats.rentedDevices}</div>
          </Button>
        </Link>
        <Link to="/loaned-devices">
          <Button variant="outline" className="w-full h-full py-4 flex flex-col items-center justify-center">
            <div className="font-bold">מכשירים בהשאלה</div>
            <div className="text-lg font-semibold text-green-600">{stats.loanedDevices}</div>
          </Button>
        </Link>
        <Link to="/sold-devices">
          <Button variant="outline" className="w-full h-full py-4 flex flex-col items-center justify-center">
            <div className="font-bold">מכשירים שנמכרו</div>
            <div className="text-lg font-semibold text-purple-600">{stats.soldDevices}</div>
          </Button>
        </Link>
        <Link to="/development-devices">
          <Button variant="outline" className="w-full h-full py-4 flex flex-col items-center justify-center">
            <div className="font-bold">מכשירים לפיתוח</div>
            <div className="text-lg font-semibold text-amber-600">{stats.developmentDevices}</div>
          </Button>
        </Link>
        <Link to="/devices-by-model">
          <Button variant="outline" className="w-full h-full py-4 flex flex-col items-center justify-center">
            <div className="font-bold">סיכום לפי דגם</div>
            <Grid3X3 className="mt-1 h-5 w-5 text-gray-600" />
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="inventory" dir="rtl" className="w-full">
        <TabsList className="mb-4 w-full justify-start">
          <TabsTrigger value="inventory">מלאי</TabsTrigger>
          <TabsTrigger value="add">הוספת מכשיר</TabsTrigger>
          <TabsTrigger value="dashboard">לוח מחוונים</TabsTrigger>
        </TabsList>
        
        <TabsContent value="inventory" className="space-y-4">
          <InventoryTable 
            devices={sortedDevices} 
            onRemoveDevice={(deviceId, exitDate, reason, customerInfo) => removeDevice(deviceId, exitDate, reason, customerInfo)}
            onReturnDevice={returnDevice}
          />
        </TabsContent>
        
        <TabsContent value="add">
          <div className="max-w-md mx-auto">
            <AddDeviceForm onAddDevice={addDevice} />
          </div>
        </TabsContent>
        
        <TabsContent value="dashboard">
          <DeviceDetails stats={stats} models={getDeviceModels()} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryDashboard;
