import React, { useState, useEffect } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { useEquipment } from '~/equipmentContext';

const SequencerMain = () => {
  const { methods } = useEquipment();
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [postParams, setPostParams] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    console.log("Methods State in Sequencer updated:", methods);
  }, [methods]);

  const equipmentOptions = Object.keys(methods).map((equipment) => ({
    name: equipment,
    value: equipment,
  }));

  const methodOptions = selectedEquipment ? Object.keys(methods[selectedEquipment] || {}).map((method) => ({
    name: method,
    value: method,
  })) : [];

  const handleInputChange = (paramName: string, value: string) => {
    setPostParams((prevParams) => ({
      ...prevParams,
      [paramName]: value,
    }));
  };

  // Debugging - Log selected equipment and method
  console.log("Selected Equipment:", selectedEquipment);
  console.log("Selected Method:", selectedMethod);

  return (
    <div className="h-full min-w-36 bg-[#ffffff] p-4 ml-4 rounded-md">
      <div className='h-full w-full flex flex-col text-slate-900 justify-around'>
        <h3 className='text-lg font-semibold'>Sequencer</h3>
        <div className='flex items-center'>
          <h4 className='text-base font-medium mr-2'>Select Equipment</h4>
          <Dropdown
            value={selectedEquipment}
            onChange={(e) => setSelectedEquipment(e.value)}
            options={equipmentOptions}
            optionLabel='name'
            placeholder='Select an equipment' />
        </div>
        {selectedEquipment && (
          <div className='flex items-center mt-4'>
            <h4 className='text-base font-medium mr-2'>Select Method</h4>
            <Dropdown
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.value)}
              options={methodOptions}
              optionLabel='name'
              placeholder='Select a method' />
          </div>
        )}
        {selectedEquipment && selectedMethod && methods[selectedEquipment][selectedMethod].method === 'POST' && (
          <div className='flex flex-col mt-4'>
            {methods[selectedEquipment][selectedMethod].params.map((param: string) => (
              <div key={param} className='flex items-center mb-2'>
                <h4 className='text-base font-medium mr-2'>{param}</h4>
                <InputText
                  value={postParams[param] || ''}
                  onChange={(e) => handleInputChange(param, e.target.value)}
                  placeholder={`Enter ${param}`} />
              </div>
            ))}
          </div>
        )}
        {selectedEquipment && selectedMethod && (
          <div className='flex items-center mt-4'>
            <button onClick={() => console.log('Execute method', selectedMethod, 'with params', postParams)}>Execute</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SequencerMain;
