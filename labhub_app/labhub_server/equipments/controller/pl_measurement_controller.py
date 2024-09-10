from equipments.controller.equipment import Equipment
from equipments.controller.monochromator_controller import Monochromator
from equipments.controller.lock_in_controller import LockInSR860
import asyncio
import json

class PLMeasurement(Equipment):
    def __init__(self, monochromator: Monochromator, lock_in: LockInSR860):
        super().__init__()
        self.monochromator = monochromator
        self.lock_in = lock_in
        self.measurement_task = None
        self.paused = False
        self.stop_requested = False

        self.register_post_method("start_measurement", self.start_measurement, "Start PL measurement", [
            "start_wavelength", "end_wavelength", "step", "num_averages",
            "time_constant", "tolerance", "starting_sensitivity"
        ])
        self.register_post_method("pause_measurement", self.pause_measurement, "Pause PL measurement", [])
        self.register_post_method("resume_measurement", self.resume_measurement, "Resume PL measurement", [])
        self.register_post_method("stop_measurement", self.stop_measurement, "Stop PL measurement", [])

    async def start_measurement(self, start_wavelength, end_wavelength, step, num_averages, time_constant, tolerance, starting_sensitivity):
        try:
            if not self.check_equipment_connection():
                raise ValueError("Equipment not connected")

            params = {
                "start_wavelength": start_wavelength,
                "end_wavelength": end_wavelength,
                "step": step,
                "num_averages": num_averages,
                "time_constant": time_constant,
                "tolerance": tolerance,
                "starting_sensitivity": starting_sensitivity
            }
            
            print(params)

            self.stop_requested = False
            self.paused = False
            self.measurement_task = asyncio.create_task(self.measure_pl(params))
            return json.dumps({"status": "Measurement started"})
        except Exception as e:
            print(f"Error in start_measurement: {e}")
            raise ValueError(f"Failed to start PL measurement: {str(e)}")

    def check_equipment_connection(self):
        if not self.monochromator.mono:
            print("Warning: Monochromator not connected")
            return False
        if not self.lock_in.lock_in:
            print("Warning: Lock-in amplifier not connected")
            return False
        return True

    async def pause_measurement(self):
        if not self.measurement_task:
            return json.dumps({"error": "No measurement in progress"})
        self.paused = True
        return json.dumps({"status": "Measurement paused"})

    async def resume_measurement(self):
        if not self.measurement_task:
            return json.dumps({"error": "No measurement in progress"})
        self.paused = False
        return json.dumps({"status": "Measurement resumed"})

    async def stop_measurement(self):
        if not self.measurement_task:
            return json.dumps({"error": "No measurement in progress"})
        self.stop_requested = True
        await self.measurement_task
        self.measurement_task = None
        return json.dumps({"status": "Measurement stopped"})

    async def measure_pl(self, params):
        start_wavelength = float(params['start_wavelength'])
        end_wavelength = float(params['end_wavelength'])
        step = float(params['step'])
        num_averages = int(params['num_averages'])
        time_constant = float(params['time_constant'])
        tolerance = float(params['tolerance'])
        starting_sensitivity = params['starting_sensitivity']

        await self.lock_in.set_sensitivity(starting_sensitivity)
        await self.lock_in.set_time_constant(time_constant)

        results = []

        current_wavelength = start_wavelength
        while current_wavelength <= end_wavelength and not self.stop_requested:
            while self.paused:
                await asyncio.sleep(0.1)
            
            result = await self.measure_single_wavelength(
                current_wavelength, num_averages, time_constant, tolerance
            )
            results.append(result)
            current_wavelength += step

            await self.send_partial_results(result)

        self.measurement_task = None
        return json.dumps(results)

    async def measure_single_wavelength(self, wavelength, num_averages, time_constant, tolerance):
        await self.monochromator.set_wavelength(wavelength)
        await asyncio.sleep(time_constant)  # Wait for the monochromator to settle

        r_values = []
        for _ in range(num_averages):
            r = float(await self.lock_in.get_r())
            r_values.append(r)
            await asyncio.sleep(time_constant)  # Wait for integration time

        r_average = sum(r_values) / len(r_values)

        # Check if the average is within the tolerance
        if max(r_values) - min(r_values) > tolerance * r_average:
            # If not within tolerance, discard and try again
            return await self.measure_single_wavelength(wavelength, num_averages, time_constant, tolerance)

        sensitivity = await self.lock_in.get_sensitivity()
        overload = await self.lock_in.get_overload()

        # Adjust sensitivity based on overload
        if float(overload) >= 4:
            next_sensitivity = self.get_next_higher_sensitivity(sensitivity)
            await self.lock_in.set_sensitivity(next_sensitivity)
        elif float(overload) <= 0:
            next_sensitivity = self.get_next_lower_sensitivity(sensitivity)
            await self.lock_in.set_sensitivity(next_sensitivity)

        return {
            "wavelength_target": wavelength,
            "R_average": r_average,
            "R_list": r_values,
            "sensitivity": sensitivity,
            "overload": overload,
            "time_constant": time_constant,
            "time_between_measures": time_constant,
            "number_of_measures": num_averages,
            "tolerance": tolerance
        }

    async def send_partial_results(self, result):
        # This method should be implemented to send partial results to the frontend
        # For now, we'll just print the result
        print(f"Partial result: {result}")

    def get_next_higher_sensitivity(self, current_sensitivity):
        sensitivities = list(self.lock_in.sensitivity_dict.keys())
        current_index = sensitivities.index(current_sensitivity)
        if current_index > 0:
            return sensitivities[current_index - 1]
        return current_sensitivity

    def get_next_lower_sensitivity(self, current_sensitivity):
        sensitivities = list(self.lock_in.sensitivity_dict.keys())
        current_index = sensitivities.index(current_sensitivity)
        if current_index < len(sensitivities) - 1:
            return sensitivities[current_index + 1]
        return current_sensitivity
