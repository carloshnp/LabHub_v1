import React, { useState } from 'react';
import { EquipmentTitle } from './EquipmentTitle';
import { EquipmentDisplay } from './EquipmentDisplay';
import { EquipmentContainer } from './EquipmentContainer';
import { useEquipment } from '../../equipmentContext';
import { equipmentConfig } from './config/equipmentConfig';
import { Toast } from './Toast';

export const PLMeasurementControl = () => {
  const { executeMethod } = useEquipment();
  const equipmentName = 'pl_measurement';
  const config = equipmentConfig[equipmentName];

  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' | 'info' } | null>(null);
  const [measurementStatus, setMeasurementStatus] = useState<string>('Idle');
  const [measurementParams, setMeasurementParams] = useState({
    start_wavelength: '',
    end_wavelength: '',
    step: '',
    num_averages: '',
    time_constant: '',
    tolerance: '',
    starting_sensitivity: ''
  });

  const handleParamChange = (param: string, value: string) => {
    setMeasurementParams(prev => ({ ...prev, [param]: value }));
  };

  const handleStartMeasurement = async () => {
    try {
      const params = {
        start_wavelength: parseFloat(measurementParams.start_wavelength),
        end_wavelength: parseFloat(measurementParams.end_wavelength),
        step: parseFloat(measurementParams.step),
        num_averages: parseInt(measurementParams.num_averages),
        time_constant: parseFloat(measurementParams.time_constant),
        tolerance: parseFloat(measurementParams.tolerance),
        starting_sensitivity: measurementParams.starting_sensitivity
      };
      const response = await executeMethod(equipmentName, 'start_measurement', params);
      setToast({ message: response.detail || 'Measurement started', type: 'info' });
      setMeasurementStatus('Running');
    } catch (error) {
      setToast({ message: 'Failed to start measurement', type: 'error' });
    }
  };

  const handlePauseMeasurement = async () => {
    try {
      const response = await executeMethod(equipmentName, 'pause_measurement');
      setToast({ message: response.detail || 'Measurement paused', type: 'info' });
      setMeasurementStatus('Paused');
    } catch (error) {
      setToast({ message: 'Failed to pause measurement', type: 'error' });
    }
  };

  const handleResumeMeasurement = async () => {
    try {
      const response = await executeMethod(equipmentName, 'resume_measurement');
      setToast({ message: response.detail || 'Measurement resumed', type: 'info' });
      setMeasurementStatus('Running');
    } catch (error) {
      setToast({ message: 'Failed to resume measurement', type: 'error' });
    }
  };

  const handleStopMeasurement = async () => {
    try {
      const response = await executeMethod(equipmentName, 'stop_measurement');
      setToast({ message: response.detail || 'Measurement stopped', type: 'info' });
      setMeasurementStatus('Idle');
    } catch (error) {
      setToast({ message: 'Failed to stop measurement', type: 'error' });
    }
  };

  return (
    <EquipmentContainer>
      <EquipmentTitle title={config.name} />
      <EquipmentDisplay
        equipmentName={equipmentName}
        controlName="startMeasurement"
        label="Start Wavelength"
        value={measurementParams.start_wavelength}
        onUpdate={(value) => handleParamChange('start_wavelength', value)}
      />
      <EquipmentDisplay
        equipmentName={equipmentName}
        controlName="startMeasurement"
        label="End Wavelength"
        value={measurementParams.end_wavelength}
        onUpdate={(value) => handleParamChange('end_wavelength', value)}
      />
      <EquipmentDisplay
        equipmentName={equipmentName}
        controlName="startMeasurement"
        label="Step"
        value={measurementParams.step}
        onUpdate={(value) => handleParamChange('step', value)}
      />
      <EquipmentDisplay
        equipmentName={equipmentName}
        controlName="startMeasurement"
        label="Number of Averages"
        value={measurementParams.num_averages}
        onUpdate={(value) => handleParamChange('num_averages', value)}
      />
      <EquipmentDisplay
        equipmentName={equipmentName}
        controlName="startMeasurement"
        label="Time Constant"
        value={measurementParams.time_constant}
        onUpdate={(value) => handleParamChange('time_constant', value)}
      />
      <EquipmentDisplay
        equipmentName={equipmentName}
        controlName="startMeasurement"
        label="Tolerance"
        value={measurementParams.tolerance}
        onUpdate={(value) => handleParamChange('tolerance', value)}
      />
      <EquipmentDisplay
        equipmentName={equipmentName}
        controlName="startMeasurement"
        label="Starting Sensitivity"
        value={measurementParams.starting_sensitivity}
        onUpdate={(value) => handleParamChange('starting_sensitivity', value)}
      />
      <div>
        <button onClick={handleStartMeasurement}>Start Measurement</button>
        <button onClick={handlePauseMeasurement}>Pause Measurement</button>
        <button onClick={handleResumeMeasurement}>Resume Measurement</button>
        <button onClick={handleStopMeasurement}>Stop Measurement</button>
      </div>
      <div>Measurement Status: {measurementStatus}</div>
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
