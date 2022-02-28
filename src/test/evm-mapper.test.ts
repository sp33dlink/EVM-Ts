import EvmEntity, { EvmPropType, EvmSchema } from '../evm-entity'
import EvmMapper from '../evm-mapper'

describe('EvmMapper tests', () => {
  it('should return mapped instance of entity when valid json is passed', () => {
    const json = FULL_JSON

    const instance = EvmMapper.getEntity(json, SomeEvmEntity)

    expect(instance.a).toBe(json.a)
    expect(instance.b).toBe(json.b)
    expect(instance.array.length).toBe(json.array.length)
    expect(instance.array).toEqual(json.array)
    expect(instance.doubleOfA()).toEqual(6)
  })

  it('should return undefined for optional value when json misses it', () => {
    const json = MIN_JSON

    const instance = EvmMapper.getEntity(json, SomeEvmEntity)

    expect(instance.b).toBeUndefined()
  })

  it('should throw error when json misses required property', () => {
    const json = { ...MIN_JSON } as any
    delete json.a

    expect(() => {
      EvmMapper.getEntity(json, SomeEvmEntity)
    }).toThrowError(`.a' is required but not present`)
  })

  it('should throw error when json property has wrong type', () => {
    const json = { ...MIN_JSON, a: 'text' }

    expect(() => {
      EvmMapper.getEntity(json, SomeEvmEntity)
    }).toThrowError(`.a' expected`)
  })

  it('should throw error when json has unwanted property', () => {
    const json = { ...MIN_JSON, x: 3 }

    expect(() => {
      EvmMapper.getEntity(json, SomeEvmEntity)
    }).toThrowError(`.x' unexpected property`)
  })

  it('should map empty array to instance with empty array', () => {
    const json = { ...MIN_JSON, array: [] }

    const instance = EvmMapper.getEntity(json, SomeEvmEntity)

    expect(instance.array.length).toEqual(0)
  })

  it('should throw error when json has boolean instead of boolean array', () => {
    const json = { ...MIN_JSON, array: true }

    expect(() => {
      EvmMapper.getEntity(json, SomeEvmEntity)
    }).toThrowError(`.array' expected 'Array<boolean>' but was 'boolean'`)
  })

  it('should throw error when json has string array instead of string', () => {
    const json = { ...MIN_JSON, b: [] }

    expect(() => {
      EvmMapper.getEntity(json, SomeEvmEntity)
    }).toThrowError(`.b' expected 'string' but was 'array'`)
  })

  it('should throw error when json has array with wrong type', () => {
    const json = { ...MIN_JSON, array: [true, 'text'] }

    expect(() => {
      EvmMapper.getEntity(json, SomeEvmEntity)
    }).toThrowError(`.array[1]' expected 'boolean' but was 'string'`)
  })

  it('should return mapped instance of OtherEvmEntity when valid json is passed', () => {
    const json = FULL_JSON

    const instance = EvmMapper.getEntity(json, SomeEvmEntity)

    expect(instance.otherEvm!.value).toBe(json.otherEvm.value)
    expect(instance.otherEvm!.valueText).toBe(json.otherEvm.value.toString())
  })

  it('should throw error when json has wrong poptype of OtherEvmEntity', () => {
    const json = { ...FULL_JSON, otherEvm: { value: 'text' } }

    expect(() => {
      EvmMapper.getEntity(json, SomeEvmEntity)
    }).toThrowError(
      `SomeEvmEntity.otherEvm.value' expected 'number' but was 'string'`
    )
  })

  it('should throw error when json has wrong poptype of OtherEvmEntity', () => {
    const json = { ...FULL_JSON, otherEvm: {} }

    expect(() => {
      EvmMapper.getEntity(json, SomeEvmEntity)
    }).toThrowError(`SomeEvmEntity.otherEvm.value' is required`)
  })

  it('should return result of mappingFn when Fn is passed', () => {
    const json = { ...FULL_JSON, mapped: '2022-02-28' }

    const instance = EvmMapper.getEntity(json, SomeEvmEntity)
    expect(instance.mapped!.getFullYear()).toBe(2022)
  })

  it('should throw error when wrong EntityClass is passed', () => {
    expect(() => {
      EvmMapper.getEntity({}, NonEvmEntityClass as any)
    }).toThrowError(`Clazz is missing the EvmSchema`)
  })
})

class SomeEvmEntity implements EvmEntity {
  a!: number
  b?: string
  array!: boolean[]
  otherEvm?: OtherEvmEntity
  otherEvmList?: OtherEvmEntity[]
  mapped?: Date

  doubleOfA(): number {
    return this.a * 2
  }

  _evmSchema: EvmSchema = {
    evmId: 'SomeEvmEntity',
    properties: [
      { id: 'a', type: EvmPropType.Number },
      { id: 'b', type: EvmPropType.String, required: false },
      { id: 'array', type: EvmPropType.Boolean, array: true },
      {
        id: 'otherEvm',
        type: EvmPropType.EvmEntity,
        required: false,
        evmEntityClazz: OtherEvmEntity,
      },
      {
        id: 'otherEvmList',
        required: false,
        array: true,
        type: EvmPropType.EvmEntity,
        evmEntityClazz: OtherEvmEntity,
      },
      {
        id: 'mapped',
        type: EvmPropType.String,
        required: false,
        mappingFn: (json: any) => new Date(json),
      },
    ],
  }
}

class OtherEvmEntity implements EvmEntity {
  value!: number
  get valueText(): string {
    return `${this.value}`
  }

  _evmSchema: EvmSchema = {
    evmId: 'OtherEvmEntity',
    properties: [{ id: 'value', type: EvmPropType.Number }],
  }
}

class NonEvmEntityClass {}

const MIN_JSON = {
  a: 3,
  array: [],
}

const FULL_JSON = {
  a: 3,
  b: 'five',
  array: [false, true],
  otherEvm: { value: 8 },
}
