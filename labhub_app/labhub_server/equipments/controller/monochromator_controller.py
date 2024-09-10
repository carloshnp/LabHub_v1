from equipments.controller.equipment import Equipment
import clr
clr.AddReference("Cornerstone")
import CornerstoneDll

class Monochromator(Equipment):
    def __init__(self):
        super().__init__()
        self.mono = None

        # Register methods
        self.register_post_method("connect", self.connect, "Connect to the device", [])
        self.register_get_method("get_mono", self.get_mono, "Get monochromator device name")
        self.register_get_method("get_wavelength", self.get_wavelength, "Get current wavelength")
        self.register_get_method("get_grat", self.get_grat, "Get current grating")
        self.register_get_method("get_status_byte", self.get_status_byte, "Get status byte")
        self.register_post_method("set_grat", self.set_grat, "Set grating", ["grat"])
        self.register_post_method("set_wavelength", self.set_wavelength, "Set wavelength", ["wavelength"])

    def connect(self):
        try:
            self.mono = CornerstoneDll.Cornerstone(True)
            print(self.mono)
            connection = self.mono.connect()
            if not connection:
                raise IOError("Monochromator not found")
            return connection
        except Exception as e:
            self.mono = None
            return self.mono

    def get_mono(self):
        return self.mono.getDeviceName() if self.mono else None

    def get_response(self):
        return self.mono.getResponse().split("\r\n")[0] if self.mono else None

    def get_wavelength(self):
        if self.mono:
            self.mono.getWavelength()
            return self.get_response()
        return None

    def get_grat(self):
        if self.mono:
            self.mono.getGrating()
            return self.get_response()
        return None

    def get_status_byte(self):
        if self.mono:
            self.mono.sendCommand("STB?")
            stb = self.get_response()
            if stb != "0":
                self.mono.sendCommand("ERROR?")
            return self.get_response()
        return None

    def set_grat(self, grat: int):
        if self.mono:
            self.mono.setGrating(grat)
            return self.get_response()
        return None

    def set_wavelength(self, wavelength: float):
        if self.mono:
            self.mono.setWavelength(wavelength)
            return self.get_response()
        return None
