import React from "react";
import Form from "@rjsf/core";
import applyRules from "../../src/applyRules";
import conf from "./conf/dynamicSelectBoxes.js";

let { schema, uiSchema, rules, rulesEngine, extraActions, formData } = conf;

let FormToDisplay = applyRules(
  schema,
  uiSchema,
  rules,
  rulesEngine,
  extraActions
)(Form);

let formRef;
const onSubmit = formData => {
  console.log("Data submitted: ", formData);
  console.log("Form Ref: ", formRef);
};
const onChange = formData => {
  console.log("Data changed: ", formData);
  console.log("Form Ref: ", formRef);
};
const onFormReference = form => {
  formRef = form;
  console.log("Form Reference: ", form);
};
function submitForm() {
  console.log("Submit form...");
  formRef && formRef.submit();
}
export default function() {
  return (
    <div>
      <FormToDisplay
        formData={formData}
        onSubmit={onSubmit}
        onChange={onChange}
        ref={onFormReference}
      ></FormToDisplay>
      <button className="btn btn-info" onClick={submitForm}>
        CUSTOM SUBMIT
      </button>
    </div>
  );
}
