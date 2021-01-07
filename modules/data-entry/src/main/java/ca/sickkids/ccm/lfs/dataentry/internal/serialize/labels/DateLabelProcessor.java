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
package ca.sickkids.ccm.lfs.dataentry.internal.serialize.labels;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.function.Function;

import javax.jcr.Node;
import javax.jcr.Property;
import javax.jcr.RepositoryException;
import javax.jcr.Value;
import javax.json.Json;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObjectBuilder;
import javax.json.JsonValue;

import org.osgi.service.component.annotations.Component;

import ca.sickkids.ccm.lfs.serialize.spi.ResourceJsonProcessor;

/**
 * Gets the formatted question answer for date questions.
 *
 * @version $Id$
 */
@Component(immediate = true)
public class DateLabelProcessor extends SimpleAnswerLabelProcessor implements ResourceJsonProcessor
{
    @Override
    public void leave(Node node, JsonObjectBuilder json, Function<Node, JsonValue> serializeNode)
    {
        try {
            if (node.isNodeType("lfs:DateAnswer")) {
                addProperty(node, json, serializeNode);
            }
        } catch (RepositoryException e) {
            // Really shouldn't happen
        }
    }

    @Override
    public JsonValue getAnswerLabel(final Node node, final Node question)
    {
        try {
            if (question != null) {
                Property property = node.getProperty(PROP_VALUE);
                SimpleDateFormat format = new SimpleDateFormat(question.getProperty("dateFormat").getString());
                if (property.isMultiple()) {
                    JsonArrayBuilder result = Json.createArrayBuilder();
                    for (Value v : property.getValues()) {
                        Calendar rawValue = v.getDate();
                        format.setTimeZone(rawValue.getTimeZone());
                        result.add(Json.createValue(format.format(rawValue.getTime())));
                    }
                    return result.build();
                } else {
                    Calendar rawValue = property.getDate();
                    format.setTimeZone(rawValue.getTimeZone());
                    return Json.createValue(format.format(rawValue.getTime()));
                }
            }
        } catch (final RepositoryException ex) {
            // Really shouldn't happen
        }
        return null;
    }
}
