import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Device, DeviceModel, InventoryStats, RemovalReason, CustomerInfo } from "@/types/inventory";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useInventory() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState<InventoryStats>({
    totalDevices: 0,
    availableDevices: 0,
    rentedDevices: 0,
    loanedDevices: 0,
    soldDevices: 0,
    developmentDevices: 0,
  });

  // Fetch devices from Supabase on component mount
  useEffect(() => {
    fetchDevices();
  }, []);

  // Calculate stats whenever devices change
  useEffect(() => {
    calculateStats();
  }, [devices]);

  // Fetch all devices from Supabase
  const fetchDevices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('devices')
        .select(`
          id,
          serial_number,
          entry_date,
          exit_date,
          removal_reason,
          device_models(name),
          customers(name, terminal_id, email, phone, account_code)
        `);
      
      if (error) {
        throw error;
      }
      
      if (data) {
        const formattedDevices: Device[] = data.map(item => ({
          id: item.id,
          modelName: item.device_models?.name || '',
          serialNumber: item.serial_number,
          entryDate: new Date(item.entry_date),
          exitDate: item.exit_date ? new Date(item.exit_date) : null,
          removalReason: item.removal_reason as RemovalReason,
          customerInfo: item.customers ? {
            name: item.customers.name,
            terminalId: item.customers.terminal_id,
            email: item.customers.email,
            phone: item.customers.phone,
            accountCode: item.customers.account_code
          } : null
        }));
        
        setDevices(formattedDevices);
      }
    } catch (error) {
      console.error("Error fetching devices:", error);
      toast.error("שגיאה בטעינת המכשירים");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const newStats: InventoryStats = {
      totalDevices: devices.length,
      availableDevices: devices.filter(d => d.exitDate === null).length,
      rentedDevices: devices.filter(d => d.removalReason === "rental").length,
      loanedDevices: devices.filter(d => d.removalReason === "loan").length,
      soldDevices: devices.filter(d => d.removalReason === "sale").length,
      developmentDevices: devices.filter(d => d.removalReason === "development").length,
    };
    setStats(newStats);
  };

  const getDeviceModels = async (): Promise<DeviceModel[]> => {
    try {
      console.log("Fetching device models...");
      
      // Get all device models
      const { data: modelsData, error: modelsError } = await supabase
        .from('device_models')
        .select('id, name');
      
      if (modelsError) {
        console.error("Error fetching models:", modelsError);
        throw modelsError;
      }
      
      if (!modelsData || modelsData.length === 0) {
        console.log("No models found");
        return [];
      }
      
      console.log("Found models:", modelsData);
      
      // Calculate counts for each model using the devices already in state
      const models: DeviceModel[] = modelsData.map(model => {
        const modelDevices = devices.filter(device => device.modelName === model.name);
        const availableCount = modelDevices.filter(device => device.exitDate === null).length;
        
        return {
          id: model.id,
          name: model.name,
          totalCount: modelDevices.length,
          availableCount: availableCount,
        };
      });
      
      console.log("Calculated model counts:", models);
      return models;
    } catch (error) {
      console.error("Error in getDeviceModels:", error);
      toast.error("שגיאה בטעינת דגמי המכשירים");
      return [];
    }
  };

  const addDevice = async (
    modelName: string,
    serialNumber: string,
    entryDate: Date
  ): Promise<boolean> => {
    try {
      // First, get or create the model
      const { data: existingModels, error: modelError } = await supabase
        .from('device_models')
        .select('id')
        .eq('name', modelName)
        .limit(1);
      
      if (modelError) throw modelError;
      
      let modelId;
      
      if (existingModels && existingModels.length > 0) {
        modelId = existingModels[0].id;
      } else {
        // Create new model if it doesn't exist
        const { data: newModel, error: createModelError } = await supabase
          .from('device_models')
          .insert([{ name: modelName }])
          .select('id')
          .single();
        
        if (createModelError) throw createModelError;
        modelId = newModel.id;
      }
      
      // Now add the device
      const { data, error } = await supabase
        .from('devices')
        .insert([{
          model_id: modelId,
          serial_number: serialNumber,
          entry_date: entryDate.toISOString(),
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Add the new device to the state
      const newDevice: Device = {
        id: data.id,
        modelName,
        serialNumber,
        entryDate,
        exitDate: null,
        removalReason: null,
        customerInfo: null
      };
      
      setDevices(prevDevices => [...prevDevices, newDevice]);
      return true;
    } catch (error: any) {
      console.error("Error adding device:", error);
      if (error.code === '23505') {
        toast.error("המספר הסידורי כבר קיים במערכת");
      } else {
        toast.error("שגיאה בהוספת מכשיר");
      }
      return false;
    }
  };

  const removeDevice = async (
    deviceId: string,
    exitDate: Date,
    reason: RemovalReason,
    customerInfo: CustomerInfo
  ): Promise<boolean> => {
    try {
      // First, get or create the customer
      let customerId;
      
      const { data: existingCustomers, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('name', customerInfo.name)
        .eq('terminal_id', customerInfo.terminalId)
        .eq('email', customerInfo.email)
        .eq('phone', customerInfo.phone)
        .eq('account_code', customerInfo.accountCode)
        .limit(1);
      
      if (customerError) throw customerError;
      
      if (existingCustomers && existingCustomers.length > 0) {
        customerId = existingCustomers[0].id;
      } else {
        // Create new customer if they don't exist
        const { data: newCustomer, error: createCustomerError } = await supabase
          .from('customers')
          .insert([{
            name: customerInfo.name,
            terminal_id: customerInfo.terminalId,
            email: customerInfo.email,
            phone: customerInfo.phone,
            account_code: customerInfo.accountCode
          }])
          .select('id')
          .single();
        
        if (createCustomerError) throw createCustomerError;
        customerId = newCustomer.id;
      }
      
      // Now update the device
      const { error } = await supabase
        .from('devices')
        .update({
          exit_date: exitDate.toISOString(),
          removal_reason: reason,
          customer_id: customerId
        })
        .eq('id', deviceId);
      
      if (error) throw error;
      
      // Update state
      setDevices(prev =>
        prev.map(device =>
          device.id === deviceId
            ? { ...device, exitDate, removalReason: reason, customerInfo }
            : device
        )
      );
      
      return true;
    } catch (error) {
      console.error("Error removing device:", error);
      toast.error("שגיאה בעדכון מכשיר");
      return false;
    }
  };

  const returnDevice = async (deviceId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('devices')
        .update({
          exit_date: null,
          removal_reason: null,
          customer_id: null
        })
        .eq('id', deviceId);
      
      if (error) throw error;
      
      setDevices(prev =>
        prev.map(device =>
          device.id === deviceId
            ? { ...device, exitDate: null, removalReason: null, customerInfo: null }
            : device
        )
      );
      
      return true;
    } catch (error) {
      console.error("Error returning device:", error);
      toast.error("שגיאה בהחזרת מכשיר למלאי");
      return false;
    }
  };

  const getDevicesByRemovalReason = (reason: RemovalReason): Device[] => {
    return devices.filter(device => device.removalReason === reason);
  };

  return {
    devices,
    stats,
    loading,
    getDeviceModels,
    addDevice,
    removeDevice,
    returnDevice,
    getDevicesByRemovalReason,
    refreshDevices: fetchDevices
  };
}
