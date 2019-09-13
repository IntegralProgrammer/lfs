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

import React, { useState, useEffect } from 'react';

import { Checkbox, FormControlLabel, IconButton, List, ListItem, Radio, RadioGroup, Typography, withStyles } from "@material-ui/core";

import Answer from "./Answer";
import QuestionnaireStyle from "./QuestionnaireStyle.jsx";

const NAME_POS = 0;
const ID_POS = 1;
const IS_DEFAULT_POS = 2;

function ResponseChild(props) {
  const {classes, name, id, isDefault, onClick, disabled, isRadio} = props;
  const [checked, setCheck] = useState(false);

  return (
    <React.Fragment>
      <ListItem key={name} className={classes.selectionChild}>
          { /* This is either a Checkbox if this is a default suggestion, or a delete button otherwise */
          isDefault ?
            (
              <FormControlLabel
                control={
                  isRadio ?
                  (
                    <Radio
                      onChange={() => {onClick(id, name, checked);}}
                      disabled={!checked && disabled}
                      className={classes.checkbox}
                    />
                  ) :
                  (
                    <Checkbox
                      checked={checked}
                      onChange={() => {setCheck(!checked); onClick(id, name, checked);}}
                      disabled={!checked && disabled}
                      className={classes.checkbox}
                    />
                  )
                }
                label={name}
                value={id}
                className={classes.childFormControl}
                classes={{
                  label: classes.inputLabel
                }}
              />
            ) : (
            <React.Fragment>
              <IconButton
                onClick={() => {onClick(id, name)}}
                className={classes.deleteButton}
                color="secondary"
                title="Delete"
              >
                <Close color="action" className={classes.deleteIcon}/>
              </IconButton>
              <div className={classes.inputLabel}>
                <Typography>
                  {name}
                </Typography>
              </div>
            </React.Fragment>
          )
          }
      </ListItem>
    </React.Fragment>
  );
}

var StyledResponseChild = withStyles(QuestionnaireStyle)(ResponseChild);

function generateDefaultOptions(defaults, disabled, isRadio, onClick) {
  return defaults.map( (childData) => {
    return (
      <StyledResponseChild
        id={childData[ID_POS]}
        key={childData[ID_POS]}
        name={childData[NAME_POS]}
        disabled={disabled}
        onClick={onClick}
        isDefault={childData[IS_DEFAULT_POS]}
        isRadio={isRadio}
      ></StyledResponseChild>
    );
  });
}

function MultipleChoice(props) {
  let { classes, ghostAnchor, max, defaults, ...rest } = props;
  const [selection, setSelection] = useState([["", ""]]);
  const [ghostName, setGhostName] = useState("&nbsp;");
  const [ghostValue, setGhostValue] = useState("");
  const [options, setOptions] = useState([]);
  const ghostSelected = ghostName === selection;
  const isRadio = max === 1;
  const disabled = selection.length >= max && !isRadio;

  // Convert our defaults into a list of useable options
  useEffect( () => {
    let newOptions = [];
    for (let id in defaults) {
      if (typeof defaults[id] !== "undefined") {
        newOptions.push([id, defaults[id], true]);
      } else {
        newOptions.push([id, id, false]);
      }
    }
    setOptions(newOptions);
  });

  let selectOption = (id, name) => {
    if (isRadio) {
      setSelection([[name, id]]);
      return;
    }

    // Do not add anything if we are at our maximum number of selections
    if (selection.length >= max) {
      return;
    }

    // Do not add duplicates
    if (options.some(element => {return element[ID_POS] === id})) {
      return;
    }

    let newSelection = selection.slice();
    newSelection.push([name, id]);
    setSelection(newSelection);
  }

  if (isRadio) {
    return (
      <Answer
        answers={selection}
        {...rest}
        >
        <RadioGroup
          aria-label="selection"
          name="selection"
          className={classes.selectionList}
          value={selection[0][ID_POS]}
        >
          {generateDefaultOptions(options, disabled, isRadio, selectOption)}
          {/* Ghost radio for the text input */}
          <ListItem key={name} className={classes.selectionChild}>
            <FormControlLabel
              control={
              <Radio
                onChange={() => {setSelection([[ghostName, ghostValue]]);}}
                onClick={() => {ghostAnchor && ghostAnchor.select(); setSelection([[ghostName, ghostValue]]);}}
                disabled={!ghostSelected && disabled}
                className={classes.ghostRadiobox}
              />
              }
              label="&nbsp;"
              name={ghostName}
              value={ghostValue}
              key={ghostValue}
              className={classes.ghostFormControl + " " + classes.childFormControl}
              classes={{
                label: classes.inputLabel
              }}
            />
          </ListItem>
        </RadioGroup>
      </Answer>
    );
  } else {
    return (
      <Answer
        answers={selection}
        {...rest}
        >
        <List className={classes.selectionList}>
          {generateDefaultOptions(options, disabled, isRadio, selectOption)}
        </List>
      </Answer>
    )
  }
}

export default withStyles(QuestionnaireStyle)(MultipleChoice);