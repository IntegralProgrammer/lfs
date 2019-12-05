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
import PropTypes from 'prop-types';
import {
    Avatar,
    Button,
    FormControl,
    IconButton,
    Input,
    InputAdornment,
    InputLabel,
    Paper,
    Tooltip,
    Typography,
    withStyles
} from '@material-ui/core';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import styles from "../styling/styles";

class SignIn extends React.Component {
  constructor(props, selfContained) {
    super(props);

    this.state = {
      passwordIsMasked: false,
      failedLogin: false,

      username: "",
      password: ""
    };
  }

  loginRedirectPath() {
    const currentPath = window.location.pathname.startsWith("/login") ? "/" : window.location.pathname;
    return new URLSearchParams(window.location.search).get("resource") || currentPath;
  };

  loginValidationPOSTPath() {
    return "/j_security_check";
  };

  togglePasswordMask = () => {
    this.setState(prevState => ({
      passwordIsMasked: !prevState.passwordIsMasked,
    }));
  }

  submitLogin() {
    fetch('/j_security_check',
      {
        method: 'POST',
        body: new URLSearchParams({
          "j_username": this.state.username,
          "j_password": this.state.password,
          "j_validate": true
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )
    .then((response) => {
      if (!response.ok) {
        throw Error(response.statusText);
      }
      this.setState({failedLogin: false});
      window.location = this.loginRedirectPath();
    })
    .catch((error) => {
      this.setState({failedLogin: true});
    });
  }

  render() {
    const { classes, selfContained } = this.props;
    const { passwordIsMasked } = this.state;

    return (
        <div className={classes.main}>
          <Paper elevation={1} className={`${classes.paper} ${selfContained ? classes.selfContained : ''}`}>
            <Typography component="h1" variant="overline">
              LFS Data Core
            </Typography>
            <Typography component="h2" variant="h5">
              Sign In
            </Typography>
            <Avatar className={classes.avatar}>
              <ExitToAppIcon />
            </Avatar>
            {this.state.failedLogin && <Typography component="h2" className={classes.errorMessage}>Invalid username or password</Typography>}

            <form className={classes.form} onSubmit={(event)=>{event.preventDefault(); this.submitLogin();}} >

              <FormControl margin="normal" required fullWidth>
                <InputLabel htmlFor="j_username">Username</InputLabel>
                <Input id="j_username" name="j_username" autoComplete="email" autoFocus onChange={(event) => {this.setState({username: event.target.value});}}/>
              </FormControl>

              <FormControl margin="normal" required fullWidth>
                <InputLabel htmlFor="j_password">Password</InputLabel>
                <Input name="j_password" type={this.state.passwordIsMasked ? 'text' : 'password'} id="j_password" autoComplete="current-password" onChange={(event) => {this.setState({password: event.target.value});}}
                  endAdornment={
                  <InputAdornment position="end">
                    <Tooltip title={this.state.passwordIsMasked ? "Mask Password" : "Show Password"}>
                      <IconButton
                        aria-label="Toggle password visibility"
                        onClick={this.togglePasswordMask}
                      >
                        {this.state.passwordIsMasked ? <VisibilityIcon/> : <VisibilityOffIcon/>}
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                }
              />
              </FormControl>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
              >
                Sign in
              </Button>
            </form>
            <Typography>Don't have an account?</Typography>
            <Button
              fullWidth
              color="default"
              onClick={this.props.swapForm}
            >
              <PersonAddIcon/> Request an account
            </Button>
          </Paper>
        </div>
    );
  }
}

SignIn.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SignIn);
