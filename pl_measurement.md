Now, we need to create a structure to measure the PL (Photoluminescence) of the sample. This includes manipulating the monochromator and lock-in amplifier, with the following steps:

1. Set the monochromator to the desired starting wavelength.
2. Read the lock-in amplifier output (R).
3. Adjust the lock-in amplifier sensitivity.
    - The sensitivity is based on the overload.
    - The overload is based on the signal strength, going from 0 to 4.
    - The signal strength from the R value must be between 0 and 4.
    - If the signal strength is equal than 4, the overload is triggered, and the sensitivity must be adjusted up.
    - If the signal strength is equal than 0, the signal is too weak, and the sensitivity must be adjusted down.
4. Read the lock-in amplifier sensitivity for the adjusted sensitivity.
5. Register the wavelength and lock-in amplifier output.
6. Make the average of the values for the same wavelength.
    - The average is made by the number of measures defined by the user for the specific wavelength.
    - The average time between measures is the constant time defined by the user times the input of the operator.
    - The threshold is the tolerance defined by the user for the set of measures for the specific wavelength (if the average is outside the threshold, the measure is discarded and attempted again for the same wavelength). Usually, the threshold is 0.1.
7. Repeat the process for the desired wavelength range.
    - The wavelength range is defined by the user.
    - The wavelength step is defined by the user.
    - The number of averages is defined by the user.
    - The constant time is defined by the user.
    - The tolerance is defined by the user.
8. Return the results for each wavelength in the following format of JSON:
```json
{
    "wavelength_target": 400,
    "R_average": 1.23,
    "R_list": [1.23, 1.24, 1.25, 1.26, 1.27, 1.28, 1.29, 1.30, 1.31, 1.32],
    "sensitivity": 1.23,
    "overload": 1.23,
    "time_constant": 1.23,
    "time_between_measures": 1.23,
    "number_of_measures": 10,
    "tolerance": 0.1
}
```

Please implement this as a controller/service in the LabHub server, using the equipment controllers from the Monochromator and Lock-In Amplifier, and also make the necessary adjustments to the app.py file to include this new controller/service so it can be used in the frontend.

---------------

Good! Now, there are a few things to be fixed in the current implementation of the PL measurement controller:

- Since it is being controlled by a frontend, it should work asynchronously, regarding that the frontend will send the parameters to the controller and the controller will return the results to the frontend in this loop.
- Also, the controller should be able to have commands to start, pause (and resume), and stop the measurement process.
- For the single wavelenght measure, the `time.sleep(time_constant)` is waiting for the lock-in amplifier to settle, and it should wait also after the measure for that single value, so that the integration time is respected.

------------------

Now consider the following:

- Considering the frontend that is already calling the methods of the monochromator and lock-in amplifier, the PL measurement controller should be able to use the current constructed classes for the monochromator and lock-in amplifier, and also use the methods of the monochromator and lock-in amplifier to construct the PL measurement.
- If it creates new classes for the monochromator and lock-in amplifier, it can generate bugs, since the classes of the monochromator and lock-in amplifier are already constructed.

Please implement this change considering that it should first activate the monochromator and lock-in amplifier classes, check if they are already constructed, and if not, warning the user that the monochromator and lock-in amplifier are not connected.



----------------

Possible bugs:

- The monochromator and lock-in amplifier are not connected, but the class was constructed.









