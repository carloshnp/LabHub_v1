import React from 'react';
import { MonochromatorControl } from './MonochromatorControl';
import { LockInControl } from './LockInControl';
import { PLMeasurementControl } from './PLMeasurementControl';

export const PlPle = () => {
  return (
    <div className="flex w-full h-full p-4 overflow-auto bg-zinc-800">
      <MonochromatorControl />
      <LockInControl />
      <PLMeasurementControl />
    </div>
  );
};