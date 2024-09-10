import { Button } from 'primereact/button';

export const EquipmentButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <div className='w-full h-10 flex items-center justify-between'>
    <div className="text-l font-bold">{label}</div>
    <Button className="bg-slate-100 w-32 rounded-md h-8" label={`Set ${label}`} onClick={onClick} />
  </div>
);
