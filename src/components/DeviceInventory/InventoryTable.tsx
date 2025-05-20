import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Package, PackagePlus, PackageX } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Device, RemovalReason, CustomerInfo } from "@/types/inventory";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
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
  selectedDeviceIds: z.array(z.string()).min(1, { message: "יש לבחור לפחות מכשיר אחד" }),
});

type RemoveDeviceForm = z.infer<typeof removeDeviceSchema>;

interface GroupedDevice {
  modelName: string;
  devices: Device[];
  availableCount: number;
}

const InventoryTable: React.FC<InventoryTableProps> = ({ 
  devices, 
  onRemoveDevice,
  onReturnDevice
}) => {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [exitDate, setExitDate] = useState<Date>(new Date());
  const [isRemovalDialogOpen, setIsRemovalDialogOpen] = useState(false);

  // Group devices by model
  const groupedDevices = devices.reduce<GroupedDevice[]>((acc, device) => {
    const existingGroup = acc.find(group => group.modelName === device.modelName);
    
    if (existingGroup) {
      existingGroup.devices.push(device);
      if (device.exitDate === null) {
        existingGroup.availableCount += 1;
      }
    } else {
      acc.push({
        modelName: device.modelName,
        devices: [device],
        availableCount: device.exitDate === null ? 1 : 0
      });
    }
    
    return acc;
  }, []);

  const form = useForm<RemoveDeviceForm>({
    resolver: zodResolver(removeDeviceSchema),
    defaultValues: {
      reason: "rental",
      customerName: "",
      terminalId: "",
      email: "",
      phone: "",
      accountCode: "",
      selectedDeviceIds: [],
    },
  });

  const handleRemoveClick = (modelName: string) => {
    setSelectedModel(modelName);
    setIsRemovalDialogOpen(true);
    form.reset({
      reason: "rental",
      customerName: "",
      terminalId: "",
      email: "",
      phone: "",
      accountCode: "",
      selectedDeviceIds: [],
    });
  };

  const handleRemoveSubmit = (data: RemoveDeviceForm) => {
    if (!selectedModel || data.selectedDeviceIds.length === 0) {
      toast.error("לא נבחרו מכשירים");
      return;
    }

    const customerInfo: CustomerInfo = {
      name: data.customerName,
      terminalId: data.terminalId,
      email: data.email,
      phone: data.phone,
      accountCode: data.accountCode,
    };

    // Process each selected device
    data.selectedDeviceIds.forEach(deviceId => {
      onRemoveDevice(deviceId, exitDate, data.reason, customerInfo);
    });
    
    toast.success(`${data.selectedDeviceIds.length} מכשירים נרשמו כיצאו מהמלאי`);
    setIsRemovalDialogOpen(false);
  };

  const handleReturnDevice = (device: Device) => {
    onReturnDevice(device.id);
    toast.success("המכשיר הוחזר למלאי");
  };

  // Get available devices for the selected model
  const availableDevices = selectedModel ? 
    devices.filter(d => d.modelName === selectedModel && d.exitDate === null) : 
    [];

  return (
    <div className="rounded-md border shadow">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">פעולות</TableHead>
            <TableHead className="text-right">מכשירים במלאי</TableHead>
            <TableHead className="text-right">סה"כ מכשירים</TableHead>
            <TableHead className="text-right">דגם</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groupedDevices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center p-4">
                אין מכשירים במלאי. הוסף מכשיר חדש כדי להתחיל.
              </TableCell>
            </TableRow>
          ) : (
            groupedDevices.map((group) => (
              <TableRow key={group.modelName}>
                <TableCell>
                  {group.availableCount > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleRemoveClick(group.modelName)}
                      className="flex items-center gap-1 text-destructive hover:bg-destructive/10"
                    >
                      <PackageX size={16} />
                      הוצא ממלאי
                    </Button>
                  )}
                </TableCell>
                <TableCell className="text-right font-medium">
                  <span className="text-green-600">{group.availableCount}</span>
                </TableCell>
                <TableCell className="text-right">{group.devices.length}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span>{group.modelName}</span>
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
            <DialogDescription className="text-right">
              דגם: {selectedModel}
            </DialogDescription>
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

              <div className="space-y-3">
                <Label className="text-right block">בחר מכשירים להוצאה מהמלאי</Label>
                <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                  {availableDevices.length === 0 ? (
                    <p className="text-center text-muted-foreground p-2">אין מכשירים זמינים מדגם זה</p>
                  ) : (
                    <div className="space-y-2">
                      {availableDevices.map((device) => (
                        <FormField
                          key={device.id}
                          control={form.control}
                          name="selectedDeviceIds"
                          render={({ field }) => (
                            <FormItem key={device.id} className="flex items-center space-x-1 space-x-reverse">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(device.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange([...field.value, device.id]);
                                    } else {
                                      field.onChange(
                                        field.value?.filter((value) => value !== device.id)
                                      );
                                    }
                                  }}
                                />
                              </FormControl>
                              <div className="text-right flex-1">
                                <span className="ml-2">{device.serialNumber}</span>
                                <span className="text-muted-foreground text-xs block">
                                  {format(new Date(device.entryDate), "dd/MM/yyyy")}
                                </span>
                              </div>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  )}
                </div>
                {form.formState.errors.selectedDeviceIds && (
                  <p className="text-sm font-medium text-destructive text-right">
                    {form.formState.errors.selectedDeviceIds.message}
                  </p>
                )}
              </div>

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
