
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Package, PackagePlus, PackageX } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Device, RemovalReason } from "@/types/inventory";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

interface InventoryTableProps {
  devices: Device[];
  onRemoveDevice: (deviceId: string, exitDate: Date, reason: RemovalReason) => void;
  onReturnDevice: (deviceId: string) => void;
}

const InventoryTable: React.FC<InventoryTableProps> = ({ 
  devices, 
  onRemoveDevice,
  onReturnDevice
}) => {
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [exitDate, setExitDate] = useState<Date>(new Date());
  const [removalReason, setRemovalReason] = useState<RemovalReason>(null);
  const [isRemovalDialogOpen, setIsRemovalDialogOpen] = useState(false);

  const handleRemoveClick = (device: Device) => {
    setSelectedDevice(device);
    setIsRemovalDialogOpen(true);
  };

  const handleRemoveSubmit = () => {
    if (!selectedDevice || !removalReason) {
      toast.error("יש לבחור סיבת יציאה");
      return;
    }

    onRemoveDevice(selectedDevice.id, exitDate, removalReason);
    toast.success("המכשיר נרשם כיצא מהמלאי");
    setIsRemovalDialogOpen(false);
    setRemovalReason(null);
  };

  const handleReturnDevice = (device: Device) => {
    onReturnDevice(device.id);
    toast.success("המכשיר הוחזר למלאי");
  };

  return (
    <div className="rounded-md border shadow">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">פעולות</TableHead>
            <TableHead className="text-right">סיבת יציאה</TableHead>
            <TableHead className="text-right">תאריך יציאה</TableHead>
            <TableHead className="text-right">תאריך כניסה</TableHead>
            <TableHead className="text-right">מספר סידורי</TableHead>
            <TableHead className="text-right">דגם</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {devices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center p-4">
                אין מכשירים במלאי. הוסף מכשיר חדש כדי להתחיל.
              </TableCell>
            </TableRow>
          ) : (
            devices.map((device) => (
              <TableRow key={device.id}>
                <TableCell>
                  {device.exitDate ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleReturnDevice(device)}
                      className="flex items-center gap-1"
                    >
                      <PackagePlus size={16} />
                      החזר למלאי
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleRemoveClick(device)}
                      className="flex items-center gap-1 text-destructive hover:bg-destructive/10"
                    >
                      <PackageX size={16} />
                      הוצא ממלאי
                    </Button>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {device.removalReason ? 
                    getReason(device.removalReason) : 
                    <span className="text-green-600">במלאי</span>
                  }
                </TableCell>
                <TableCell className="text-right">
                  {device.exitDate ? format(new Date(device.exitDate), "dd/MM/yyyy") : "-"}
                </TableCell>
                <TableCell className="text-right">
                  {format(new Date(device.entryDate), "dd/MM/yyyy")}
                </TableCell>
                <TableCell className="text-right">{device.serialNumber}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span>{device.modelName}</span>
                    <Package size={16} />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={isRemovalDialogOpen} onOpenChange={setIsRemovalDialogOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">הוצאת מכשיר מהמלאי</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="exitDate" className="text-right block">תאריך יציאה</Label>
              <Calendar
                id="exitDate"
                mode="single"
                selected={exitDate}
                onSelect={(date) => date && setExitDate(date)}
                className="rounded-md border mx-auto"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-right block">סיבת יציאה</Label>
              <Select
                dir="rtl" 
                value={removalReason || ""}
                onValueChange={(value: RemovalReason) => setRemovalReason(value)}
              >
                <SelectTrigger className="w-full text-right">
                  <SelectValue placeholder="בחר סיבת יציאה" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rental">השכרה</SelectItem>
                  <SelectItem value="loan">השאלה</SelectItem>
                  <SelectItem value="sale">מכירה</SelectItem>
                  <SelectItem value="development">פיתוח</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="button" onClick={handleRemoveSubmit}>
              אישור
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

function getReason(reason: RemovalReason): string {
  switch (reason) {
    case "rental": return "השכרה";
    case "loan": return "השאלה";
    case "sale": return "מכירה";
    case "development": return "פיתוח";
    default: return "";
  }
}

export default InventoryTable;
