import React, { useState } from 'react';

interface ConnectionToggleProps {
  onToggle: (isConnected: boolean) => void;
}

export const ConnectionToggle: React.FC<ConnectionToggleProps> = ({ onToggle }) => {
  const [isConnected, setIsConnected] = useState(false);

  const handleToggle = () => {
    const newConnectionState = !isConnected;
    setIsConnected(newConnectionState);
    onToggle(newConnectionState);
  };

  return (
    <div className="flex items-center justify-between w-full mb-4">
      <span className="text-white font-montserrat text-sm font-normal">
        Connection
      </span>
      <button
        onClick={handleToggle}
        className="w-[39px] h-[10px] rounded-[10px] bg-[#D9D9D9] relative p-[2px]"
      >
        <div
          className={`w-[15px] h-[6px] rounded-[10px] absolute top-1/2 transform -translate-y-1/2 transition-all duration-300 ease-in-out ${
            isConnected
              ? 'bg-green-500 translate-x-[20px]'
              : 'bg-[#E51E1E] translate-x-0'
          }`}
        ></div>
      </button>
    </div>
  );
};
