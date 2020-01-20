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

import React, { useState } from "react";
import PropTypes from "prop-types";
import { Grid, Typography, withStyles } from "@material-ui/core";
import uuidv4 from "uuid/v4";

import FormEntry, { ENTRY_TYPES } from "./FormEntry";
import QuestionnaireStyle, { FORM_ENTRY_CONTAINER_PROPS } from "./QuestionnaireStyle";

// The heading levels that @material-ui supports
const MAX_HEADING_LEVEL = 6;
const MIN_HEADING_LEVEL = 3;

/**
 * Component responsible for displaying a (sub)section of a questionnaire, consisting of a title, a description,
 * a list of questions and/or subsections, and may have some conditions to its display.
 *
 * @example
 * <Section depth={1} path="." sectionDefinition={{label: "Section"}} />
 *
 * @param {int} depth the section nesting depth
 * @param {Object} existingAnswer form data that may include answers already submitted for this component
 * @param {string} path the path to the parent of the question
 * @param {Object} sectionDefinition the section definition JSON
 */
function Section(props) {
  const { classes, depth, existingAnswer, path, sectionDefinition } = props;
  const [sectionID] = useState((existingAnswer && existingAnswer[0]) || uuidv4());
  const sectionPath = path + "/" + sectionID;
  const headerVariant = (depth > MAX_HEADING_LEVEL - MIN_HEADING_LEVEL ? "body1" : ("h" + (depth+MIN_HEADING_LEVEL)));

  const titleEl = sectionDefinition["label"] && <Typography variant={headerVariant}>{sectionDefinition["label"]} </Typography>;
  const descEl = sectionDefinition["description"] && <Typography variant="caption" color="textSecondary">{sectionDefinition["description"]} </Typography>
  const hasHeader = titleEl || descEl;

  return (
    <Grid item className={hasHeader && classes.labeledSection}>
      <input type="hidden" name={`${sectionPath}/jcr:primaryType`} value={"lfs:AnswerSection"}></input>
      <input type="hidden" name={`${sectionPath}/section`} value={sectionDefinition['jcr:uuid']}></input>
      <input type="hidden" name={`${sectionPath}/section@TypeHint`} value="Reference"></input>

      <Grid container {...FORM_ENTRY_CONTAINER_PROPS}>
        {hasHeader &&
          <Grid item className={classes.sectionHeader}>
            {titleEl}
            {descEl}
          </Grid>
        }
        {Object.entries(sectionDefinition)
          .filter(([key, value]) => ENTRY_TYPES.includes(value['jcr:primaryType']))
          .map(([key, definition]) => FormEntry(definition, sectionPath, depth+1, existingAnswer && existingAnswer[1], key))
        }
      </Grid>
    </Grid>
  );
}

Section.propTypes = {
  classes: PropTypes.object.isRequired,
  depth: PropTypes.number.isRequired,
  existingAnswer: PropTypes.array,
  path: PropTypes.string.isRequired,
  sectionDefinition: PropTypes.shape({
    label: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
}

export default withStyles(QuestionnaireStyle)(Section);
