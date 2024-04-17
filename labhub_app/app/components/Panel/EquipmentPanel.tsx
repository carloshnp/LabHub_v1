import { useState } from 'react';
import EquipmentPanelContainer from './EquipmentPanelContainer';

export default function EquipmentPanel() {
    const [showBox, setShowBox] = useState(false);

    const handleClick = () => {
        setShowBox(!showBox);
    };

    return (
        <div className="w-1/2 h-full flex flex-col flex-grow mr-10">
            <div className="w-full flex justify-between">
                <h1 className="text-white text-2xl mb-2.5 pt-4 font-bold">Equipamentos</h1>
                <div className="relative">
                    <div
                        className="w-[60px] h-[60px] rounded-t-lg bg-[#777777] flex justify-center items-center text-3xl"
                        onClick={handleClick}
                    >
                        +
                    </div>
                    {showBox && (
                        <div className="absolute right-0 w-80 h-80 rounded-b-lg bg-[#777777] p-5 grid grid-cols-2 grid-rows-2 gap-2">
                            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Similique dignissimos perspiciatis omnis quaerat numquam quo ipsum quae, laborum ad deserunt, magnam iusto, blanditiis expedita necessitatibus nemo adipisci fugit impedit sed.
                        </div>
                    )}
                </div>
            </div>
            <EquipmentPanelContainer />
        </div>
    );
};
