import React, { useEffect, useState } from 'react';
import { EquipmentTitle } from './EquipmentTitle';
import { EquipmentDisplay } from './EquipmentDisplay';
import { EquipmentContainer } from './EquipmentContainer';
import { ConnectionToggle } from './ConnectionToggle';
import { useEquipment } from '../../equipmentContext';
import { equipmentConfig } from './config/equipmentConfig';
import { Toast } from './Toast';

export const LockInControl = () => {
  const { equipmentStates, executeMethod } = useEquipment();
  const equipmentName = 'lock_in';
  const config = equipmentConfig[equipmentName];
  const [sensitivity, setSensitivity] = useState<string>('');
  const [timeConstant, setTimeConstant] = useState<string>('');
  const [rValue, setRValue] = useState<string>('');
  const [overloadValue, setOverloadValue] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' | 'info' } | null>(null);

  useEffect(() => {
    const connect = async () => {
      try {
        await executeMethod(equipmentName, 'connect');
      } catch (error) {
        console.error("Failed to connect:", error);
      }
    };
    connect();
    return () => {
      executeMethod(equipmentName, 'disconnect');
    };
  }, []);

  const handleSetSensitivity = async (value: string) => {
    const setResponse = await executeMethod(equipmentName, 'setSensitivity', { sensitivity: value });
    setToast({ message: setResponse.detail || 'Sensitivity set', type: 'info' });
    
    const getResponse = await executeMethod(equipmentName, 'getSensitivity', {});
    if (getResponse.get_sensitivity !== undefined) {
      setSensitivity(getResponse.get_sensitivity);
    }
  };

  const handleSetTimeConstant = async (value: string) => {
    const setResponse = await executeMethod(equipmentName, 'setTimeConstant', { time_constant: value });
    setToast({ message: setResponse.detail || 'Time constant set', type: 'info' });
    
    const getResponse = await executeMethod(equipmentName, 'getTimeConstant', {});
    if (getResponse.get_time_constant !== undefined) {
      setTimeConstant(getResponse.get_time_constant);
    }
  };

  const handleConnectionToggle = async (isConnected: boolean) => {
    const method = isConnected ? 'connect' : 'disconnect';
    const response = await executeMethod(equipmentName, method);
    setToast({ message: response.detail || `${method} operation completed`, type: 'info' });

    if (isConnected) {
      try {
        const sensitivityResponse = await executeMethod(equipmentName, 'getSensitivity', {});
        if (sensitivityResponse.get_sensitivity !== undefined) {
          setSensitivity(sensitivityResponse.get_sensitivity);
        }

        const timeConstantResponse = await executeMethod(equipmentName, 'getTimeConstant', {});
        if (timeConstantResponse.get_time_constant !== undefined) {
          setTimeConstant(timeConstantResponse.get_time_constant);
        }

        await handleGetR();
        await handleGetOverload();
      } catch (error) {
        console.error("Failed to fetch initial values:", error);
        setToast({ message: "Failed to fetch initial values", type: 'error' });
      }
    } else {
      setSensitivity('');
      setTimeConstant('');
      setRValue('');
      setOverloadValue('');
    }
  };

  const handleGetR = async () => {
    const response = await executeMethod(equipmentName, 'getR');
    setRValue(response.get_r_value || '');
    setToast({ message: response.detail || 'R value retrieved', type: 'info' });
  };

  const handleGetOverload = async () => {
    const response = await executeMethod(equipmentName, 'getOverload');
    setOverloadValue(response.get_overload || '');
    setToast({ message: response.detail || 'Overload value retrieved', type: 'info' });
  };

  return (
    <EquipmentContainer>
      <ConnectionToggle onToggle={handleConnectionToggle} />
      <EquipmentTitle title={config.name} />
      <EquipmentDisplay
        equipmentName={equipmentName}
        controlName="setSensitivity"
        label="Sensitivity"
        value={sensitivity || equipmentStates[equipmentName]?.sensitivity || ''}
        onUpdate={handleSetSensitivity}
      />
      <EquipmentDisplay
        equipmentName={equipmentName}
        controlName="setTimeConstant"
        label="Time Constant"
        value={timeConstant || equipmentStates[equipmentName]?.timeConstant || ''}
        onUpdate={handleSetTimeConstant}
      />
      <EquipmentDisplay
        equipmentName={equipmentName}
        controlName="getR"
        label="R Value"
        value={rValue}
        onUpdate={handleGetR}
        readOnly
      />
      <EquipmentDisplay
        equipmentName={equipmentName}
        controlName="getOverload"
        label="Overload"
        value={overloadValue}
        onUpdate={handleGetOverload}
        readOnly
      />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </EquipmentContainer>
  );
};
