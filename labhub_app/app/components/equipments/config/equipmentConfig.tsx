import { Equipment, HttpMethod, InputType } from '../types/equipments';

export const equipmentConfig: Record<string, Equipment> = {
  monochromator: {
    name: 'Monochromator',
    methods: {
      connect: {
        equipmentName: 'monochromator',
        method: 'connect',
        httpMethod: HttpMethod.POST,
        params: {}
      },
      setGrat: {
        equipmentName: 'monochromator',
        method: 'set_grat',
        httpMethod: HttpMethod.POST,
        params: { grat: { type: InputType.NUMBER, value: 0 } }
      },
      setWavelength: {
        equipmentName: 'monochromator',
        method: 'set_wavelength',
        httpMethod: HttpMethod.POST,
        params: { wavelength: { type: InputType.NUMBER, value: 0 } }
      },
      getWavelength: {
        equipmentName: 'monochromator',
        method: 'get_wavelength',
        httpMethod: HttpMethod.POST,
        params: {}
      },
      getGrat: {
        equipmentName: 'monochromator',
        method: 'get_grat',
        httpMethod: HttpMethod.POST,
        params: {}
      }
    }
  },
  lock_in: {
    name: 'Lock-In',
    methods: {
      connect: {
        equipmentName: 'lock_in',
        method: 'connect',
        httpMethod: HttpMethod.POST,
        params: {}
      },
      getLockin: {
        equipmentName: 'lock_in',
        method: 'get_lockin',
        httpMethod: HttpMethod.GET,
        params: {}
      },
      getR: {
        equipmentName: 'lock_in',
        method: 'get_r_value',
        httpMethod: HttpMethod.GET,
        params: {}
      },
      getSensitivity: {
        equipmentName: 'lock_in',
        method: 'get_sensitivity',
        httpMethod: HttpMethod.GET,
        params: {}
      },
      setSensitivity: {
        equipmentName: 'lock_in',
        method: 'set_sensitivity',
        httpMethod: HttpMethod.POST,
        params: {
          sensitivity: {
            type: InputType.SELECT,
            options: [
              '1 V', '500 mV', '200 mV', '100 mV', '50 mV', '20 mV',
              '10 mV', '5 mV', '2 mV', '1 mV', '500 μV', '200 μV',
              '100 μV', '50 μV', '20 μV', '10 μV', '5 μV', '2 μV',
              '1 μV', '500 nV', '200 nV', '100 nV', '50 nV', '20 nV',
              '10 nV', '5 nV', '2 nV', '1 nV'
            ]
          }
        }
      },
      getTimeConstant: {
        equipmentName: 'lock_in',
        method: 'get_time_constant',
        httpMethod: HttpMethod.GET,
        params: {}
      },
      setTimeConstant: {
        equipmentName: 'lock_in',
        method: 'set_time_constant',
        httpMethod: HttpMethod.POST,
        params: {
          time_constant: {
            type: InputType.SELECT,
            options: [
              '1 μs', '3 μs', '10 μs', '30 μs', '100 μs', '300 μs',
              '1 ms', '3 ms', '10 ms', '30 ms', '100 ms', '300 ms',
              '1 s', '3 s', '10 s', '30 s', '100 s', '300 s',
              '1 ks', '3 ks', '10 ks', '30 ks'
            ]
          }
        }
      },
      getOverload: {
        equipmentName: 'lock_in',
        method: 'get_overload',
        httpMethod: HttpMethod.GET,
        params: {}
      }
    }
  },
  pl_measurement: {
    name: 'PL Measurement',
    methods: {
      startMeasurement: {
        equipmentName: 'pl_measurement',
        method: 'start_measurement',
        httpMethod: HttpMethod.POST,
        params: {
          start_wavelength: { type: InputType.NUMBER },
          end_wavelength: { type: InputType.NUMBER },
          step: { type: InputType.NUMBER },
          num_averages: { type: InputType.NUMBER },
          time_constant: { 
            type: InputType.SELECT,
            options: [
              '1 μs', '3 μs', '10 μs', '30 μs', '100 μs', '300 μs',
              '1 ms', '3 ms', '10 ms', '30 ms', '100 ms', '300 ms',
              '1 s', '3 s', '10 s', '30 s', '100 s', '300 s',
              '1 ks', '3 ks', '10 ks', '30 ks'
            ]
          },
          tolerance: { type: InputType.NUMBER },
          starting_sensitivity: { 
            type: InputType.SELECT, 
            options: [
            '1 V', '500 mV', '200 mV', '100 mV', '50 mV', '20 mV',
            '10 mV', '5 mV', '2 mV', '1 mV', '500 μV', '200 μV',
            '100 μV', '50 μV', '20 μV', '10 μV', '5 μV', '2 μV',
            '1 μV', '500 nV', '200 nV', '100 nV', '50 nV', '20 nV',
              '10 nV', '5 nV', '2 nV', '1 nV'
            ]
          }
        },
      },
      pauseMeasurement: {
        equipmentName: 'pl_measurement',
        method: 'pause_measurement',
        httpMethod: HttpMethod.POST,
        params: {}
      },
      resumeMeasurement: {
        equipmentName: 'pl_measurement',
        method: 'resume_measurement',
        httpMethod: HttpMethod.POST,
        params: {}
      },
      stopMeasurement: {
        equipmentName: 'pl_measurement',
        method: 'stop_measurement',
        httpMethod: HttpMethod.POST,
        params: {}
      }
    }
  }
};