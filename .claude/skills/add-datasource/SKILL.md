# Skill: add-datasource

Integrate a new data source at the widget level.

## Usage
```
/add-datasource <name> <type>
```

## What this skill does
1. Creates a data source adapter scoped to a specific widget
2. Adds the schema/config definition alongside the widget
3. Makes the data source available to the generator for that widget's prompt context

## Example
```
/add-datasource stripe rest
/add-datasource postgres sql
```

## Output
- `src/components/dynamic/<Widget>/datasource.<name>.ts`
- `src/components/dynamic/<Widget>/schema.<name>.ts`
