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

import ExtensionPoint from "./extensionPoint.jsx";

export default function TestRig(props) {
  let [ jsonData, setJsonData ] = useState();
  return(
    <React.Fragment>
      { /* Succeeds at evaluating a .js extension point */}
      <ExtensionPoint
        path="lfs/TestUI/JS"
        />
      { /* Succeeds at rendering a .html extension point */}
      <ExtensionPoint
        path="lfs/TestUI/HTML"
        />
      { /* Succeeds at evaluating a .json extension point */}
      <ExtensionPoint
        path="lfs/coreUI/sidebar/entry"
        callback={(test) => {console.log(test); setJsonData(JSON.stringify(test));}}
        />
      JSON Data:
      {jsonData}
    </React.Fragment>
  )
}
