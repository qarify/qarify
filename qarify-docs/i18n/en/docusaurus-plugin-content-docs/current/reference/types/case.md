# TestCase Schema

Represents a single, atomic test case that verifies a specific piece of functionality.
A test case consists of a sequence of steps (actions and expectations).

This type is translated into a JSON schema for validation and documentation purposes.

**Properties**

| Name                        | Type      | Description                                                                                                                                                                           | Required |
| --------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| **id**                      | `string`  | A unique identifier for the test case. It is recommended to use a UUID.<br/>Format: `"uuid"`<br/>                                                                                     | yes      |
| **title**                   | `string`  | A human-readable title for the test case.<br/>                                                                                                                                        | yes      |
| **name**                    | `string`  | An optional, machine-readable name for the test case, used as a slug.<br/>Should contain only lowercase letters, numbers, hyphens, and underscores.<br/>Pattern: `^[a-z0-9-_]+$`<br/> | no       |
| **description**             | `string`  | A detailed description of what this test case is testing.<br/>                                                                                                                        | no       |
| [**before**](#before)       | `array`   | An optional array of setup steps to be executed before the main test steps.<br/>                                                                                                      | no       |
| [**tests**](#tests)         | `array`   | The sequence of steps that constitute the core logic of the test case.<br/>                                                                                                           | yes      |
| [**after**](#after)         | `array`   | An optional array of teardown steps to be executed after the main test steps,<br/>                                                                                                    | no       |
| [**data**](#data)           | `object`  |                                                                                                                                                                                       | no       |
| [**selectors**](#selectors) | `object`  |                                                                                                                                                                                       | no       |
| **skip**                    | `boolean` | If true, this test case will be skipped during execution.<br/>Default: `false`<br/>                                                                                                   | no       |
| **timeout**                 | `integer` | The maximum time allowed for the test case to run, in milliseconds.<br/>A value of 0 means no timeout. This overrides any timeout set at the suite level.<br/>Minimum: `0`<br/>       | no       |
| **parentId**                | `string`  | The unique identifier of the parent test suite.<br/>Format: `"uuid"`<br/>                                                                                                             | yes      |
| [**meta**](#meta)           | `object`  | An object containing metadata for the test case.<br/>                                                                                                                                 | no       |

**Example**

```json
{
  "before": [
    {
      "runIf": {}
    }
  ],
  "steps": [
    {
      "runIf": {}
    }
  ],
  "after": [
    {
      "runIf": {}
    }
  ],
  "data": {},
  "selectors": {},
  "skip": false,
  "meta": {}
}
```

<a name="before"></a>

## before\[\]: array

An optional array of setup steps to be executed before the main test steps.

**Items**

**Example**

```json
[
  {
    "runIf": {}
  }
]
```

<a name="tests"></a>

## tests\[\]: array

The sequence of steps that constitute the core logic of the test case.

**Items**

**Example**

```json
[
  {
    "runIf": {}
  }
]
```

<a name="after"></a>

## after\[\]: array

An optional array of teardown steps to be executed after the main test steps,
regardless of whether the test passed or failed.

**Items**

**Example**

```json
[
  {
    "runIf": {}
  }
]
```

<a name="data"></a>

## data: object

**No properties.**

<a name="selectors"></a>

## selectors: object

**No properties.**

<a name="meta"></a>

## meta: object

An object containing metadata for the test case.

**Properties**

| Name                  | Type       | Description                                                   | Required |
| --------------------- | ---------- | ------------------------------------------------------------- | -------- |
| [**tags**](#metatags) | `string[]` | A list of tags for categorizing or filtering test cases.<br/> |          |

<a name="metatags"></a>

### meta\.tags\[\]: array

A list of tags for categorizing or filtering test cases.

**Items**

**Item Type:** `string`
