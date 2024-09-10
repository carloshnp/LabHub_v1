import React, { useState } from 'react';
import { EquipmentToolbox } from './EquipmentToolbox';
import { equipmentConfig } from './config/equipmentConfig';

interface EquipmentDisplayProps {
  equipmentName: string;
  controlName: string;  // This will directly match the method name in equipmentConfig
  label: string;  // This is for display purposes only
  value: string | number | object;
  onUpdate: (value: string) => void;
  readOnly?: boolean;
}

export const EquipmentDisplay: React.FC<EquipmentDisplayProps> = ({ 
  equipmentName, 
  controlName, 
  label, 
  value, 
  onUpdate,
  readOnly = false
}) => {
  const [showToolbox, setShowToolbox] = useState(false);

  const canSetValue = () => {
    const equipment = equipmentConfig[equipmentName];
    return equipment && equipment.methods[controlName] !== undefined && !readOnly;
  };

  const handleClick = () => {
    if (readOnly) {
      onUpdate('');
    } else if (canSetValue()) {
      setShowToolbox(true);
    }
  };

  const displayValue = () => {
    if (typeof value === 'object') {
      console.log(value)
      return JSON.stringify(value);
    }
    return value;
  };

  return (
    <div className="relative w-full mb-4 focus:outline-none">
      <div
        className={`w-full h-[70px] rounded-[10px] bg-[#444444] flex flex-col justify-center items-center cursor-pointer focus:outline-none ${readOnly ? 'cursor-default' : ''}`}
        onClick={handleClick}
      >
        <div className="text-[#F5F5F5] text-center font-montserrat text-sm font-normal">
          {label}
        </div>
        <div className="text-[#F5F5F5] text-center font-montserrat text-2xl font-normal mt-1">
          {displayValue()}
        </div>
      </div>
      {showToolbox && canSetValue() && (
        <div className="absolute top-full left-0 mt-2 z-10">
          <EquipmentToolbox
            equipmentName={equipmentName}
            methodName={controlName}
            currentValue={value}
            onClose={() => setShowToolbox(false)}
            onSubmit={onUpdate}
          />
        </div>
      )}
    </div>
  );
};
