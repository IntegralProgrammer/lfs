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
import React from "react";
import PropTypes from "prop-types";
// @material-ui/core
import { Checkbox, FormControlLabel, IconButton, ListItem, withStyles, Typography, Radio } from "@material-ui/core"
import Close from "@material-ui/icons/Close"
import SelectorStyle from "./selectorStyle.jsx"

// Child element that will be inserted to the target DOM
class VocabularyEntry extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      checked: false,
    }
  }

  render() {
    const {classes, name, id, isPreselected, onClick, disabled, isRadio} = this.props;
    return (
      <React.Fragment>
        <ListItem key={name} className={classes.selectionChild}>
            { /* This is either a Checkbox if this is a suggestion, or a button otherwise */
            isPreselected ?
              (
                <FormControlLabel
                  control={
                    isRadio ?
                    (
                      <Radio
                        onChange={() => {onClick(id, name, this.state.checked);}}
                        disabled={!this.state.checked && disabled}
                        className={classes.checkbox}
                      />
                    ) :
                    (
                      <Checkbox
                        checked={this.state.checked}
                        onChange={() => {this.setState({checked: !this.state.checked}); onClick(id, name, this.state.checked);}}
                        disabled={!this.state.checked && disabled}
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

  toggleCheck = () => {
    this.setState({checked: !this.state.checked});
  }
};

VocabularyEntry.defaultProps = {
  isPreselected: false,
};

export default withStyles(SelectorStyle)(VocabularyEntry);
