## SR860 Lock-In:

### Commands:

- R
- Sensitivity (scale)
  - `SCAL <value>` sets the signal strength (sensitivity)
  - `SCAL?` returns the signal strength
- Time constant
  - `OFLT <value>` sets the time constant
  - `OFLT?` returns the time constant
- Overload
  - Overload adjustment:
    - `ILVL?` returns the signal strength - 0 to 4 (check the ideal strength)
    - `SCAL <value>` sets the signal strength (sensitivity)
- Connect
  - Arrange connection to the lock-in with PyVisa
  - Setup connection according to the GPIB address

# Medidas

## Medida de PL

- Setar Mono no WL desejado
- Ler R do lock-In
- Ajustar escala do lock-in de acordo com o overload
- Ler escala do lock-in
- Registrar WL + R (com escala)
(repetir na faixa de WL desejada)

- Ler constante de tempo
  - Tempo entre medidas (constante de tempo vezes input do operador)
  - Tempo entre médias
  - Número de medidas por média
- Escolher constante de tempo e multiplicada por um valor X
- Tolerância
- Passo (wl)
- Wl inicial + final

- Associar sequencer com repeater ou repeater com sequencer?
  - Criar fila entre repeaters (caso haja mais de um repeater)

# Tasks

## Context

- Add equipments list from Cabinet to Context
- Add components states to Context
- Add selection components to Context
- Generate communication from Selection with Cabinet
- Generate communication from Plot with Selection

## Components

- Separate handlers to another file and put state updating tied to the main component TSX
- Generate task logic to relate handlers and state update
- Generate Sequencer add command to insert ddl
- Create drag and drop equipments to cabinet
- Create Repeater logic with Context
- Associate plot with Repeater by selecting variables (create plotter component? Displayer?)

# Schema

- API has controllers for each equipment
- Each equipment has a list on methods that it has to be controlled
- Requests are sent to:
  - See if equipment is available -> if it is, then send methods it has
  - Communicate with equipment through GET and POST methods (monochromator, lock-in, DAQ, etc.)

- Front-end has to get info from equipments:
  - Store each equipment methods from requests
  - Communicate to see if it is connected
  - Generate dynamic inputs for each equipment component based on methods
  - Send requests as user interacts with dynamic inputs

# To-do

- Create equipment list with regard to methdos from each equipment (requested from API) - done
- Generate equipment on cabinet when clicking in equipment from list - done
  - Generate control components for each method - done
  - Set rules for component generation - done
- Make it available for Custom components - done

- Implement names for each button/form
- Style each component
- Generate space for chain of custom equipments
- Couple chains
- Let save current chain being used
- Generate custom equipments: sequencer, repeater
  - Sequencer should sequence each custom repeating logic
  - Repeater should repeat a command from an equipment or repeat a sequence (maybe a 3rd component here? for the execution, maybe an Executor)
- Generate fake mock equipments for testing
- Let data from custom chain be used for plotting graphs
- Let plot axis be settable
  - Recognize which parameters are varying
  - Recognize possible parameters: time lapsed, count of measurements, intensity x wavelenght
  - Set other parameters that should be recorded during measurement
- When executing a sequence chain, record the following:
  - Time elapsed
  - Configuration of equipments: which parameters are set, which are varying on custom equipments, which columns on table are being generated, etc.
  - Create a new file (.csv maybe) and update file according to new information

- Toast errors on front-end, such as connection errors
- Generate a clickable panel for each parameter on equipments, and open a tooltip for inputting values
  - Inputs should be added clicking in a button or pressing enter
- Sequence of PL should have it's logic on the server side, while returning the data to the front-end, about initial configuration, state of equipments parameters, and measurements data

### JSONs

```json
{
  "equipment_name":"pl_measurement",
  "http_method":"POST",
  "equipment_method":"start_measurement",
  "params":{
    "start_wavelength": 600,
    "end_wavelength": 650,
    "step": 10,
    "num_averages": 5,
    "time_constant": "10 ms",
    "tolerance": 0.2,
    "starting_sensitivity": "10 mV"
  }
}
```

```json
{
  "equipment_name":"lock_in",
  "http_method":"POST",
  "equipment_method":"connect",
  "params":{}
}
```

```json
{
  "equipment_name":"monochromator",
  "http_method":"POST",
  "equipment_method":"connect",
  "params":{}
}
```