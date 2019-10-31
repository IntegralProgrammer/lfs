//
//  Licensed to the Apache Software Foundation (ASF) under one
//  or more contributor license agreements.  See the NOTICE file
//  distributed with this work for additional information
//  regarding copyright ownership.  The ASF licenses this file
//  to you under the Apache License, Version 2.0 (the
//  "License"); you may not use this file except in compliance
//  with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing,
//  software distributed under the License is distributed on an
//  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
//  KIND, either express or implied.  See the License for the
//  specific language governing permissions and limitations
//  under the License.
//

import { useState } from "react";

import { TextField, Typography, withStyles } from "@material-ui/core";
import NumberFormat from 'react-number-format';

import PropTypes from "prop-types";

import Answer from "./Answer";
import Question from "./Question";
import QuestionnaireStyle from "./QuestionnaireStyle";
import MultipleChoice from "./MultipleChoice";

import AnswerComponentManager from "./AnswerComponentManager";

// Component that renders a multiple choice question, with optional number input.
// Selected answers are placed in a series of <input type="hidden"> tags for
// submission.
//
// Optional props:
//  max: Integer denoting maximum number of options that may be selected
//  min: Integer denoting minimum number of options that may be selected
//  name: String containing the question to ask
//  defaults: Array of objects, each with an "id" representing internal ID
//            and a "value" denoting what will be displayed
//  userInput: Either "input", "textbox", or undefined denoting the type of
//             user input. Currently, only "input" is supported
//  maxValue: The maximum allowed input value
//  minValue: The minimum allowed input value
//  type: One of "integer" or "float" (default: "float")
//  errorText: String to display when the input is not valid (default: "invalid input")
//  isRange: Whether or not to display a range instead of a single value
//
// Sample usage:
// <NumberQuestion
//    name="Please enter the patient's age"
//    defaults={[
//      {"id": "<18", "label": "<18"}
//    ]}
//    max={1}
//    minValue={18}
//    type="integer"
//    errorText="Please enter an age above 18, or select the <18 option"
//    />
function NumberQuestion(props) {
  let {defaults, max, min, name, userInput, minValue, maxValue, type, errorText, isRange, classes, ...rest} = props;
  const [error, setError] = useState(false);
  // The following two are only used if a default is not given, as we switch to handling values here
  const [input, setInput] = useState(undefined);
  const [endInput, setEndInput] = useState(undefined);

  // Callback function for our min/max
  let hasError = (text) => {
    let value = 0;

    if (typeof(text) === "undefined") {
      // The custom input has been unset
      return false;
    }

    if (type === "integer") {
      // Test that it is an integer
      if (!/^[-+]?\d*$/.test(text)) {
        return true;
      }

      value = parseInt(text);
    } else if (type === "float") {
      value = Number(text);

      // Reject whitespace and non-numbers
      if (/^\s*$/.test(text) || isNaN(value)) {
        return true;
      }
    }

    // Test that it is within our min/max (if they are defined)
    if ((typeof minValue !== 'undefined' && value < minValue) ||
      (typeof maxValue !== 'undefined' && value > maxValue)) {
      return true;
    }

    return false;
  }

  // Callback for a change of MultipleChoice input to check for errors on the input
  let findError = (text) => {
    setError(hasError(text));
  }

  // Callback for a range input to check for errors on our self-stated input
  let findRangeError = (inputToCheck, endInputToCheck) => {
    if (hasError(inputToCheck)) {
      setError(true);
      return;
    }

    // Also consider the end of the range (if applicable)
    if (isRange && (hasError(endInputToCheck) ||
      Number(inputToCheck) > Number(endInputToCheck))) {
        setError(true);
        return;
    }

    setError(false);
  }

  const answers = isRange ? [["start", input], ["end", endInput]] : [["start", input]];
  const textFieldProps = {
    min: minValue,
    max: maxValue,
    allowNegative: (typeof minValue === "undefined" || minValue < 0),
    decimalScale: type === "integer" ? 0 : undefined
  };
  const muiInputProps = {
    inputComponent: NumberFormatCustom, // Used to override a TextField's type
    className: classes.textField
  };

  return (
    <Question
      text={name}
      >
      {error && <Typography color='error'>{errorText}</Typography>}
      {defaults ?
      /* Use MultipleChoice if we have default options */
      <MultipleChoice
        max={max}
        min={min}
        defaults={defaults}
        input={userInput==="input"}
        textbox={userInput==="textbox"}
        onChange={findError}
        additionalInputProps={textFieldProps}
        muiInputProps={muiInputProps}
        error={error}
        {...rest}
        /> :
      /* Otherwise just use a single text field */
      <React.Fragment>
        <Answer
          answers={answers}
          {...rest}
          />
        <TextField
          className={classes.textField + " " + classes.answerField}
          onChange={(event) => {
            findRangeError(event.target.value, endInput);
            setInput(event.target.value);
          }}
          inputProps={textFieldProps}
          value={input}
          InputProps={muiInputProps}
          />
      </React.Fragment>
        }
      {isRange &&
      <React.Fragment>
        <span className={classes.mdash}>&mdash;</span>
        <TextField
          className={classes.textField}
          onChange={(event) => {
            findRangeError(input, event.target.value);
            setEndInput(event.target.value);
          }}
          inputProps={textFieldProps}
          value={endInput}
          InputProps={muiInputProps}
          />
      </React.Fragment>
      }
    </Question>);
}

// Helper function to bridge react-number-format with @material-ui
function NumberFormatCustom(props) {
  const { inputRef, onChange, ...other } = props;

  return (
    <NumberFormat
      {...other}
      getInputRef={inputRef}
      onValueChange={values => {
        onChange({
          target: {
            value: values.value,
          },
        });
      }}
    />
  );
}

NumberFormatCustom.propTypes = {
  inputRef: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};

NumberQuestion.propTypes = {
  classes: PropTypes.object.isRequired,
  name: PropTypes.string,
  min: PropTypes.number,
  max: PropTypes.number,
  defaults: PropTypes.array,
  userInput: PropTypes.oneOf([undefined, "input", "textbox"]),
  type: PropTypes.oneOf(['integer', 'float']).isRequired,
  minValue: PropTypes.number,
  maxValue: PropTypes.number,
  errorText: PropTypes.string,
  isRange: PropTypes.bool,
};

NumberQuestion.defaultProps = {
  errorText: "Invalid input",
  type: 'float',
  isRange: false
};

const StyledNumberQuestion = withStyles(QuestionnaireStyle)(NumberQuestion)
export default StyledNumberQuestion;

AnswerComponentManager.registerAnswerComponent((questionDefinition) => {
  if (["long", "double", "decimal"].includes(questionDefinition.dataType)) {
    return [StyledNumberQuestion, 50];
  }
});
