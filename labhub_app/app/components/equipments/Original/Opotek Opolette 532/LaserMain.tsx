import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Knob } from 'primereact/knob';

const LaserControl = () => {
    const [wavelength, setWavelength] = useState(1500);
    const [power, setPower] = useState(15);
    const [connection, setConnection] = useState()

    const URL = 'http://127.0.0.1:8000';

    return (
        <div className='h-full min-w-36 bg-[#812637] ml-4 p-4 rounded-md'>
            <div className='h-full w-full flex flex-col justify-around items-center'>
                <h3 className='text-lg font-semibold'>Opotek Opolette 532</h3>
                <div className='flex flex-col items-center'>
                    <h4 className='text-base font-medium'>Wavelength</h4>
                    <Knob value={wavelength} min={250} max={2600} onChange={(e) => { setWavelength(e.value) }} />
                </div>
                <div className='flex flex-col items-center'>
                    <h4 className='text-base font-medium'>Power (%)</h4>
                    <Knob value={power} min={0} max={100} onChange={(e) => { setPower(e.value) }} />
                </div>
                <div>
                    <Button className='w-20 h-10 border-solid border-2 border-slate-800 bg-slate-800 text-white font-medium rounded-md' label="Connect" onClick={() => handleConnect()} />
                </div>
            </div>
        </div>
    );
};

export default LaserControl;