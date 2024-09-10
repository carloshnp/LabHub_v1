import EquipmentPanel from "~/components/Panel/EquipmentPanel";
import { PlPle } from "../equipments/PlPle";

export default function PanelContainer() {
  return (
    <div className="h-full flex-grow">
      <PlPle />
    </div>
  );
}
