import monochromator.monochromator as mono_module
import lockin_sr860.lock_in as lockin_module

time = []
r_measurements = []
wavelength_measurements = []
sensitivity = None
time_constant = None

# Initialize the monochromator and lock-in amplifier
lockin = lockin_module.LockInSR860()
mono = mono_module.Monochromator()

lockin.connect()
mono.connect()

# def main():
#     pass

# if __name__ == "__main__":
#     main()