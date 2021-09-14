import React from "react";
import predicate from "predicate";
import Engine from "json-rules-engine-simplified";

function ArrayFieldWrapperTemplate({
  TitleField,
  DescriptionField,
  properties,
  title,
  description,
  schema
}) {
  return (
    <div className="row">
      {properties.map(prop => (
        <div key={prop.content.key}>{prop.content}</div>
      ))}
    </div>
  );
}

predicate.hasPayoutGroups = Merchant => {
  console.log("hasPayoutGroups called, Merchant:", Merchant);
  return (
    Merchant &&
    Merchant.SettlementBankAccounts &&
    Merchant.SettlementBankAccounts.length > 0 &&
    Merchant.SettlementBankAccounts.flatMap(sba =>
      sba.PayoutGroups ? sba.PayoutGroups : []
    ).length > 0
  );
};

let payoutGroupsIdCounter = 0;

const uiSchema = {
  Merchant: {
    SettlementBankAccounts: {
      items: {
        AccountValidity: { "ui:ObjectFieldTemplate": ArrayFieldWrapperTemplate }
      }
    }
  }
};
const conf = {
  schema: {
    type: "object",
    properties: {
      Merchant: {
        title: "Merchant",
        type: "object",
        additionalProperties: false,
        properties: {
          SettlementBankAccounts: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                SettlementBankAccountId: {
                  type: "string",
                  title: "Settlement Bank Account Id"
                },
                Iban: {
                  type: "string",
                  title: "Iban"
                },
                Bic: {
                  type: "string",
                  title: "Bic"
                },
                AccountValidity: {
                  title: "Account Validity",
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    From: {
                      type: "string",
                      format: "date",
                      title: "From"
                    }
                  }
                },
                PayoutGroups: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      id: {
                        type: "string",
                        title: "Id"
                      },
                      PayoutGroupName: {
                        type: "string",
                        title: "Payout Group Name"
                      },
                      SettlementCurrency: {
                        type: "string",
                        title: "Settlement Currency"
                      }
                    },
                    required: ["SettlementCurrency"]
                  },
                  title: "Payout Groups"
                }
              }
            },
            title: "Settlement Bank Accounts"
          },
          PayoutGroupRef: {
            title: "Payout Group Ref",
            type: "object",
            additionalProperties: false,
            properties: {
              refId: {
                type: "string",
                title: "Payout Group Ref-Id",
                anyOf: [
                  {
                    type: "string",
                    title: "",
                    enum: [""]
                  }
                ]
              }
            }
          }
        }
      }
    }
  },
  uiSchema: uiSchema,
  rules: [
    {
      conditions: {
        Merchant: "hasPayoutGroups"
      },
      event: [
        {
          type: "enrichPayoutGroups",
          params: {}
        },
        {
          type: "enrichPayoutGroupRef",
          params: {}
        }
      ]
    }
  ],
  extraActions: {
    enrichPayoutGroups: function(params, schema, uiSchema, formData) {
      console.log(
        "enrichPayoutGroups called",
        params,
        schema,
        uiSchema,
        formData
      );
      formData.Merchant.SettlementBankAccounts.forEach(function(sba) {
        if (sba.PayoutGroups) {
          sba.PayoutGroups.forEach(function(pg) {
            if (!pg.id) {
              pg.id = "PG-" + ++payoutGroupsIdCounter;
            }
            const newPayoutGroupName =
              /*pg.id + "-" +*/ sba.Iban + "-" + pg.SettlementCurrency;
            if (
              !pg.PayoutGroupName ||
              !pg.PayoutGroupName.includes(newPayoutGroupName)
            ) {
              pg.PayoutGroupName = newPayoutGroupName;
            }
          });
        }
      });
    },
    enrichPayoutGroupRef: function(params, schema, uiSchema, formData) {
      console.log(
        "enrichPayoutGroupRef called",
        params,
        schema,
        uiSchema,
        formData
      );
      schema.properties.Merchant.properties.PayoutGroupRef.properties.refId.anyOf = formData.Merchant.SettlementBankAccounts.flatMap(
        sba => (sba.PayoutGroups ? sba.PayoutGroups : [])
      ).map(function(pg) {
        return {
          type: "string",
          title: pg.PayoutGroupName,
          enum: [pg.id]
        };
      });
    }
  },
  rulesEngine: Engine,
  formData: {
    Merchant: {
      SettlementBankAccounts: [
        {
          SettlementBankAccountId: "SBA-1",
          Iban: "DE1234567890001",
          Bic: "DEMCVWXXX",
          PayoutGroups: [
            {
              id: "",
              PayoutGroupName: "",
              SettlementCurrency: "EUR"
            },
            {
              id: "",
              PayoutGroupName: "",
              SettlementCurrency: "USD"
            }
          ]
        },
        {
          SettlementBankAccountId: "SBA-2",
          Iban: "DE1234567890002",
          Bic: "DEMCVWXXX",
          PayoutGroups: [
            {
              id: "",
              PayoutGroupName: "",
              SettlementCurrency: "EUR"
            },
            {
              id: "",
              PayoutGroupName: "",
              SettlementCurrency: "USD"
            }
          ]
        }
      ]
    }
  }
};

export default conf;
