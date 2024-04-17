import sys
import json
import pyvisa

def run_command(command):
    rm = pyvisa.ResourceManager()
    instrument = rm.open_resource('USB0::0x0B4E::0x0323::300348::INSTR')
    instrument.write(command)
    response = instrument.read()
    return response

if __name__ == "__main__":
    command = sys.argv[1]
    response = run_command(command)
    print(json.dumps({"response": response}))
