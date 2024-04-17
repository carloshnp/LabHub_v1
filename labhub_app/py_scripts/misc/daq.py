import pyvisa
import usb
import nidaqmx

# Analog Input
# with nidaqmx.Task() as task:
#     task.ai_channels.add_ai_voltage_chan("Dev1/ai0")  # Replace "Dev1/ai0" with your device/channel
#     print(task.read())

# Analog Output
def write_voltage(voltage):
    with nidaqmx.Task() as task:
        task.ao_channels.add_ao_voltage_chan("Dev1/ao1")  # Replace "Dev1/ao1" with your device/channel
        task.write(voltage)  # Write a voltage of 5.0V

# GET USB LISTING
def get_usb_device_info():
    devices_info = []
    devices = usb.core.find(find_all=True)
    for device in devices:
        try:
            vendor_id = device.idVendor
            product_id = device.idProduct
            serial_number = device.serial_number
            devices_info.append((vendor_id, product_id, serial_number))
        except Exception as e:
            print(f"Could not retrieve info for device with ID: {device.idVendor}:{device.idProduct}, error: {str(e)}")
    return devices_info

def construct_resource_name(vendor_id, product_id, serial_number):
    if vendor_id is None or product_id is None:
        return None
    if serial_number is None:
        serial_number = '1B3730B'
    return f"USB0::0x{vendor_id:04X}::0x{product_id:04X}::0::INSTR"

def test_connection(resource_name):
    rm = pyvisa.ResourceManager('@py')
    try:
        device = rm.open_resource(resource_name)
        print(device.query("*IDN?"))
    except Exception as e:
        print(f"Could not connect to device with resource name {resource_name}, error: {str(e)}")

if __name__ == "__main__":
    devices_info = get_usb_device_info()
    for vendor_id, product_id, serial_number in devices_info:
        resource_name = construct_resource_name(vendor_id, product_id, serial_number)
        test_connection(resource_name)