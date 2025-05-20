
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Package, PackagePlus, PackageX } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Device, RemovalReason, CustomerInfo } from "@/types/inventory";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface InventoryTableProps {
  devices: Device[];
  onRemoveDevice: (deviceId: string, exitDate: Date, reason: RemovalReason, customerInfo: CustomerInfo) => void;
  onReturnDevice: (deviceId: string) => void;
}

const removeDeviceSchema = z.object({
  reason: z.enum(["rental", "loan", "sale", "development"] as const),
  customerName: z.string().min(1, { message: "שם לקוח נדרש" }),
  terminalId: z.string().min(1, { message: "מספר מסוף נדרש" }),
  email: z.string().email({ message: "מייל לא תקין" }),
  phone: z.string().min(9, { message: "מספר טלפון לא תקין" }),
  accountCode: z.string().min(1, { message: "קוד הנה״ח נדרש" }),
});

type RemoveDeviceForm = z.infer<typeof removeDeviceSchema>;

const InventoryTable: React.FC<InventoryTableProps> = ({ 
  devices, 
  onRemoveDevice,
  onReturnDevice
}) => {
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [exitDate, setExitDate] = useState<Date>(new Date());
  const [isRemovalDialogOpen, setIsRemovalDialogOpen] = useState(false);

  const form = useForm<RemoveDeviceForm>({
    resolver: zodResolver(removeDeviceSchema),
    defaultValues: {
      reason: "rental",
      customerName: "",
      terminalId: "",
      email: "",
      phone: "",
      accountCode: "",
    },
  });

  const handleRemoveClick = (device: Device) => {
    setSelectedDevice(device);
    setIsRemovalDialogOpen(true);
    form.reset();
  };

  const handleRemoveSubmit = (data: RemoveDeviceForm) => {
    if (!selectedDevice) {
      toast.error("לא נבחר מכשיר");
      return;
    }

    const customerInfo: CustomerInfo = {
      name: data.customerName,
      terminalId: data.terminalId,
      email: data.email,
      phone: data.phone,
      accountCode: data.accountCode,
    };

    onRemoveDevice(selectedDevice.id, exitDate, data.reason, customerInfo);
    toast.success("המכשיר נרשם כיצא מהמלאי");
    setIsRemovalDialogOpen(false);
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
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleRemoveSubmit)} className="space-y-4">
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
              
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-right block">סיבת יציאה</FormLabel>
                    <Select
                      dir="rtl"
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full text-right">
                          <SelectValue placeholder="בחר סיבת יציאה" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="rental">השכרה</SelectItem>
                        <SelectItem value="loan">השאלה</SelectItem>
                        <SelectItem value="sale">מכירה</SelectItem>
                        <SelectItem value="development">פיתוח</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-right block">שם לקוח</FormLabel>
                    <FormControl>
                      <Input dir="rtl" className="text-right" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="terminalId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-right block">מספר מסוף</FormLabel>
                    <FormControl>
                      <Input dir="rtl" className="text-right" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-right block">מייל לקוח</FormLabel>
                    <FormControl>
                      <Input dir="rtl" className="text-right" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-right block">מספר טלפון</FormLabel>
                    <FormControl>
                      <Input dir="rtl" className="text-right" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accountCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-right block">קוד הנה״ח</FormLabel>
                    <FormControl>
                      <Input dir="rtl" className="text-right" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit">
                  אישור
                </Button>
              </div>
            </form>
          </Form>
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
