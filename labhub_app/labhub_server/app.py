from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import Dict, Any
# import psutil
# import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize a dictionary to hold the equipment instances
equipments = {
    "monochromator": None,
    "lock_in": None,
    "pl_measurement": None
}

def initialize_equipment(equipment_name: str):
    if equipment_name == "monochromator":
        from equipments.controller.monochromator_controller import Monochromator
        return Monochromator()
    elif equipment_name == "lock_in":
        from equipments.controller.lock_in_controller import LockInSR860
        return LockInSR860()
    elif equipment_name == "pl_measurement":
        from equipments.controller.pl_measurement_controller import PLMeasurement
        monochromator = equipments.get("monochromator")
        lock_in = equipments.get("lock_in")
        if not monochromator or not lock_in:
            raise HTTPException(status_code=400, detail="Monochromator and Lock-in amplifier must be initialized first")
        return PLMeasurement(monochromator, lock_in)
    else:
        raise HTTPException(status_code=404, detail="Equipment not found")

@app.get("/health")
async def health_check():
    return {"status": "ok 3"}

@app.get("/available_equipments")
async def get_available_equipments():
    return {"equipments": list(equipments.keys())}

@app.get("/methods/{equipment_name}")
async def get_methods(equipment_name: str):
    if equipment_name not in equipments:
        raise HTTPException(status_code=404, detail="Equipment not found")

    if equipments[equipment_name] is None:
        equipments[equipment_name] = initialize_equipment(equipment_name)
    else:
        return "error"
    print('ok')
    return equipments[equipment_name]

@app.post("/execute")
async def execute_command(request: Request):
    try:
        data = await request.json()
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    equipment_name = data.get("equipment_name")
    http_method = data.get("http_method")
    equipment_method = data.get("equipment_method")
    params = data.get("params", {})

    if equipment_name not in equipments:
        raise HTTPException(status_code=404, detail=f"Equipment '{equipment_name}' not found")

    if equipments[equipment_name] is None:
        equipments[equipment_name] = initialize_equipment(equipment_name)

    equipment = equipments[equipment_name]

    if not hasattr(equipment, equipment_method):
        raise HTTPException(status_code=404, detail=f"Method '{equipment_method}' not found for '{equipment_name}'")

    method = getattr(equipment, equipment_method)
    method_description = equipment.get_method_description(equipment_method)

    try:
        if http_method == "GET":
            if params:
                raise HTTPException(status_code=400, detail="GET method should not have parameters")
            result = method()
        elif http_method == "POST":
            result = method(**params)
        else:
            raise HTTPException(status_code=405, detail="Method not allowed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to {method_description} for '{equipment_name}': {str(e)}")

    if result is None:
        raise HTTPException(status_code=500, detail=f"Failed to {method_description} for '{equipment_name}'")

    return {equipment_method: result}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)