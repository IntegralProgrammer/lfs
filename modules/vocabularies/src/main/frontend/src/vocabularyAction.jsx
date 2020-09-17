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

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  List, ListItem, ListItemText, 
  makeStyles,
  Typography,
  Tooltip
} from "@material-ui/core";

const Phase = require("./phaseCodes.json");

const useStyles = makeStyles(theme => ({
  vocabularyAction: {
    margin: theme.spacing(1),
    textTransform: "none"
  },
  buttonProgress: {
    top: "50%",
    left: "50%",
    position: "absolute",
    marginTop: -12,
    marginLeft: -12,
    textTransform: "none"
  },
  install: {
    background: theme.palette.success.main,
    color: theme.palette.success.contrastText,
    "&:hover": {
      background: theme.palette.success.dark
    }
  },
  uninstall: {
    background: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    "&:hover": {
      background: theme.palette.error.dark
    }
  },
  installingColor: {
    color: theme.palette.success.main
  },
  uninstallingColor: {
    color: theme.palette.error.main
  },
  update: {
    background: theme.palette.warning.main,
    color: theme.palette.warning.contrastText,
    "&:hover": {
      background: theme.palette.warning.dark
    }
  },
  wrapper: {
    position: "relative",
    display: "inline-block"
  }
}));

export default function VocabularyAction(props) {
  const classes = useStyles();
  const [displayPopup, setDisplayPopup] = React.useState(false);
  const [linkedQuestions, setLinkedQuestions] = useState([]);
  const [questionnaires, setQuestionnaires] = useState([]);
  const handleOpen = () => {fetchQuestionnaires();}
  const handleClose = () => {setDisplayPopup(false);}
  const handleUninstall = () => {setDisplayPopup(false); props.uninstall();}

  let fetchQuestionnaires = () => {
    if (questionnaires.length === 0) {
      // Send a fetch request to determine the questionnaires available
      const query = `select n.* from [lfs:Questionnaire] as n inner join [lfs:Question] as q on isdescendantnode(q, n) where contains(q.sourceVocabularies, '${props.acronym}')`;
      fetch(`/query?query=${encodeURIComponent(query)}&limit=100`)
        .then((response) => response.ok ? response.json() : Promise.reject(response))
        .then((json) => {
          setQuestionnaires(json["rows"]);
          fetchData(json["rows"]);
        })
        .catch(function(err) {
	      console.log("Something went wrong: " + err);
	      // We were unable to fetch any questionnaire data possibly due to timeout in user authentication
	      // thus, we have to abort uninstalling process
	      return;
	    });
    } else {
      fetchData(questionnaires);
    }
  };

  let fetchData = (questionnairesData) => {
    if (questionnairesData.length == 0) {
      setDisplayPopup(true);
    } else {
      setLinkedQuestions([]);
      let aggregatedQuestions = [];
      let i = 0;
      questionnairesData.forEach( (questionnaire) => {
        fetch(`${questionnaire["@path"]}.deep.json`)
          .then((response) => response.ok ? response.json() : Promise.reject(response))
          .then((data) => {
            aggregatedQuestions = aggregatedQuestions.concat(getVocabularyQuestions(data, questionnaire.title));
          })
          .finally(() => {
            if (++i == questionnairesData.length) {
              setLinkedQuestions(aggregatedQuestions);
              setDisplayPopup(true);
            }
          });
      });
    }
  };

  let getVocabularyQuestions = (data, title) => {
    let vocQuestions = [];

    data && Object.entries(data)
      .forEach( ([key, value]) => {
        if (value["jcr:primaryType"] == "lfs:Question" && value['dataType'] == 'vocabulary' && value['sourceVocabularies'].includes(props.acronym)) {
          value.questionnaireName = title;
          vocQuestions.push(value);
        }
        if (value["jcr:primaryType"] == "lfs:Section") {
            vocQuestions = vocQuestions.concat(getVocabularyQuestions(value, title));
        }
      });

      return vocQuestions;
  }

  return(
    <React.Fragment>
    {(props.phase == Phase["Not Installed"]) && (
      <Tooltip title="Install this vocabulary">
        <Button onClick={props.install} variant="contained" className={classes.vocabularyAction + " " + classes.install}>Install</Button>
      </Tooltip>
    )}
    {(props.phase == Phase["Installing"]) && (
      <span className={classes.wrapper}>
        <Button disabled variant="contained" className={classes.vocabularyAction}>Installing</Button>
        <CircularProgress size={24} className={classes.buttonProgress + " " + classes.installingColor} />
      </span>
    )}
    {(props.phase == Phase["Update Available"]) && (
      <React.Fragment>
        <Tooltip title="Update this vocabulary">
          <Button onClick={props.install} variant="contained" className={classes.vocabularyAction + " " + classes.update}>Update</Button>
        </Tooltip>
        <Tooltip title="Remove this vocabulary">
          <Button onClick={props.uninstall} variant="contained" className={classes.vocabularyAction + " " + classes.uninstall}>Uninstall</Button>
        </Tooltip>
      </React.Fragment> 
    )}
    {(props.phase == Phase["Uninstalling"]) && (
      <span className={classes.wrapper}>
        <Button disabled variant="contained" className={classes.vocabularyAction}>Uninstalling</Button>
        <CircularProgress size={24} className={classes.buttonProgress + " " + classes.uninstallingColor} />
      </span>
    )}
    {(props.phase == Phase["Latest"]) && (
      <Tooltip title="Remove this vocabulary">
        <Button onClick={handleOpen} variant="contained" className={classes.vocabularyAction + " " + classes.uninstall}>Uninstall</Button>
      </Tooltip>
    )}
    {props.exit && (
      <Tooltip title="Close">
        <Button onClick={props.exit} variant="contained" color="default" className={classes.vocabularyAction}>Close</Button>
      </Tooltip>
    )}
    <Dialog onClose={handleClose} open={displayPopup}>

      <DialogTitle disableTypography>
        <Typography variant="h4" className={classes.dialogTitle}>{props.acronym}</Typography>
      </DialogTitle>

      <DialogContent dividers>
        {(linkedQuestions.length > 0) && (
          <span className={classes.wrapper}>
          <Typography variant="body1">The following variables are linked to this vocabulary:</Typography>
          <ul>
            {linkedQuestions.map((question) => {
              return (
                <li key={question["jcr:uuid"]}>
                  <ListItemText primary={question.text + " (" + question.questionnaireName + ")"}>
                  </ListItemText>
                </li>
              );
            })}
          </ul>
          </span>
        )}
        {(linkedQuestions.length == 0) && (
          <Typography variant="body1">No variables are linked to this vocabulary.</Typography>
        )}

        <Typography variant="h6">{props.name}</Typography>
        <Typography variant="body1">Uninstalling this vocabulary may result in data not being properly standardized. Proceed?</Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleUninstall} variant="contained" color="primary" className={classes.vocabularyAction + " " + classes.uninstall}>Uninstall</Button>
        <Button onClick={handleClose} variant="contained" color="default" className={classes.vocabularyAction}>Cancel</Button>
      </DialogActions>

    </Dialog>
    </React.Fragment>
  );
}
