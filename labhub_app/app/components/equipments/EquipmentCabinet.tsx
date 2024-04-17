import EquipmentBlueprint from "./Blueprint";
import LaserControl from "./Original/Opotek Opolette 532/LaserMain";
import MonochromatorControl from "./Original/Oriel Cornerstone 260/MonochromatorMain";

export default function EquipmentCabinet() {
    return (
        <div className="flex overflow-auto">
            <MonochromatorControl />
            <LaserControl />
            <EquipmentBlueprint />
        </div>
    )
};
