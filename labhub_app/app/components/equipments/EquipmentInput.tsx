import React from 'react';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputType } from './types/equipments';

interface EquipmentInputProps {
  label: string;
  value: string | number;
  type: InputType;
  options?: string[];
  onChange: (value: string | number) => void;
}

export const EquipmentInput: React.FC<EquipmentInputProps> = React.memo(({ label, value, type, options, onChange }) => {
  console.log(`Rendering EquipmentInput for ${label}:`, value);

  const handleChange = (newValue: string | number) => {
    console.log(`EquipmentInput onChange for ${label}:`, newValue);
    onChange(newValue);
  };

  switch (type) {
    case InputType.NUMBER:
      return (
        <div className='w-full h-10 flex items-center justify-between mb-2'>
          <div className="text-l font-bold">{label}</div>
          <InputText
            className="w-32 rounded-md h-8"
            keyfilter="num"
            value={value.toString()}
            onChange={(e) => handleChange(e.target.value === '' ? '' : parseFloat(e.target.value))}
          />
        </div>
      );
    case InputType.SELECT:
      return (
        <div className='w-full h-10 flex items-center justify-between mb-2'>
          <div className="text-l font-bold">{label}</div>
          <Dropdown
            className="w-32 rounded-md h-8"
            value={value}
            options={options}
            onChange={(e) => handleChange(e.value)}
          />
        </div>
      );
    default:
      return (
        <div className='w-full h-10 flex items-center justify-between mb-2'>
          <div className="text-l font-bold">{label}</div>
          <InputText
            className="w-32 rounded-md h-8"
            value={value.toString()}
            onChange={(e) => handleChange(e.target.value)}
          />
        </div>
      );
  }
});