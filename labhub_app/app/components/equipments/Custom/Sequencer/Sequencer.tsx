import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown'

const SequencerMain = () => {

    const [selectedEquipment, setSelectedEquipment] = useState({
        ddl1: '',
        ddl2: ''
    })
    const equipmentsList = [
        { name: 'Monochromator', value: 'Monochromator' },
        { name: 'Lock-in', value: 'Lock-in' },
        { name: 'Laser Opolette', value: 'Laser Opolette' }
    ]

    return (
        <div className="h-full min-w-36 bg-[#ffffff] p-4 ml-4 rounded-md">
            <div className='h-full w-full flex flex-col text-slate-900 justify-around'>
                <h3 className='text-lg font-semibold'>Sequencer</h3>
                <div className='flex items-center'>
                    <h4 className='text-base font-medium mr-2'>Equipment 1</h4>
                    <Dropdown
                        value={selectedEquipment.ddl1}
                        onChange={(e) => setSelectedEquipment(prevState => ({ ...prevState, ddl1: e.value }))}
                        options={equipmentsList}
                        optionLabel='name'
                        placeholder='Select an equipment' />
                </div>
                <div className='flex items-center'>
                    <h4 className='text-base font-medium mr-2'>Equipment 2</h4>
                    <Dropdown
                        value={selectedEquipment.ddl2}
                        onChange={(e) => setSelectedEquipment(prevState => ({ ...prevState, ddl2: e.value }))}
                        options={equipmentsList}
                        optionLabel='name'
                        placeholder='Select an equipment' />
                </div>
            </div>
        </div>
    );
};

export default SequencerMain;