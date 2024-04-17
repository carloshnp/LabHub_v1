import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Knob } from 'primereact/knob';

const MonochromatorControl = () => {
    const [wavelength, setWavelength] = useState(1500);
    const [grat, setGrat] = useState(2);
    const [connection, setConnection] = useState()

    const URL = 'http://127.0.0.1:8000';

    // useEffect(() => {
    //     const fetchWavelength = async () => {
    //         const wavelength = await handleGetWavelength();
    //         setWavelength(parseFloat(wavelength));
    //     };
    //     fetchWavelength();
    // }, [connection]);

    // useEffect(() => {
    //     const fetchGrat = async () => {
    //         const grat = await handleGetGrat();
    //         setGrat(parseFloat(grat));
    //     };
    //     fetchGrat();
    // }, [connection]);

    const handleGetWavelength = async () => {
        try {
            const response = await window.electronAPI.makeApiRequest({
                url: `${URL}/wavelength`,
                method: 'GET'
            });
            console.log('API Response:', response); // Log the response
            return response.wavelength; // Assuming the response has a 'wavelength' property
        } catch (error) {
            console.error('Error in API call:', error); // Log the detailed error
        }
    }

    const handleSetWavelength = async (wavelength) => {
        try {
            const response = await window.electronAPI.makeApiRequest({
                url: `${URL}/wavelength?wavelength=${wavelength}`,
                method: 'POST'
            });
            console.log('API Response:', response); // Log the response
        } catch (error) {
            console.error('Error in API call:', error); // Log the detailed error
        }
    }

    const handleGetGrat = async () => {
        try {
            const response = await window.electronAPI.makeApiRequest({
                url: `${URL}/grat`,
                method: 'GET'
            });
            console.log('API Response:', response); // Log the response
            return response.grat; // Assuming the response has a 'grat' property
        } catch (error) {
            console.error('Error in API call:', error); // Log the detailed error
        }
    }

    const handleSetGrat = async (grat) => {
        try {
            console.log("grat: ", grat);
            const response = await window.electronAPI.makeApiRequest({
                url: `${URL}/grat?grat=${grat}`,
                method: 'POST'
            });
            console.log('API Response:', response); // Log the response
        } catch (error) {
            console.error('Error in API call:', error); // Log the detailed error
        }
    }

    const handleHealth = async () => {
        try {
            const response = await window.electronAPI.makeApiRequest({ url: `${URL}/`, method: 'GET' });
            console.log('API Response:', response); // Log the response
        } catch (error) {
            console.error('Error in API call:', error); // Log the detailed error
        }
    }

    const handleConnect = async () => {
        try {
            const response = await window.electronAPI.makeApiRequest({ url: `${URL}/connect`, method: 'GET' });
            console.log('API Response:', response); // Log the response
            setConnection(response)
        } catch (error) {
            console.error('Error in API call:', error); // Log the detailed error
        }
    }

    return (
        <div className='h-full min-w-36 bg-[#777777] p-4 rounded-md'>
            <div className='h-full w-full flex flex-col justify-around items-center'>
                <h3 className='text-lg font-semibold'>Oriel Cornerstone 260</h3>
                <div className='flex flex-col items-center'>
                    <h4 className='text-base font-medium'>Wavelength</h4>
                    <Knob value={wavelength} min={250} max={2600} onChange={(e) => {
                        handleSetWavelength(e.value)
                        handleGetWavelength()
                        setWavelength(e.value)
                    }} />
                </div>
                <div className='flex flex-col items-center'>
                    <h4 className='text-base font-medium'>Grat</h4>
                    <Knob value={grat} min={1} max={3} onChange={(e) => {
                        handleSetGrat(e.value)
                        handleGetGrat()
                        setGrat(e.value)
                    }} />
                </div>
                <div>
                    <Button className='w-20 h-10 border-solid border-2 border-slate-700 bg-slate-700 text-white font-medium rounded-md' label="Connect" onClick={() => handleConnect()} />
                </div>
                {/* <div>
                <Button label="Health" onClick={() => handleHealth()} />
            </div> */}
            </div>
        </div>
    );
};

export default MonochromatorControl;

// const handleWavelengthChange = (value: any) => {
//     ipcRenderer.invoke('api-request', {
//         url: `${URL}/wavelength`,
//         method: 'POST',
//         data: { wavelength: value }
//     }).then(response => setWavelength(response.data.wavelength))
//       .catch(error => console.error(error));
// };

// const handleGratChange = (value: any) => {
//     ipcRenderer.invoke('api-request', {
//         url: `${URL}/grat`,
//         method: 'POST',
//         data: { grat: value }
//     }).then(response => setGrat(response.data.grat))
//       .catch(error => console.error(error));
// };