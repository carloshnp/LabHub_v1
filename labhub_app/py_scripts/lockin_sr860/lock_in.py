from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
# from srsinst.sr860 import SR860
import time
import pandas as pd
import matplotlib.pyplot as plt
import pyvisa

### Check for resources names and ports
print(pyvisa.ResourceManager().list_resources())

class LockInSR860:
    def __init__(self):
        self.lock_in = None

    def connect(self):
        try:
            rm = pyvisa.ResourceManager()
            self.lock_in = rm.open_resource("GPIB0::4::INSTR")
            return self.lock_in
        except Exception as e:
            print("Exception: ", e)
            return None

    def get_R(self):
        try:
            R = self.lock_in.query("OUTP? 2")
            return R
        except Exception as e:
            print("Exception: ", e)
            return None

    def get_sensitivity(self):
        try:
            return self.lock_in.query("SCAL?")
        except Exception as e:
            print("Exception: ", e)
            return None

    def get_time_constant(self):
        try:
            time_constant = self.lock_in.query("OFLT?")
            return time_constant
        except Exception as e:
            print("Exception: ", e)
            return None

### SAMPLE READING FROM LOCK IN

time_readings = []
r_measurements = []
sensitivity = 0

lock_in = LockInSR860()
lock_in.connect()

for i in range(100):
    time.sleep(0.5)
    R = float(lock_in.get_R())
    time_adjust = i * 0.1
    time_readings.append(time_adjust)
    r_measurements.append(R)
    print(R)

sensitivity = lock_in.get_sensitivity()
time_constant = lock_in.get_time_constant()

df = pd.DataFrame({'time': time_readings, 'R': r_measurements})

fig, ax = plt.subplots()
ax.plot(df['time'], df['R'], label=f'Sensitivity: {sensitivity}, Time Constant: {time_constant}')
ax.set_xlabel('Time (seconds)')
ax.set_ylabel('R (Volt)')
ax.set_ylim(auto=True)  # Set the limits of the Y-axis
ax.set_title('R vs Time')
ax.legend()
plt.tight_layout()
plt.savefig('plot.png')
plt.show()



##### API stuff
# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # Allow all origins
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# @app.get("/")
# async def read_root():
#     content = "Hello World"
#     return Response(content, status_code=201)
