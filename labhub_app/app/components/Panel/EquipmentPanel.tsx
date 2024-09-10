import { useState, useEffect } from "react";
import { useEquipment } from "~/equipmentContext";
import EquipmentCabinet from "~/components/equipments/EquipmentCabinet";

export default function EquipmentPanel() {
  const { equipments, selectedEquipments, fetchEquipments, selectEquipment } = useEquipment();
  const [showBox, setShowBox] = useState(false);

  const handleClick = () => {
    setShowBox((prev) => !prev);
  };

  useEffect(() => {
    if (showBox) {
      fetchEquipments();
    }
  }, [showBox, fetchEquipments]);

  const handleEquipmentClick = (equipment: string) => {
    selectEquipment(equipment);
    setShowBox(false);
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
              {equipments.length > 0 ? (
                equipments.map((equipment) => (
                  <div
                    key={equipment}
                    className="cursor-pointer"
                    onClick={() => handleEquipmentClick(equipment)}
                  >
                    {equipment}
                  </div>
                ))
              ) : (
                <div>Loading...</div>
              )}
            </div>
          )}
        </div>
      </div>
      <EquipmentCabinet selectedEquipments={selectedEquipments} />
    </div>
  );
}
