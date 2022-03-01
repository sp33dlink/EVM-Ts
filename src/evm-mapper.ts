import EvmEntity, { EvmEntityProperty, EvmPropType, EvmSchema } from './evm-entity'

export default class EvmMapper {
  static getEntity<T extends EvmEntity>(json: any, evmEntityClazz: new () => T): T {
    return this.mapEntity(json, evmEntityClazz)
  }

  private static mapEntity<T extends EvmEntity>(
    json: any,
    clazz: new () => T,
    path = ''
  ): T {
    const instance = new clazz()
    if (instance._evmSchema == null)
      this.throwErr('', 'EvmEntityClazz is missing the EvmSchema')
    if (path === '') path = instance._evmSchema.evmId

    this.checkJsonProps(json, instance._evmSchema)
    this.mapSchemaProps(json, instance, path)

    return instance
  }

  private static checkJsonProps(jsonValue: any, evmSchema: EvmSchema): void {
    Object.keys(jsonValue).forEach((key: string) => {
      const property = evmSchema.properties.find((prop) => prop.id === key)
      if (property == null)
        this.throwErr(evmSchema.evmId, 'unexpected property', {
          id: key,
          type: typeof jsonValue[key] as EvmPropType,
        })
    })
  }

  private static mapSchemaProps(json: any, instance: EvmEntity, path: string): void {
    const schema = instance._evmSchema

    schema.properties.forEach((prop) => {
      const jsonValue = this.getJsonValueFor(prop, json)
      const propIdKey = prop.id as keyof EvmEntity
      let mappedValue: any

      if (jsonValue != null) this.checkPropType(jsonValue, prop, path)
      else if (prop.required !== false)
        this.throwErr(path, 'is required but not present', prop)

      if (!Array.isArray(jsonValue))
        mappedValue = this.mapValue(jsonValue, prop, path)
      else mappedValue = this.mapArrayValues(jsonValue, prop, path)

      if (
        instance[propIdKey] !== undefined &&
        prop.required === false &&
        mappedValue === undefined
      )
        return
      instance[propIdKey] = mappedValue
    })
  }

  private static mapValue(
    jsonValue: any,
    property: EvmEntityProperty,
    path: string
  ): any {
    path += `.${property.id}`
    if (property.mappingFn != null) {
      return property.mappingFn(jsonValue)
    }
    if (property.type === EvmPropType.EvmEntity && jsonValue != null) {
      if (property.evmEntityClazz == null)
        this.throwErr(path, `missing evmEntityClazz in property`, property)
      else return this.mapEntity(jsonValue, property.evmEntityClazz, path)
    }
    return jsonValue /* ? */
  }

  private static mapArrayValues(
    jsonValue: any[],
    property: EvmEntityProperty,
    path: string
  ): any {
    return jsonValue.map((value, index) => {
      this.checkPropType(value, property, path, index)
      return this.mapValue(value, property, path)
    })
  }

  private static getJsonValueFor(property: EvmEntityProperty, json: any): any {
    return json[property.id]
  }

  private static checkPropType(
    jsonValue: any,
    property: EvmEntityProperty,
    path: string,
    listIndex?: number
  ): void {
    const isArray = Array.isArray(jsonValue)
    let expectedTypeText: string | null = property.type
    let actualTypeText: string | null = null
    const jsonValueType = typeof jsonValue

    if (property.array === true && listIndex == null) {
      expectedTypeText = `Array<${property.type}>`
      if (!isArray) {
        actualTypeText = jsonValueType
      }
    } else if (isArray) {
      actualTypeText = 'array'
    } else if (
      property.type === EvmPropType.EvmEntity &&
      jsonValueType === 'object'
    ) {
      // skip check here. EvmEntity is being checked recursively later
      return
    } else if (jsonValueType !== property.type) {
      actualTypeText = jsonValueType
    }

    if (actualTypeText != null)
      this.throwErr(
        path,
        `expected '${expectedTypeText}' but was '${actualTypeText}'`,
        property,
        listIndex
      )
  }

  private static throwErr(
    path: string,
    text: string,
    property?: EvmEntityProperty,
    listIndex?: number
  ) {
    let propertyText = property ? `.${property.id}` : ''
    if (listIndex != null && property != null) propertyText += `[${listIndex}]`
    throw new Error(`EvmEntityError: '${path}${propertyText}' ${text}`)
  }
}
