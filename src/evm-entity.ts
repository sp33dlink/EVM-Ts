export default interface EvmEntity {
  _evmSchema: EvmSchema
}

export interface EvmSchema {
  evmId: string
  properties: EvmEntityProperty[]
}

export interface EvmEntityProperty {
  id: string
  type: EvmPropType
  required?: boolean /** default: true */
  array?: boolean
  evmEntityClazz?: new () => EvmEntity
  mappingFn?(json: any): any
}

export enum EvmPropType {
  String = 'string',
  Number = 'number',
  Boolean = 'boolean',
  EvmEntity = 'evmEntity',
  CustomMapping = 'customMapping',
}
