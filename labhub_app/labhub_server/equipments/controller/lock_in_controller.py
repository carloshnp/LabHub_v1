from equipments.controller.equipment import Equipment
import pyvisa
import time

class LockInSR860(Equipment):
    def __init__(self):
        super().__init__()
        self.lock_in = None

        # Dictionaries for time constant and sensitivity
        self.time_constant_dict = {
            '1 μs': 0, '3 μs': 1, '10 μs': 2, '30 μs': 3, '100 μs': 4, '300 μs': 5,
            '1 ms': 6, '3 ms': 7, '10 ms': 8, '30 ms': 9, '100 ms': 10, '300 ms': 11,
            '1 s': 12, '3 s': 13, '10 s': 14, '30 s': 15, '100 s': 16, '300 s': 17,
            '1 ks': 18, '3 ks': 19, '10 ks': 20, '30 ks': 21
        }

        self.sensitivity_dict = {
            '1 V': 0, '500 mV': 1, '200 mV': 2, '100 mV': 3, '50 mV': 4, '20 mV': 5,
            '10 mV': 6, '5 mV': 7, '2 mV': 8, '1 mV': 9, '500 μV': 10, '200 μV': 11,
            '100 μV': 12, '50 μV': 13, '20 μV': 14, '10 μV': 15, '5 μV': 16, '2 μV': 17,
            '1 μV': 18, '500 nV': 19, '200 nV': 20, '100 nV': 21, '50 nV': 22, '20 nV': 23,
            '10 nV': 24, '5 nV': 25, '2 nV': 26, '1 nV': 27
        }

        # Register methods
        self.register_post_method("connect", self.connect, "Connect to the device", [])
        self.register_get_method("get_lockin", self.get_lockin, "Get Lock-In device name")
        self.register_get_method("get_r_value", self.get_r_value, "Get current value of R")
        self.register_get_method("get_sensitivity", self.get_sensitivity, "Get current sensitivity")
        self.register_get_method("get_time_constant", self.get_time_constant, "Get time constant")
        self.register_post_method("set_sensitivity", self.set_sensitivity, "Set sensitivity", ["sensitivity"])
        self.register_post_method("set_time_constant", self.set_time_constant, "Set time constant", ["time_constant"])
        self.register_get_method("get_overload", self.get_overload, "Get overload status")

    def connect(self):
        try:
            rm = pyvisa.ResourceManager()
            print(rm.list_resources())
            self.lock_in = rm.open_resource("GPIB0::4::INSTR")
            return True
        except Exception as e:
            print("Exception: ", e)
            return None

    def get_lockin(self):
        return self.lock_in.query("*IDN?")

    def get_r_value(self):
        try:
            R = self.lock_in.query("OUTP? 2")
            print(R)
            return R
        except Exception as e:
            print("Exception: ", e)
            return None

    def get_sensitivity(self):
        try:
            sensitivity_index = int(self.lock_in.query("SCAL?"))
            for key, value in self.sensitivity_dict.items():
                if value == sensitivity_index:
                    return key
        except Exception as e:
            print("Exception: ", e)
            return None

    def set_sensitivity(self, sensitivity):
        print(sensitivity)
        try:
            if isinstance(sensitivity, dict):
                sensitivity_value = sensitivity.get('sensitivity', '')
            elif isinstance(sensitivity, str):
                sensitivity_value = sensitivity
            else:
                raise ValueError("Invalid sensitivity input")

            if sensitivity_value in self.sensitivity_dict:
                print(sensitivity_value)
                self.lock_in.write(f"SCAL {self.sensitivity_dict[sensitivity_value]}")
                return True
            else:
                raise ValueError("Invalid sensitivity value")
        except Exception as e:
            print("Exception: ", e)
            return None

    def get_time_constant(self):
        try:
            time_constant_index = int(self.lock_in.query("OFLT?"))
            for key, value in self.time_constant_dict.items():
                if value == time_constant_index:
                    return key
        except Exception as e:
            print("Exception: ", e)
            return None

    def set_time_constant(self, time_constant):
        try:
            if isinstance(time_constant, dict):
                time_constant_value = time_constant.get('time_constant', '')
            elif isinstance(time_constant, str):
                time_constant_value = time_constant
            else:
                raise ValueError("Invalid time constant input")

            if time_constant_value in self.time_constant_dict:
                self.lock_in.write(f"OFLT {self.time_constant_dict[time_constant_value]}")
                return True
            else:
                raise ValueError("Invalid time constant value")
        except Exception as e:
            print("Exception: ", e)
            return None

    def get_overload(self):
        try:
            return self.lock_in.query("LIAS? 0")
        except Exception as e:
            print("Exception: ", e)
            return None