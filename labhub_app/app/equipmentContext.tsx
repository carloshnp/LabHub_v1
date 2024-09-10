import { createContext, useState, useEffect, useContext, useCallback, ReactNode } from "react";
import { equipmentConfig } from './components/equipments/config/equipmentConfig';

interface EquipmentContextType {
  equipments: string[];
  methods: { [key: string]: any };
  selectedEquipments: string[];
  equipmentStates: { [key: string]: any };
  fetchEquipments: () => void;
  fetchEquipmentMethods: (equipmentName: string) => void;
  selectEquipment: (equipmentName: string) => void;
  connectEquipment: (equipmentName: string) => Promise<void>;
  disconnectEquipment: (equipmentName: string) => Promise<void>;
  executeMethod: (equipmentName: string, methodName: string, params?: any) => Promise<any>;
}

const EquipmentContext = createContext<EquipmentContextType | undefined>(undefined);

export const EquipmentProvider = ({ children }: { children: ReactNode }) => {
  const [equipments, setEquipments] = useState<string[]>([]);
  const [methods, setMethods] = useState<{ [key: string]: any }>({});
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>([]);
  const [equipmentStates, setEquipmentStates] = useState<{ [key: string]: any }>({});

  const fetchEquipments = useCallback(async () => {
    try {
      const response = await window.electronAPI.makeApiRequest('http://127.0.0.1:8000/available_equipments', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const fetchedEquipments = JSON.parse(response).equipments;
      setEquipments(fetchedEquipments);
    } catch (error) {
      console.error("Failed to fetch equipments", error);
    }
  }, []);

  const fetchEquipmentMethods = useCallback(async (equipmentName: string) => {
    try {
      const response = await window.electronAPI.makeApiRequest(`http://127.0.0.1:8000/methods/${equipmentName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const fetchedMethods = JSON.parse(response);
      setMethods((prevMethods) => ({
        ...prevMethods,
        [equipmentName]: fetchedMethods,
      }));
    } catch (error) {
      console.error(`Failed to fetch methods for ${equipmentName}`, error);
    }
  }, []);

  const selectEquipment = useCallback((equipmentName: string) => {
    if (!selectedEquipments.includes(equipmentName)) {
      setSelectedEquipments((prevSelected) => [...prevSelected, equipmentName]);
      fetchEquipmentMethods(equipmentName);
    }
  }, [selectedEquipments, fetchEquipmentMethods]);

  const connectEquipment = useCallback(async (equipmentName: string) => {
    try {
      await executeMethod(equipmentName, 'connect');
      const state = await fetchEquipmentState(equipmentName);
      setEquipmentStates((prevStates) => ({
        ...prevStates,
        [equipmentName]: state,
      }));
    } catch (error) {
      console.error(`Failed to connect ${equipmentName}`, error);
    }
  }, []);

  const disconnectEquipment = useCallback(async (equipmentName: string) => {
    try {
      await executeMethod(equipmentName, 'disconnect');
      setEquipmentStates((prevStates) => {
        const newStates = { ...prevStates };
        delete newStates[equipmentName];
        return newStates;
      });
    } catch (error) {
      console.error(`Failed to disconnect ${equipmentName}`, error);
    }
  }, []);

  const executeMethod = useCallback(async (equipmentName: string, methodName: string, params?: any) => {
    try {
      const config = equipmentConfig[equipmentName].methods[methodName];
      const response = await window.electronAPI.makeApiRequest('http://127.0.0.1:8000/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          equipment_name: equipmentName,
          http_method: config.httpMethod,
          equipment_method: config.method,
          params: params || {},
        }),
      });
      return JSON.parse(response);
    } catch (error) {
      console.error(`Failed to execute method ${methodName} for ${equipmentName}`, error);
      throw error;
    }
  }, []);

  const fetchEquipmentState = useCallback(async (equipmentName: string) => {
    const equipmentMethods = methods[equipmentName];
    const state: { [key: string]: any } = {};

    for (const [methodName, methodInfo] of Object.entries(equipmentMethods)) {
      if (methodName.startsWith('get')) {
        try {
          const result = await executeMethod(equipmentName, methodName);
          const stateKey = methodName.slice(3).toLowerCase();
          state[stateKey] = result;
        } catch (error) {
          console.error(`Failed to fetch state for ${methodName} of ${equipmentName}`, error);
        }
      }
    }

    return state;
  }, [methods, executeMethod]);

  useEffect(() => {
    fetchEquipments();
  }, [fetchEquipments]);

  const contextValue: EquipmentContextType = {
    equipments,
    methods,
    selectedEquipments,
    equipmentStates,
    fetchEquipments,
    fetchEquipmentMethods,
    selectEquipment,
    connectEquipment,
    disconnectEquipment,
    executeMethod,
  };

  return (
    <EquipmentContext.Provider value={contextValue}>
      {children}
    </EquipmentContext.Provider>
  );
};

export const useEquipment = () => {
  const context = useContext(EquipmentContext);
  if (!context) {
    throw new Error("useEquipment must be used within an EquipmentProvider");
  }
  return context;
};