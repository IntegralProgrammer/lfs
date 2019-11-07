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

import { withStyles } from "@material-ui/core";

import PropTypes from "prop-types";

import MultipleChoice from "./MultipleChoice";
import Question from "./Question";
import QuestionnaireStyle from "./QuestionnaireStyle";

import AnswerComponentManager from "./AnswerComponentManager";
//import VocabularySelector from "VocabularyThesaurus";

// Component that renders a vocabulary question.
// Selected answers are placed in a series of <input type="hidden"> tags for
// submission.
//
// Optional arguments:
//  text: String containing the question to ask
//  enableUnknown: Boolean denoting whether an unknown option should be allowed
//  yesLabel: String containing the label for 'true'
//  noLabel: String containing the label for 'false'
//  unknownLabel: String containing the label for 'undefined'
//
// Sample usage:
//
// <VocabularyQuestion
//   text="Has the patient checked in on time?"
//   />
// <VocabularyQuestion
//   text="Has the patient eaten breakfast?"
//   enableUnknown
//   />
function VocabularyQuestion(props) {
  let { errorText, ...rest } = props;
  let { maxAnswers, suggestionCategories } = {...props.questionDefinition, ...props};
  let defaults = props.defaults || Object.values(props.questionDefinition)
    // Keep only answer options
    // FIXME Must deal with nested options, do this recursively
    .filter(value => value['jcr:primaryType'] == 'lfs:AnswerOption')
    // Only extract the labels and internal values from the node
    .map(value => [value.label || value.value, value.value, true]);

  return (
    <Question
      {...rest}
      >
      {/*<VocabularySelector
        suggestionCategories = {suggestionCategories}
        source = "hpo"
        max={maxAnswers}
        defaultSuggestions={defaults}
        {...rest}
      />*/}
    </Question>);
}

VocabularyQuestion.propTypes = {
  classes: PropTypes.object.isRequired,
  questionDefinition: PropTypes.shape({
    text: PropTypes.string.isRequired,
  }).isRequired,
  text: PropTypes.string,
  source: PropTypes.string
};

VocabularyQuestion.defaultProps = {
  source: "hpo"
};

const StyledVocabularyQuestion = withStyles(QuestionnaireStyle)(VocabularyQuestion)
export default StyledVocabularyQuestion;

AnswerComponentManager.registerAnswerComponent((questionDefinition) => {
  if (questionDefinition.dataType === "vocabulary") {
    return [StyledVocabularyQuestion, 50];
  }
});
