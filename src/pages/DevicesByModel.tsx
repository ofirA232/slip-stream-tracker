
import React from "react";
import { useInventory } from "@/hooks/useInventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const DevicesByModel: React.FC = () => {
  const { getDeviceModels } = useInventory();
  const models = getDeviceModels();
  
  // Prepare data for the chart
  const chartData = models.map(model => ({
    name: model.name,
    זמינים: model.availableCount,
    בשימוש: model.totalCount - model.availableCount,
  }));

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">ריכוז מכשירים לפי דגם</h1>
        
        <div className="grid gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-right">טבלת מכשירים לפי דגם</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">שם הדגם</TableHead>
                    <TableHead className="text-right">סך הכל מכשירים</TableHead>
                    <TableHead className="text-right">מכשירים זמינים</TableHead>
                    <TableHead className="text-right">מכשירים בשימוש</TableHead>
                    <TableHead className="text-right">אחוז זמינות</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {models.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        אין דגמים להצגה
                      </TableCell>
                    </TableRow>
                  ) : (
                    models.map((model) => (
                      <TableRow key={model.id}>
                        <TableCell className="font-medium">{model.name}</TableCell>
                        <TableCell>{model.totalCount}</TableCell>
                        <TableCell>{model.availableCount}</TableCell>
                        <TableCell>{model.totalCount - model.availableCount}</TableCell>
                        <TableCell>
                          {model.totalCount > 0 
                            ? `${Math.round((model.availableCount / model.totalCount) * 100)}%` 
                            : '0%'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-right">תרשים מכשירים לפי דגם</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="זמינים" fill="#4ade80" />
                    <Bar dataKey="בשימוש" fill="#f97316" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DevicesByModel;
