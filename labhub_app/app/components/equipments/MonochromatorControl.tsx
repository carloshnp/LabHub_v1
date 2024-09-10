import React, { useEffect, useState } from 'react';
import { EquipmentTitle } from './EquipmentTitle';
import { EquipmentDisplay } from './EquipmentDisplay';
import { EquipmentContainer } from './EquipmentContainer';
import { ConnectionToggle } from './ConnectionToggle';
import { useEquipment } from '../../equipmentContext';
import { equipmentConfig } from './config/equipmentConfig';
import { Toast } from './Toast';
import { EquipmentToolbox } from './EquipmentToolbox';
import { Button } from 'primereact/button';

export const MonochromatorControl = () => {
  const { equipmentStates, executeMethod } = useEquipment();
  const equipmentName = 'monochromator';
  const config = equipmentConfig[equipmentName];

  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' | 'info' } | null>(null);
  const [wavelength, setWavelength] = useState<string>('');
  const [grat, setGrat] = useState<string>('');
  const [isToolboxOpen, setIsToolboxOpen] = useState(false);
  const [isVaryingWavelength, setIsVaryingWavelength] = useState(false);

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
      executeMethod(equipmentName, 'connect');
    };
  }, []);

  const handleSetWavelength = async (value: string) => {
    const setResponse = await executeMethod(equipmentName, 'setWavelength', { wavelength: Number(value) });
    console.log(setResponse);
    setToast({ message: setResponse.detail || 'Wavelength set', type: 'info' });
    
    const getResponse = await executeMethod(equipmentName, 'getWavelength', {});
    console.log(getResponse);
    if (getResponse.get_wavelength !== undefined) {
      setWavelength(getResponse.get_wavelength);
    }
    setToast({ message: getResponse.detail || 'Wavelength updated', type: 'info' });
  };

  const handleSetGrat = async (value: string) => {
    const setResponse = await executeMethod(equipmentName, 'setGrat', { grat: Number(value) });
    console.log(setResponse);
    setToast({ message: setResponse.detail || 'Grat set', type: 'info' });
    
    const getResponse = await executeMethod(equipmentName, 'getGrat', {});
    console.log(getResponse);
    if (getResponse.get_grat !== undefined) {
      setGrat(getResponse.get_grat);
    }
    setToast({ message: getResponse.detail || 'Grat updated', type: 'info' });
  };

  const handleConnectionToggle = async (isConnected: boolean) => {
    const method = isConnected ? 'connect' : 'disconnect';
    const response = await executeMethod(equipmentName, method);
    setToast({ message: response.detail || `${method} operation completed`, type: 'info' });

    if (isConnected) {
      // Fetch wavelength and grat after successful connection
      try {
        const wavelengthResponse = await executeMethod(equipmentName, 'getWavelength', {});
        if (wavelengthResponse.get_wavelength !== undefined) {
          setWavelength(wavelengthResponse.get_wavelength);
        }

        const gratResponse = await executeMethod(equipmentName, 'getGrat', {});
        if (gratResponse.get_grat !== undefined) {
          setGrat(gratResponse.get_grat);
        }
      } catch (error) {
        console.error("Failed to fetch initial values:", error);
        setToast({ message: "Failed to fetch initial values", type: 'error' });
      }
    } else {
      // Reset values when disconnected
      setWavelength('');
      setGrat('');
    }
  };

  const handleVaryWavelength = async (value: string) => {
    const [start, end] = value.split(',').map(Number);
    if (isNaN(start) || isNaN(end)) {
      setToast({ message: "Invalid input. Please enter two numbers separated by a comma.", type: 'error' });
      return;
    }

    setIsVaryingWavelength(true);
    for (let i = start; i <= end; i++) {
      await handleSetWavelength(i.toString());
      // Add a small delay to avoid overwhelming the equipment
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    setIsVaryingWavelength(false);
    setToast({ message: "Wavelength variation completed", type: 'success' });
  };

  return (
    <EquipmentContainer>
      <ConnectionToggle onToggle={handleConnectionToggle} />
      <EquipmentTitle title={config.name} />
      <div className="flex items-center">
        <EquipmentDisplay
          equipmentName={equipmentName}
          controlName="setWavelength"
          label="Wavelength"
          value={wavelength || equipmentStates[equipmentName]?.wavelength?.toString() || ''}
          onUpdate={handleSetWavelength}
        />
        <Button
          onClick={() => setIsToolboxOpen(true)}
          label="Vary"
          className="ml-2 p-2 bg-blue-500 text-white rounded"
          disabled={isVaryingWavelength}
        />
      </div>
      <EquipmentDisplay
        equipmentName={equipmentName}
        controlName="setGrat"
        label="Grat"
        value={grat || equipmentStates[equipmentName]?.grat?.toString() || ''}
        onUpdate={handleSetGrat}
      />
      {isToolboxOpen && (
        <EquipmentToolbox
          equipmentName={equipmentName}
          methodName="varyWavelength"
          currentValue=""
          onClose={() => setIsToolboxOpen(false)}
          onSubmit={handleVaryWavelength}
        />
      )}
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
