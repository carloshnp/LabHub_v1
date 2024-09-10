import React, { useState, useRef, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { equipmentConfig } from './config/equipmentConfig';

interface EquipmentToolboxProps {
  equipmentName: string;
  methodName: string;
  currentValue: string | number | object;
  onClose: () => void;
  onSubmit: (value: string) => void;
}

export const EquipmentToolbox: React.FC<EquipmentToolboxProps> = ({ 
  equipmentName, 
  methodName, 
  currentValue,
  onClose, 
  onSubmit 
}) => {
  const [inputValue, setInputValue] = useState(
    typeof currentValue === 'object' ? JSON.stringify(currentValue) : currentValue.toString()
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const toolboxRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const equipment = equipmentConfig[equipmentName];
  const method = equipment?.methods[methodName];
  const isDropdown = method?.params[Object.keys(method.params)[0]]?.type === 'SELECT';
  const options = method?.params[Object.keys(method.params)[0]]?.options || [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolboxRef.current && !toolboxRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
        onClose();
      } else if (event.key === 'Enter') {
        event.preventDefault();
        buttonRef.current?.click();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleSubmit = () => {
    onSubmit(inputValue);
    onClose();
  };

  const handleDropdownClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleOptionClick = (option: string) => {
    setInputValue(option);
    setIsDropdownOpen(false);
  };

  return (
    <div ref={toolboxRef} className="w-[120px] rounded-[10px] bg-[#222] p-2 flex flex-col justify-between focus:outline-none">
      <div className="w-full">
        <label htmlFor="inputValue" className="text-white font-montserrat text-xs font-normal">
          Input value
        </label>
        {isDropdown ? (
          <div className="relative w-full">
            <div
              className="w-full h-[37px] rounded-[10px] bg-[#D9D9D9] text-black flex items-center px-2 cursor-pointer focus:outline-none"
              onClick={handleDropdownClick}
            >
              {inputValue}
            </div>
            {isDropdownOpen && (
              <div className="absolute top-full left-0 w-full max-h-[150px] overflow-y-auto bg-[#F5F5F5] rounded-[10px] mt-1 z-10 shadow-lg">
                {options.map((option) => (
                  <div
                    key={option}
                    className="px-2 py-1 text-black hover:bg-[#E0E0E0] cursor-pointer"
                    onClick={() => handleOptionClick(option)}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <InputText
            ref={inputRef}
            id="inputValue"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full h-[37px] rounded-[10px] bg-[#D9D9D9] text-black focus:outline-none"
          />
        )}
      </div>
      <Button
        ref={buttonRef}
        onClick={handleSubmit}
        label="Set"
        className="w-full h-[20px] rounded-[10px] bg-[#333] text-white font-montserrat text-xs font-normal mt-2 focus:outline-none"
      />
    </div>
  );
};