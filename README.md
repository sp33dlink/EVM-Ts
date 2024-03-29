
# EVM-Ts [![CircleCI](https://circleci.com/gh/sp33dlink/EVM-Ts/tree/master.svg?style=shield)](https://circleci.com/gh/sp33dlink/EVM-Ts/tree/master)

***E**ntity **v**alidation and **m**apping for typescript*

*=> Validates json data and maps it into actual and valid typescript classes.
- jokingly small (no dependencies) and easy as 🍰 to use
- useful errors when validations fail
- ✅ full test coverage
- validates all json types (including other objects and lists)
- required, optional and default value properties
- use real classes with methods instead of interfaces


# Installation

```npm i evm-ts```

# Usage

### 1. define your [EvmEntities](https://github.com/sp33dlink/EVM-Ts/blob/09b96287b1b061c0723187d40400f3acde2dd125/src/evm-entity.ts#L1) and just add the [EvmSchema](https://github.com/sp33dlink/EVM-Ts/blob/09b96287b1b061c0723187d40400f3acde2dd125/src/evm-entity.ts#L5)
``` typescript
class SampleEntity implements EvmEntity {
  id!: number
  text!: string
  optional?: string
  
  doubleId(): number { return id * 2 }

  _evmSchema = {
    evmId: 'SampleEntity',
    properties: [
      { id: 'id', type: EvmPropType.Number },
      { id: 'text', type: EvmPropType.String },
      { id: 'optional', type: EvmPropType.String, required: false },
    ]
  }
}
```
### 2. map the data from your backend
``` typescript
const jsonData = { firstProperty: 3, anotherProperty: 'test' }

const sampleInstance = EvmMapper.getEntity(jsonData, SampleEntity)

sampleInstance.id // => 3
sampleInstance.doubleId() // => 6 
sampleInstance.optional // => undefined
```
### 3. get notified on failed validations
``` typescript
const jsonData = { firstProperty: 3, listOfOtherEntity: [ { anotherList: [ true, 'false' ] } ] }

EvmMapper.getEntity(jsonData, SampleEntity)

// => EvmEntityError: 'SampleEntity.listOfOtherEntity[0].anotherList[1]' expected 'boolean' but was 'string'
```
