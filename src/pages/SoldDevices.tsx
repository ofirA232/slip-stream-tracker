
import React, { useState } from "react";
import { useInventory } from "@/hooks/useInventory";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

const SoldDevices: React.FC = () => {
  const { devices } = useInventory();
  const [searchTerm, setSearchTerm] = useState("");
  
  const soldDevices = devices.filter(
    (device) => device.removalReason === "sale" &&
    (searchTerm === "" || 
     device.modelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     device.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
     device.customerInfo?.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <Link to="/">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowRight size={16} />
            חזרה לדף הראשי
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">מכשירים שנמכרו</h1>
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
      
      <Card>
        <CardHeader>
          <CardTitle className="text-right">רשימת מכשירים שנמכרו</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">קוד הנה״ח</TableHead>
                <TableHead className="text-right">טלפון</TableHead>
                <TableHead className="text-right">מייל</TableHead>
                <TableHead className="text-right">מספר מסוף</TableHead>
                <TableHead className="text-right">שם לקוח</TableHead>
                <TableHead className="text-right">תאריך מכירה</TableHead>
                <TableHead className="text-right">מספר סידורי</TableHead>
                <TableHead className="text-right">דגם</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {soldDevices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    לא נמצאו מכשירים שנמכרו
                  </TableCell>
                </TableRow>
              ) : (
                soldDevices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell className="text-right">{device.customerInfo?.accountCode || '-'}</TableCell>
                    <TableCell className="text-right">{device.customerInfo?.phone || '-'}</TableCell>
                    <TableCell className="text-right">{device.customerInfo?.email || '-'}</TableCell>
                    <TableCell className="text-right">{device.customerInfo?.terminalId || '-'}</TableCell>
                    <TableCell className="text-right">{device.customerInfo?.name || '-'}</TableCell>
                    <TableCell className="text-right">
                      {device.exitDate ? format(new Date(device.exitDate), "dd/MM/yyyy") : "-"}
                    </TableCell>
                    <TableCell className="text-right">{device.serialNumber}</TableCell>
                    <TableCell className="text-right">{device.modelName}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SoldDevices;
