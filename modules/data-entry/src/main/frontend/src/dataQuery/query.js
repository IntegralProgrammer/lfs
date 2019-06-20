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
import React from 'react';
import ReactDOM from 'react-dom';
import { Button, Card, CardActions, CardContent, CardMedia, Grid, Typography, withStyles } from '@material-ui/core';

const styles = theme => ({
  appBar: {
    position: 'relative',
  },
  icon: {
    marginRight: theme.spacing(2),
  },
  heroUnit: {
    backgroundColor: theme.palette.background.paper,
  },
  mainContent: {
    maxWidth: 600,
    margin: '0 auto',
    padding: `${theme.spacing(8)}px 0 ${theme.spacing(6)}px`,
  },
  heroButtons: {
    marginTop: theme.spacing(4),
  },
  layout: {
    width: 'auto',
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3),
    [theme.breakpoints.up(1100 + theme.spacing(6))]: {
      width: 1100,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    padding: `${theme.spacing(8)}px 0`,
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '400',
  },
  cardMedia: {
    paddingTop: '56.25%', // 16:9
    objectFit: 'cover',
    flexDirection: 'column',
  },
  cardContent: {
    flexGrow: 1,
  },
});

{/* Component for dataView cards */}
function DataViewCard(props) {
  const { classes } = props;

  return (
    <React.Fragment>
      <Grid item sm={6} md={4} lg={3}>
        <Card className={classes.card}>
          <CardMedia
            className={classes.cardMedia}
            image="data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22288%22%20height%3D%22225%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20288%20225%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_164edaf95ee%20text%20%7B%20fill%3A%23eceeef%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A14pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_164edaf95ee%22%3E%3Crect%20width%3D%22288%22%20height%3D%22225%22%20fill%3D%22%2355595c%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2296.32500076293945%22%20y%3D%22118.8%22%3EThumbnail%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E" // eslint-disable-line max-len
            title="Image title"
          />
          <CardContent className={classes.cardContent}>
            <Typography gutterBottom variant="h5" component="h2">
              {props.dataName}
            </Typography>
            <Typography>
              {props.dataProps}
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small" color="primary">
              View
            </Button>
            <Button size="small" color="primary">
              Edit
            </Button>
          </CardActions>
        </Card>
      </Grid>
    </React.Fragment>
  );
}

const DataViewCardComponent = withStyles(styles)(DataViewCard);

{/* Functional component without state. Fine for homepage */}
function HomePage(props) {
  const { classes } = props;

  const items = props.elements.split(",");
  const components = items.map(cardData => {
    var cardDataList = cardData.split("|");
    return <DataViewCardComponent key={cardDataList[0]} dataName={cardDataList[0]} dataProps={cardDataList[1]} />;
    });

  return (
    <div className={classes.layout}>
      <Grid container spacing={5}>
        {components}
      </Grid>
    </div>
  );
}

// export default withStyles(styles)(Album);
const HomePageComponent = withStyles(styles)(HomePage);

// ReactDOM.render(HomePageComponent, document.getElementById('query_display'));
const element = document.querySelector('#querydisplay');
ReactDOM.render(<HomePageComponent elements={element.getAttribute('elements')}/>, element);
