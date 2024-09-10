import React, { ReactNode } from 'react';

interface EquipmentContainerProps {
  children: ReactNode;
}

export const EquipmentContainer: React.FC<EquipmentContainerProps> = ({ children }) => {
  return (
    <div className="w-64 m-4 p-4 rounded-xl flex flex-col items-center bg-[#333333] focus:outline-none">
      {children}
    </div>
  );
};
