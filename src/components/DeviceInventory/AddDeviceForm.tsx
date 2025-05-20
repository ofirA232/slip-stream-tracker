
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus, Trash } from "lucide-react";
import { toast } from "sonner";

interface AddDeviceFormProps {
  onAddDevice: (modelName: string, serialNumber: string, entryDate: Date) => void;
}

const AddDeviceForm: React.FC<AddDeviceFormProps> = ({ onAddDevice }) => {
  const [modelName, setModelName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [serialNumbers, setSerialNumbers] = useState<string[]>([""]);
  const [entryDate, setEntryDate] = useState<Date | undefined>(new Date());
  const [isOpen, setIsOpen] = useState(false);

  // Update serial numbers array when quantity changes
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(e.target.value, 10) || 1;
    setQuantity(Math.max(1, newQuantity)); // Ensure at least 1 device
    
    // Update serial numbers array
    setSerialNumbers(prev => {
      const newSerialNumbers = [...prev];
      
      // If increasing quantity, add empty strings
      if (newQuantity > prev.length) {
        for (let i = prev.length; i < newQuantity; i++) {
          newSerialNumbers.push("");
        }
      }
      // If decreasing quantity, remove extra entries
      else if (newQuantity < prev.length) {
        return newSerialNumbers.slice(0, newQuantity);
      }
      
      return newSerialNumbers;
    });
  };

  // Update a specific serial number
  const updateSerialNumber = (index: number, value: string) => {
    const newSerialNumbers = [...serialNumbers];
    newSerialNumbers[index] = value;
    setSerialNumbers(newSerialNumbers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelName || !entryDate) {
      toast.error("יש למלא את שם הדגם ותאריך הכניסה");
      return;
    }

    // Check if all serial numbers are filled
    const hasEmptySerialNumbers = serialNumbers.some(sn => !sn.trim());
    if (hasEmptySerialNumbers) {
      toast.error("יש למלא מספרים סידוריים לכל המכשירים");
      return;
    }

    // Check for duplicate serial numbers
    const uniqueSerialNumbers = new Set(serialNumbers);
    if (uniqueSerialNumbers.size !== serialNumbers.length) {
      toast.error("ישנם מספרים סידוריים כפולים, אנא תקן");
      return;
    }

    // Add each device
    serialNumbers.forEach(serialNumber => {
      onAddDevice(modelName, serialNumber, entryDate);
    });
    
    toast.success(`${quantity} מכשירים נוספו בהצלחה`);
    
    // Reset form
    setModelName("");
    setQuantity(1);
    setSerialNumbers([""]);
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
        <Label htmlFor="quantity" className="text-right block">כמות</Label>
        <Input
          id="quantity"
          dir="rtl"
          type="number"
          min="1"
          value={quantity}
          onChange={handleQuantityChange}
          placeholder="הזן כמות"
          className="text-right"
        />
      </div>
      
      <div className="space-y-2">
        <Label className="text-right block">מספרים סידוריים</Label>
        {serialNumbers.map((serialNumber, index) => (
          <div key={index} className="flex gap-2 items-center">
            <Input
              dir="rtl"
              value={serialNumber}
              onChange={(e) => updateSerialNumber(index, e.target.value)}
              placeholder={`מספר סידורי למכשיר ${index + 1}`}
              className="text-right"
            />
          </div>
        ))}
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
      
      <Button type="submit" className="w-full">הוסף מכשירים</Button>
    </form>
  );
};

export default AddDeviceForm;
