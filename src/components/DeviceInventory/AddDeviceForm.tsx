
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";

interface AddDeviceFormProps {
  onAddDevice: (modelName: string, serialNumber: string, entryDate: Date) => void;
}

const AddDeviceForm: React.FC<AddDeviceFormProps> = ({ onAddDevice }) => {
  const [modelName, setModelName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [entryDate, setEntryDate] = useState<Date | undefined>(new Date());
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelName || !serialNumber || !entryDate) {
      toast.error("יש למלא את כל השדות");
      return;
    }

    onAddDevice(modelName, serialNumber, entryDate);
    toast.success("מכשיר נוסף בהצלחה");
    
    // Reset form
    setModelName("");
    setSerialNumber("");
    setEntryDate(new Date());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold text-right">הוספת מכשיר חדש</h2>
      
      <div className="space-y-2">
        <Label htmlFor="modelName" className="text-right block">דגם המכשיר</Label>
        <Input
          id="modelName"
          dir="rtl"
          value={modelName}
          onChange={(e) => setModelName(e.target.value)}
          placeholder="הזן דגם מכשיר"
          className="text-right"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="serialNumber" className="text-right block">מספר סידורי</Label>
        <Input
          id="serialNumber"
          dir="rtl"
          value={serialNumber}
          onChange={(e) => setSerialNumber(e.target.value)}
          placeholder="הזן מספר סידורי"
          className="text-right"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="entryDate" className="text-right block">תאריך כניסה למלאי</Label>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              id="entryDate"
              variant="outline"
              className="w-full justify-between text-right"
            >
              {entryDate ? format(entryDate, "dd/MM/yyyy") : "בחר תאריך"}
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={entryDate}
              onSelect={(date) => {
                setEntryDate(date);
                setIsOpen(false);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <Button type="submit" className="w-full">הוסף מכשיר</Button>
    </form>
  );
};

export default AddDeviceForm;
