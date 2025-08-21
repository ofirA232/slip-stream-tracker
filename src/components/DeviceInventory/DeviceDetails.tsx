
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeviceModel, InventoryStats } from "@/types/inventory";
import { Link } from "react-router-dom";

interface DeviceDetailsProps {
  stats: InventoryStats;
  models: DeviceModel[];
}

const DeviceDetails: React.FC<DeviceDetailsProps> = ({ stats, models }) => {
  return (
    <div className="space-y-6">
      {/* Grid of colored stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Link to="/rented-devices">
          <StatsCard 
            title="מסופונים בהשכרה" 
            value={stats.rentedDevices} 
            bgColor="bg-red-500"
            textColor="text-white"
          />
        </Link>
        <Link to="/sold-devices">
          <StatsCard 
            title="מסופונים שנמכרו" 
            value={stats.soldDevices}
            bgColor="bg-green-500"
            textColor="text-white"
          />
        </Link>
        <StatsCard 
          title="סה״כ מסופונים" 
          value={stats.totalDevices}
          bgColor="bg-blue-900"
          textColor="text-white"
        />
        <Link to="/development-devices">
          <StatsCard 
            title="מסופונים לפיתוח" 
            value={stats.developmentDevices}
            bgColor="bg-purple-500"
            textColor="text-white"
          />
        </Link>
        <Link to="/loaned-devices">
          <StatsCard 
            title="מסופונים בהשאלה" 
            value={stats.loanedDevices}
            bgColor="bg-pink-500"
            textColor="text-white"
          />
        </Link>
      </div>
      
      {/* Models table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-right">דגמי מכשירים במלאי</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-right py-3 px-4 font-medium text-gray-700">זמינים</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">כמות יחידות במלאי</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">דגם</th>
              </tr>
            </thead>
            <tbody>
              {!models || models.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-8 text-gray-500">
                    אין דגמים להצגה
                  </td>
                </tr>
              ) : (
                models.map((model, index) => (
                  <tr key={model.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="py-3 px-4 text-right">{model.availableCount}</td>
                    <td className="py-3 px-4 text-right">{model.totalCount}</td>
                    <td className="py-3 px-4 text-right font-medium flex items-center justify-end gap-2">
                      <span>{model.name}</span>
                      <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center">
                        <div className="w-4 h-6 bg-gray-600 rounded-sm"></div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value: number;
  bgColor: string;
  textColor: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, bgColor, textColor }) => {
  return (
    <div className={`${bgColor} ${textColor} rounded-lg p-4 shadow-sm hover:scale-105 transition-transform cursor-pointer`}>
      <div className="text-sm font-medium mb-1 text-right">{title}</div>
      <div className="text-3xl font-bold text-right">{value}</div>
    </div>
  );
};

export default DeviceDetails;
