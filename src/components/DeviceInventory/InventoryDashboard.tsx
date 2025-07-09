
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import AddDeviceForm from "./AddDeviceForm";
import InventoryTable from "./InventoryTable";
import DeviceDetails from "./DeviceDetails";
import { useInventory } from "@/hooks/useInventory";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { DeviceModel } from "@/types/inventory";

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
  const [models, setModels] = useState<DeviceModel[]>([]);
  
  const filteredDevices = devices.filter((device) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      device.modelName.toLowerCase().includes(searchLower) ||
      device.serialNumber.toLowerCase().includes(searchLower)
    );
  });

  // Fetch models when component mounts
  useEffect(() => {
    const fetchModels = async () => {
      const deviceModels = await getDeviceModels();
      setModels(deviceModels);
    };
    
    fetchModels();
  }, [getDeviceModels]);

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

      {/* Navigation buttons */}
      <div className="flex gap-2 mb-6 justify-start">
        <Link to="/rented-devices">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <span>מסופונים בהשכרה</span>
          </Button>
        </Link>
        <Link to="/loaned-devices">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <span>מלאי מסופונים</span>
          </Button>
        </Link>
        <Link to="/sold-devices">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <span>רמת מלאי כללי</span>
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="dashboard" dir="ltr" className="w-full">
        <TabsList className="mb-4 w-full justify-start">
          <TabsTrigger value="dashboard">לוח מחוונים</TabsTrigger>
          <TabsTrigger value="inventory">מלאי</TabsTrigger>
          <TabsTrigger value="add">הוספת מכשיר</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <DeviceDetails stats={stats} models={models} />
        </TabsContent>
        
        <TabsContent value="inventory" className="space-y-4">
          <InventoryTable 
            devices={filteredDevices} 
            onRemoveDevice={(deviceId, exitDate, reason, customerInfo) => removeDevice(deviceId, exitDate, reason, customerInfo)}
            onReturnDevice={returnDevice}
          />
        </TabsContent>
        
        <TabsContent value="add">
          <div className="max-w-md mx-auto">
            <AddDeviceForm onAddDevice={addDevice} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryDashboard;
