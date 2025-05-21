
import React, { useState } from "react";
import { useInventory } from "@/hooks/useInventory";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, PackagePlus, ArrowRight, ChevronsUpDown } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

const RentedDevices: React.FC = () => {
  const { devices, returnDevice } = useInventory();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [customerForReturn, setCustomerForReturn] = useState<string | null>(null);
  
  // Group devices by customer
  const devicesByCustomer = devices
    .filter(device => device.removalReason === "rental")
    .reduce((acc, device) => {
      if (!device.customerInfo) return acc;
      
      const customerName = device.customerInfo.name;
      if (!acc[customerName]) {
        acc[customerName] = [];
      }
      
      // Add to filter check
      if (searchTerm === "" || 
          device.modelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          device.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customerName.toLowerCase().includes(searchTerm.toLowerCase())) {
        acc[customerName].push(device);
      }
      
      return acc;
    }, {} as Record<string, typeof devices>);
  
  const handleOpenReturnDialog = (customerName: string) => {
    setCustomerForReturn(customerName);
    setSelectedDeviceIds([]);
    setIsReturnDialogOpen(true);
  };
  
  const handleReturnDevices = () => {
    if (selectedDeviceIds.length === 0) {
      toast.error("לא נבחרו מכשירים להחזרה");
      return;
    }
    
    selectedDeviceIds.forEach(id => {
      returnDevice(id);
    });
    
    toast.success(`${selectedDeviceIds.length} מכשירים הוחזרו למלאי`);
    setIsReturnDialogOpen(false);
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <Link to="/">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowRight size={16} />
            חזרה לדף הראשי
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">מכשירים בהשכרה</h1>
      </div>
      
      <div className="relative w-full md:w-64 ml-auto mb-4">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          placeholder="חיפוש לפי דגם, מספר סידורי או לקוח..."
          className="pl-8 text-right"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {Object.keys(devicesByCustomer).length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            לא נמצאו מכשירים בהשכרה
          </CardContent>
        </Card>
      ) : (
        Object.entries(devicesByCustomer).map(([customerName, customerDevices]) => (
          <Card key={customerName} className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-start flex-col">
                <CardTitle className="text-right">{customerName}</CardTitle>
                <div className="text-sm text-muted-foreground">
                  {customerDevices.length > 0 && customerDevices[0].customerInfo && (
                    <>
                      <div>מספר מסוף: {customerDevices[0].customerInfo.terminalId}</div>
                      <div>טלפון: {customerDevices[0].customerInfo.phone}</div>
                    </>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenReturnDialog(customerName)}
                className="flex items-center gap-1"
              >
                <PackagePlus size={16} />
                החזר מכשירים למלאי
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">דגם</TableHead>
                    <TableHead className="text-right">מספר סידורי</TableHead>
                    <TableHead className="text-right">תאריך יציאה</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerDevices.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell className="text-right">{device.modelName}</TableCell>
                      <TableCell className="text-right">{device.serialNumber}</TableCell>
                      <TableCell className="text-right">
                        {device.exitDate ? format(new Date(device.exitDate), "dd/MM/yyyy") : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))
      )}
      
      <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">החזרת מכשירים למלאי</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <h3 className="mb-2 font-semibold">בחר מכשירים להחזרה:</h3>
            <div className="max-h-60 overflow-y-auto border rounded-md p-3 space-y-2">
              {customerForReturn && devicesByCustomer[customerForReturn] ? 
                devicesByCustomer[customerForReturn].map(device => (
                  <div key={device.id} className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox 
                      id={`device-${device.id}`} 
                      checked={selectedDeviceIds.includes(device.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedDeviceIds(prev => [...prev, device.id]);
                        } else {
                          setSelectedDeviceIds(prev => prev.filter(id => id !== device.id));
                        }
                      }}
                    />
                    <div className="grid gap-1 text-right flex-1">
                      <label
                        htmlFor={`device-${device.id}`}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {device.modelName}
                      </label>
                      <p className="text-sm text-muted-foreground">
                        {device.serialNumber}
                      </p>
                    </div>
                  </div>
                )) : 
                <p>לא נמצאו מכשירים</p>
              }
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsReturnDialogOpen(false)}>
              ביטול
            </Button>
            <Button 
              onClick={handleReturnDevices}
              disabled={selectedDeviceIds.length === 0}>
              החזר מכשירים למלאי ({selectedDeviceIds.length})
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RentedDevices;
