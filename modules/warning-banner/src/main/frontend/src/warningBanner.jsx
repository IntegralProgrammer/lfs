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
  AppBar,
  withStyles,
  IconButton,
  Toolbar,
  Typography
} from '@material-ui/core';

import WarningIcon from '@material-ui/icons/Warning';

export default function WarningBanner() {
  const StyledAppBar = withStyles({
    root: {
      background: "#FFA500"
    }
  })(AppBar);

  return (
    <StyledAppBar position="sticky">
      <Toolbar>
        <IconButton edge="start" color="inherit">
          <WarningIcon fontsize="large"/>
        </IconButton>
        <Typography variant="h6">
          This installation is for demo purposes only.
          Data entered here can be accessed by anyone and is
          periodically deleted. Do not enter any real
          data / patient identifiable information.
        </Typography>
      </Toolbar>
    </StyledAppBar>
  );
}
