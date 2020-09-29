/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
package ca.sickkids.ccm.lfs.internal;

import java.util.Collections;
import java.util.Iterator;
import java.util.List;

import javax.json.JsonObject;

import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ResourceResolver;
import org.osgi.service.component.annotations.Component;

import ca.sickkids.ccm.lfs.spi.QuickSearchEngine;
import ca.sickkids.ccm.lfs.spi.SearchUtils;


/**
 * Finds {@code [lfs:Subject]}s with identifiers matching the given full text search.
 *
 * @version $Id$
 */
@Component(immediate = true)
public class SubjectQuickSearchEngine implements QuickSearchEngine
{
    private static final List<String> SUPPORTED_TYPES = Collections.singletonList("lfs:Subject");

    @Override
    public List<String> getSupportedTypes()
    {
        return SUPPORTED_TYPES;
    }

    @Override
    public void quickSearch(final String query, final long maxResults, final boolean showTotalRows,
        final ResourceResolver resourceResolver, final List<JsonObject> output)
    {
        final StringBuilder xpathQuery = new StringBuilder();
        xpathQuery.append("/jcr:root/Subjects//*[jcr:like(fn:lower-case(@identifier),'%");
        xpathQuery.append(SearchUtils.escapeLikeText(query.toLowerCase()));
        xpathQuery.append("%')]");

        Iterator<Resource> foundResources = resourceResolver.findResources(xpathQuery.toString(), "xpath");

        while (foundResources.hasNext()) {
            // no need to go through all results list if we do not add total results number
            if (output.size() == maxResults && !showTotalRows) {
                break;
            }
            Resource thisResource = foundResources.next();

            String resourceValue = thisResource.getValueMap().get("identifier", String.class);

            if (resourceValue != null) {
                output.add(SearchUtils.addMatchMetadata(
                    resourceValue, query, "identifier", thisResource.adaptTo(JsonObject.class), false, ""));
            }
        }
    }
}
