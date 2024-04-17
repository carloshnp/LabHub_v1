import RepeaterMain from "../equipments/Custom/Repeater/Repeater";
import SequencerMain from "../equipments/Custom/Sequencer/Sequencer";

export default function SelectionBar() {
    return (
        <div className="w-full h-48 p-4 flex bg-[#262626] text-white">
            <SequencerMain />
            <RepeaterMain />
        </div>
    )
};
