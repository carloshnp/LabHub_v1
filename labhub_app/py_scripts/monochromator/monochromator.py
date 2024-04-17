from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware

import clr

clr.AddReference("Cornerstone")
import CornerstoneDll


class Monochromator:
    def __init__(self):
        self.mono = None

    def connect(self):
        try:
            self.mono = CornerstoneDll.Cornerstone(True)
            print(self.mono)
            connection = self.mono.connect()
            if not connection:
                raise IOError("Monochromator not found")
            print("Mono connected")
            return connection
        except Exception as e:
            print("Exception: ", e)
            self.mono = None
            return self.mono

    def get_mono(self):
        return self.mono.getDeviceName()

    def get_response(self):
        return self.mono.getResponse().split("\r\n")[0]

    def get_wavelength(self):
        self.mono.getWavelength()
        return self.get_response()

    def get_grat(self):
        self.mono.getGrating()
        return self.get_response()

    def get_status_byte(self):
        self.mono.sendCommand("STB?")
        stb = self.get_response()
        if stb != "0":
            self.mono.sendCommand("ERROR?")
        return self.get_response()

    def set_grat(self, grat):
        self.mono.setGrating(grat)
        return self.get_response()

    def set_wavelength(self, wavelength):
        self.mono.setWavelength(wavelength)
        return self.get_response()

HOST = "127.0.0.1"
PORT = 8000

mono = Monochromator()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def read_root():
    content = "Hello World"
    return Response(content, status_code=201)


@app.get("/connect")
async def connect():
    connection = mono.connect()
    if connection is None:
        raise HTTPException(
            status_code=500, detail="Failed to connect to monochromator"
        )
    return {"status": "connected"}


@app.get("/mono")
async def get_mono():
    return mono.get_mono()


@app.get("/wavelength")
async def get_wavelength():
    wavelength = mono.get_wavelength()
    return {"wavelength": wavelength}


@app.get("/grat")
async def get_grat():
    grat = mono.get_grat()
    return {"grat": grat}


@app.get("/status_byte")
async def get_status_byte():
    status_byte = mono.get_status_byte()
    return {"status_byte": status_byte}


@app.post("/grat")
async def set_grat(grat):
    grat_response = mono.set_grat(int(grat))
    return {"grat": grat_response}


@app.post("/wavelength")
async def set_wavelength(wavelength):
    wavelength_response = mono.set_wavelength(float(wavelength))
    return {"wavelength": wavelength_response}


if __name__ == "__main__":
    import uvicorn
    import asyncio

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    loop.run_until_complete(uvicorn.run(app, host=HOST, port=PORT))
