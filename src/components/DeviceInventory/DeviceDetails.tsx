
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeviceModel, InventoryStats } from "@/types/inventory";

interface DeviceDetailsProps {
  stats: InventoryStats;
  models: DeviceModel[];
}

const DeviceDetails: React.FC<DeviceDetailsProps> = ({ stats, models }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard 
        title="סה״כ מכשירים" 
        value={stats.totalDevices} 
        colorClass="bg-blue-100"
      />
      <StatsCard 
        title="מכשירים במלאי" 
        value={stats.availableDevices}
        colorClass="bg-green-100"
      />
      <StatsCard 
        title="מכשירים בהשכרה/השאלה" 
        value={stats.rentedDevices + stats.loanedDevices}
        colorClass="bg-amber-100"
      />
      <StatsCard 
        title="מכשירים שנמכרו" 
        value={stats.soldDevices}
        colorClass="bg-purple-100"
      />
      <StatsCard 
        title="מכשירים לפיתוח" 
        value={stats.developmentDevices}
        colorClass="bg-orange-100"
      />
      
      <div className="md:col-span-2 lg:col-span-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-right">דגמי מכשירים במלאי</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-right py-2 px-4">זמינים</th>
                    <th className="text-right py-2 px-4">כמות כוללת</th>
                    <th className="text-right py-2 px-4">דגם</th>
                  </tr>
                </thead>
                <tbody>
                  {!models || models.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-4">
                        אין דגמים להצגה
                      </td>
                    </tr>
                  ) : (
                    models.map((model) => (
                      <tr key={model.id} className="border-t">
                        <td className="py-2 px-4 text-right">{model.availableCount}</td>
                        <td className="py-2 px-4 text-right">{model.totalCount}</td>
                        <td className="py-2 px-4 text-right font-medium">{model.name}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value: number;
  colorClass: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, colorClass }) => {
  return (
    <Card className={`${colorClass} border-none`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-right">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold text-right">{value}</p>
      </CardContent>
    </Card>
  );
};

export default DeviceDetails;
