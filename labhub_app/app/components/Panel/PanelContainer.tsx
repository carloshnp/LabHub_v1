import EquipmentPanel from "./EquipmentPanel"
import Panel from "./Panel"

export default function PanelContainer() {
    return (
        <div className="w-full h-full flex p-8">
            <EquipmentPanel />
            <Panel />
        </div>
    )
};