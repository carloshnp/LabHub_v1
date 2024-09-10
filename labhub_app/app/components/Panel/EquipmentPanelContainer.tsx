import EquipmentCabinet from "../equipments/EquipmentCabinet";

interface EquipmentPanelContainerProps {
  selectedEquipment: string | null;
}

export default function EquipmentPanelContainer({ selectedEquipment }: EquipmentPanelContainerProps) {
  return (
    <div className="flex-grow">
      <EquipmentCabinet selectedEquipment={selectedEquipment} />
    </div>
  );
}
