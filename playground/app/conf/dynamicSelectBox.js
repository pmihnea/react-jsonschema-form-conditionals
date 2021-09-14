import Engine from "json-rules-engine-simplified";

const conf = {
  schema: {
    type: "object",
    properties: {
      oxygen: {
        type: "array",
        title: "Values",
        items: {
          type: "string"
        }
      },
      oxygenLabels: {
        type: "array",
        title: "Labels",
        items: {
          type: "string"
        }
      },
      testSelect: {
        type: "string",
        title: "Select values with enumNames",
        enum: [],
        enumNames: []
      },
      testSelectWithAnyOf: {
        type: "number",
        title: "Select values with anyOf",
        anyOf: [
          {
            type: "string",
            title: "",
            enum: [""]
          }
        ]
      }
    }
  },
  uiSchema: {},
  rules: [
    {
      conditions: {
        oxygen: { not: "empty" },
        oxygenLabels: { not: "empty" }
      },
      event: {
        type: "enrichSelect",
        params: { field: "testSelect" }
      }
    }
  ],
  extraActions: {
    enrichSelect: function({ field }, schema, uiSchema, formData) {
      let keys = schema.properties.testSelect.enum;
      let values = schema.properties.testSelect.enumNames;

      let mergedKeys = [...keys, ...formData.oxygen];
      let mergedValues = [...values, ...formData.oxygenLabels];

      console.log("Merged Keys", mergedKeys);
      console.log("Merged Values", mergedValues);

      schema.properties.testSelect.enum = mergedKeys;
      schema.properties.testSelect.enumNames = mergedValues;

      schema.properties.testSelectWithAnyOf.anyOf = formData.oxygen.map(
        function(key, index) {
          return {
            type: "string",
            title: formData.oxygenLabels[index],
            enum: [key]
          };
        }
      );

      console.log("Initial FormData", formData);

      if (!formData.oxygen.includes(formData.testSelect)) {
        delete formData.testSelect;
      }

      if (!formData.oxygen.includes(formData.testSelectWithAnyOf)) {
        delete formData.testSelectWithAnyOf;
      }

      console.log("Final FormData", formData);
    }
  },
  rulesEngine: Engine,
  formData: {
    oxygen: ["V1", "V2", "V3"],
    oxygenLabels: ["L1", "L2", "L3"],
    testSelect: "V1",
    testSelectWithAnyOf: "V2"
  }
};

export default conf;
