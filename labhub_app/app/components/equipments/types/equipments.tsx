export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE'
}

export enum InputType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  SELECT = 'SELECT'
}

export interface EquipmentMethod {
  equipmentName: string;
  method: string;
  httpMethod: HttpMethod;
  params: {
    [key: string]: {
      type: InputType;
      value?: any;
      options?: string[];
    }
  };
}

export interface Equipment {
  name: string;
  methods: Record<string, EquipmentMethod>;
}