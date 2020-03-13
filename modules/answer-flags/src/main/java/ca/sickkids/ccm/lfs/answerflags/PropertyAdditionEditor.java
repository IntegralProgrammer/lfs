/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package ca.sickkids.ccm.lfs.answerflags;

import java.util.ArrayList;
import java.util.Iterator;

import javax.jcr.ItemNotFoundException;
import javax.jcr.Node;
import javax.jcr.PathNotFoundException;
import javax.jcr.RepositoryException;
import javax.jcr.Session;

import org.apache.jackrabbit.oak.api.CommitFailedException;
import org.apache.jackrabbit.oak.api.PropertyState;
import org.apache.jackrabbit.oak.api.Type;
import org.apache.jackrabbit.oak.spi.commit.DefaultEditor;
import org.apache.jackrabbit.oak.spi.commit.Editor;
import org.apache.jackrabbit.oak.spi.state.NodeBuilder;
import org.apache.jackrabbit.oak.spi.state.NodeState;
import org.apache.sling.api.resource.ResourceResolver;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * An {@link Editor} that verifies the correctness and completeness of
 * submitted questionnaire answers and sets the INVALID and INCOMPLETE
 * status flags accordingly.
 *
 * @version $Id$
 */
public class PropertyAdditionEditor extends DefaultEditor
{

    private static final Logger LOGGER = LoggerFactory.getLogger(PropertyAdditionEditor.class);

    // This holds the builder for the current node. The methods called for editing specific properties don't receive the
    // actual parent node of those properties, so we must manually keep track of the current node.
    private final NodeBuilder currentNodeBuilder;

    // A ResourceResolver object is passed in during the initialization of this object. This ResourceResolver
    // is later used for obtaining the constraints on the answers submitted to a question.
    private final ResourceResolver currentResourceResolver;

    /**
     * Simple constructor.
     *
     * @param nodeBuilder the builder for the current node
     * @param resourceResolver a ResourceResolver object used to obtain answer constraints
     */
    public PropertyAdditionEditor(NodeBuilder nodeBuilder, ResourceResolver resourceResolver)
    {
        LOGGER.warn("Constructed a PropertyAdditionEditor");
        this.currentNodeBuilder = nodeBuilder;
        this.currentResourceResolver = resourceResolver;
    }

    // Called when a new property is added
    @Override
    public void propertyAdded(PropertyState after) throws CommitFailedException
    {
        //only sets property INCOMPLETE
        //This try..catch is a temporary hack. TODO: FIXME
        try {
            handlePropertyAdded(after);
        } catch (Exception e) {
            return;
        }
    }

    // Called when the value of an existing property gets changed
    @Override
    public void propertyChanged(PropertyState before, PropertyState after) throws CommitFailedException
    {
        //sets/removes both properties INCOMPLETE and INVALID
        //This try..catch is a temporary hack. TODO: FIXME
        try {
            handlePropertyChanged(before, after);
        } catch (Exception e) {
            return;
        }
    }

    // When something changes in a node deep in the content tree, the editor is invoked starting with the root node,
    // descending to the actually changed node through subsequent calls to childNodeChanged. The default behavior of
    // DefaultEditor is to stop at the root, so we must override the following two methods in order for the editor to be
    // invoked on non-root nodes.
    @Override
    public Editor childNodeAdded(String name, NodeState after) throws CommitFailedException
    {
        return new PropertyAdditionEditor(this.currentNodeBuilder.getChildNode(name), this.currentResourceResolver);
    }

    @Override
    public Editor childNodeChanged(String name, NodeState before, NodeState after) throws CommitFailedException
    {
        return new PropertyAdditionEditor(this.currentNodeBuilder.getChildNode(name), this.currentResourceResolver);
    }

    private Node getQuestionNode()
    {
        if (this.currentNodeBuilder.hasProperty("question")) {
            try {
                Session resourceSession = this.currentResourceResolver.adaptTo(Session.class);
                String questionNodeReference = this.currentNodeBuilder.getProperty("question").getValue(Type.REFERENCE);
                Node questionNode = resourceSession.getNodeByIdentifier(questionNodeReference);
                return questionNode;
            } catch (Exception e) {
                return null;
            }
        }
        return null;
    }

    private int iterableLength(Iterable iterable)
    {
        int len = 0;
        Iterator iterator = iterable.iterator();
        while (iterator.hasNext())
        {
            iterator.next();
            len++;
        }
        return len;
    }

    private void handlePropertyAdded(PropertyState state) throws CommitFailedException, ItemNotFoundException,
        PathNotFoundException, RepositoryException
    {
        Node questionNode = getQuestionNode();
        if (questionNode != null) {
            LOGGER.warn("PROPERTY ADDED...This question is: {}",
                questionNode.getProperty("text").getValue().toString());
            ArrayList<String> statusFlags = new ArrayList<String>();
            statusFlags.add("INCOMPLETE");
            this.currentNodeBuilder.setProperty("statusFlags", statusFlags, Type.STRINGS);
        }
    }

    private void handlePropertyChanged(PropertyState before, PropertyState after) throws CommitFailedException,
        ItemNotFoundException, PathNotFoundException, RepositoryException
    {
        Node questionNode = getQuestionNode();
        if (questionNode != null) {
            LOGGER.warn("PROPERTY CHANGED...This question is: {}",
                questionNode.getProperty("text").getValue().toString());
            long minAnswers = questionNode.getProperty("minAnswers").getLong();
            long maxAnswers = questionNode.getProperty("maxAnswers").getLong();
            Iterable<String> nodeAnswers = this.currentNodeBuilder.getProperty("value").getValue(Type.STRINGS);
            int numAnswers = iterableLength(nodeAnswers);
            LOGGER.warn("...the question contains {} answers.", numAnswers);
            ArrayList<String> statusFlags = new ArrayList<String>();
            if (numAnswers < minAnswers || numAnswers > maxAnswers) {
                LOGGER.warn("...setting as INVALID and INCOMPLETE");
                statusFlags.add("INVALID");
                statusFlags.add("INCOMPLETE");
                this.currentNodeBuilder.setProperty("statusFlags", statusFlags, Type.STRINGS);
            } else {
                //TODO: Implement validation rules and check them here
                //Remove INVALID and INCOMPLETE flags if all validation rules pass
                this.currentNodeBuilder.setProperty("statusFlags", statusFlags, Type.STRINGS);
            }
        }
    }
}
