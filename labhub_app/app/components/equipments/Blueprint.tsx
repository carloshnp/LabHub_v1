import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Knob } from 'primereact/knob';

const EquipmentBlueprint = () => {

    const [param1, setParam1] = useState(50);
    const [param2, setParam2] = useState(50);
    const URL = 'http://127.0.0.1:8000';

    const handleConnect = () => {
        fetch(`${URL}/connect`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.log(error));
    };

    const handleParam1 = (value: number) => {
        setParam1(value);
    }

    const handleParam2 = (value: number) => {
        setParam2(value);
    }

    return (
        <div className="h-full min-w-36 bg-[#ffffff] p-4 ml-4 rounded-md">
            <div className='h-full w-full flex flex-col text-slate-900 justify-around items-center'>
                <h3 className='text-lg font-semibold'>Equipment Blueprint</h3>
                <div className='flex flex-col items-center'>
                    <h4 className='text-base font-medium'>Parameter 1</h4>
                    <Knob
                        value={param1}
                        min={0}
                        max={100}
                        onChange={(e) => {
                            handleParam1(e.value)
                        }} />
                </div>
                <div className='flex flex-col items-center'>
                    <h4 className='text-base font-medium'>Parameter 2</h4>
                    <Knob
                        value={param2}
                        min={0}
                        max={100}
                        onChange={(e) => {
                            handleParam2(e.value)
                        }} />
                </div>
                <div>
                    <Button
                        className='w-20 h-10 border-solid border-2 border-slate-800 bg-slate-800 text-white font-medium rounded-md'
                        label="Connect"
                        onClick={() => handleConnect()} />
                </div>
            </div>
        </div>
    );
};

export default EquipmentBlueprint;