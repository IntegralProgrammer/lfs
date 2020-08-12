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
package ca.sickkids.ccm.lfs.formcompletionstatus;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import javax.jcr.Node;
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
 * An {@link Editor} that verifies the correctness and completeness of submitted questionnaire answers and sets the
 * INVALID and INCOMPLETE status flags accordingly.
 *
 * @version $Id$
 */
public class AnswerCompletionStatusEditor extends DefaultEditor
{

    private static final Logger LOGGER = LoggerFactory.getLogger(AnswerCompletionStatusEditor.class);

    private static final String PROP_VALUE = "value";

    private static final String PROP_QUESTION = "question";

    private static final String STATUS_FLAGS = "statusFlags";

    private static final String STATUS_FLAG_INCOMPLETE = "INCOMPLETE";

    private static final String STATUS_FLAG_INVALID = "INVALID";

    // This holds the builder for the current node. The methods called for editing specific properties don't receive the
    // actual parent node of those properties, so we must manually keep track of the current node.
    private final NodeBuilder currentNodeBuilder;

    // A ResourceResolver object is passed in during the initialization of this object. This ResourceResolver
    // is later used for obtaining the constraints on the answers submitted to a question.
    private final ResourceResolver currentResourceResolver;

    // This holds a list of NodeBuilders with the first item corresponding to the root of the JCR tree
    // and the last item corresponding to the current node. By keeping this list, one is capable of
    // moving up the tree and setting status flags of ancestor nodes based on the status flags of a
    // descendant node.
    private final List<NodeBuilder> currentNodeBuilderPath;

    /**
     * Simple constructor.
     *
     * @param nodeBuilder a list of NodeBuilder objects starting from the root of the JCR tree and moving down towards
     *            the current node.
     * @param resourceResolver a ResourceResolver object used to obtain answer constraints
     */
    public AnswerCompletionStatusEditor(final List<NodeBuilder> nodeBuilder, final ResourceResolver resourceResolver)
    {
        this.currentNodeBuilderPath = nodeBuilder;
        this.currentNodeBuilder = nodeBuilder.get(nodeBuilder.size() - 1);
        this.currentResourceResolver = resourceResolver;
    }

    // Called when a new property is added
    @Override
    public void propertyAdded(final PropertyState after)
        throws CommitFailedException
    {
        propertyChanged(null, after);
        // Summarize all parents
        try {
            summarizeBuilders(this.currentNodeBuilderPath);
        } catch (final RepositoryException e) {
            return;
        }
    }

    // Called when the value of an existing property gets changed
    @Override
    public void propertyChanged(final PropertyState before, final PropertyState after)
        throws CommitFailedException
    {
        final Node questionNode = getQuestionNode(this.currentNodeBuilder);
        if (questionNode != null && PROP_VALUE.equals(after.getName())) {
            final Iterable<String> nodeAnswers = after.getValue(Type.STRINGS);
            final int numAnswers = iterableLength(nodeAnswers);
            final List<String> statusFlags = new ArrayList<>();
            if (checkInvalidAnswer(questionNode, numAnswers)) {
                statusFlags.add(STATUS_FLAG_INVALID);
                statusFlags.add(STATUS_FLAG_INCOMPLETE);
            } else {
                /*
                 * We are here because:
                 *     - minAnswers == 0 && maxAnswers == 0
                 *     - minAnswers == 0 && maxAnswers == 1 && numAnswers in range [0,1] (eg. optional radio button)
                 *     - minAnswers == 1 && maxAnswers == 0 && numAnswers in range [1,+INF) (eg. mandatory checkboxes)
                 *     - minAnswers == 1 && maxAnswers == 1 && numAnswers == 1 (eg. mandatory radio button)
                 *     - minAnswers == N && maxAnswers == 0 && numAnswers in range [N,+INF)
                 *         (eg. at least N (inclusive) checkboxes must be selected)
                 *     - minAnswers == 0 && maxAnswers == M && numAnswers in range [0, M]
                 *         (eg. at most M (inclusive) checkboxes must be selected)
                 *     - minAnswers == N && maxAnswers == M && numAnswers in range [N,M]
                 *         (eg. between N (inclusive) and M (inclusive) checkboxes must be selected)
                 */

                /*
                 * TODO: Implement validation rules and check them here
                 * Remove INVALID and INCOMPLETE flags if all validation rules pass
                 */
            }
            this.currentNodeBuilder.setProperty(STATUS_FLAGS, statusFlags, Type.STRINGS);
            // Summarize all parents
            try {
                summarizeBuilders(this.currentNodeBuilderPath);
            } catch (final RepositoryException e) {
                LOGGER.warn("Could not run summarize(): {}", e.getMessage(), e);
            }
        }
    }

    // Called when a property is deleted
    @Override
    public void propertyDeleted(final PropertyState before)
        throws CommitFailedException
    {
        final Node questionNode = getQuestionNode(this.currentNodeBuilder);
        if (questionNode != null) {
            if (PROP_VALUE.equals(before.getName())) {
                final List<String> statusFlags = new ArrayList<>();
                // Only add the INVALID,INCOMPLETE flags if the given question requires more than zero answers
                if (checkInvalidAnswer(questionNode, 0)) {
                    statusFlags.add(STATUS_FLAG_INVALID);
                    statusFlags.add(STATUS_FLAG_INCOMPLETE);
                }
                this.currentNodeBuilder.setProperty(STATUS_FLAGS, statusFlags, Type.STRINGS);

                // Summarize all parents
                try {
                    summarizeBuilders(this.currentNodeBuilderPath);
                } catch (final RepositoryException e) {
                    LOGGER.warn("Could not run summarizeBuilders(): {}", e.getMessage(), e);
                }
            }
        }
    }

    // When something changes in a node deep in the content tree, the editor is invoked starting with the root node,
    // descending to the actually changed node through subsequent calls to childNodeChanged. The default behavior of
    // DefaultEditor is to stop at the root, so we must override the following two methods in order for the editor to be
    // invoked on non-root nodes.
    @Override
    public Editor childNodeAdded(final String name, final NodeState after)
        throws CommitFailedException
    {
        final Node questionNode = getQuestionNode(this.currentNodeBuilder.getChildNode(name));
        if (questionNode != null) {
            if (this.currentNodeBuilder.getChildNode(name).hasProperty(PROP_QUESTION)) {
                final List<String> statusFlags = new ArrayList<>();
                // Only add the INCOMPLETE flag if the given question requires more than zero answers
                if (checkInvalidAnswer(questionNode, 0)) {
                    statusFlags.add(STATUS_FLAG_INCOMPLETE);
                }
                this.currentNodeBuilder.getChildNode(name).setProperty(STATUS_FLAGS, statusFlags, Type.STRINGS);
            }
        }
        final List<NodeBuilder> tmpList = new ArrayList<>(this.currentNodeBuilderPath);
        tmpList.add(this.currentNodeBuilder.getChildNode(name));
        return new AnswerCompletionStatusEditor(tmpList, this.currentResourceResolver);
    }

    @Override
    public Editor childNodeChanged(final String name, final NodeState before, final NodeState after)
        throws CommitFailedException
    {
        final List<NodeBuilder> tmpList = new ArrayList<>(this.currentNodeBuilderPath);
        tmpList.add(this.currentNodeBuilder.getChildNode(name));
        return new AnswerCompletionStatusEditor(tmpList, this.currentResourceResolver);
    }

    /**
     * Gets the question node associated with the answer for which this AnswerCompletionStatusEditor is an editor
     * thereof.
     *
     * @return the question Node object associated with this answer
     */
    private Node getQuestionNode(final NodeBuilder nb)
    {
        try {
            if (nb.hasProperty(PROP_QUESTION)) {
                final Session resourceSession = this.currentResourceResolver.adaptTo(Session.class);
                final String questionNodeReference = nb.getProperty(PROP_QUESTION).getValue(Type.REFERENCE);
                final Node questionNode = resourceSession.getNodeByIdentifier(questionNodeReference);
                return questionNode;
            }
        } catch (final RepositoryException ex) {
            return null;
        }
        return null;
    }

    /**
     * Counts the number of items in an Iterable.
     *
     * @param iterable the Iterable object to be counted
     * @return the number of objects in the Iterable
     */
    private int iterableLength(final Iterable<?> iterable)
    {
        int len = 0;
        final Iterator<?> iterator = iterable.iterator();
        while (iterator.hasNext()) {
            iterator.next();
            len++;
        }
        return len;
    }

    /**
     * Reports if a given number of answers is invalid for a given question.
     *
     * @param questionNode the Node to provide the minAnswers and maxAnswers properties
     * @return true if the number of answers is valid, false if it is not
     */
    private boolean checkInvalidAnswer(final Node questionNode, final int numAnswers)
    {
        try {
            final long minAnswers = questionNode.getProperty("minAnswers").getLong();
            final long maxAnswers = questionNode.getProperty("maxAnswers").getLong();
            if ((numAnswers < minAnswers && minAnswers != 0) || (numAnswers > maxAnswers && maxAnswers != 0)) {
                return true;
            }
        } catch (final RepositoryException ex) {
            // If something goes wrong then we definitely cannot have a valid answer
            return true;
        }
        return false;
    }

    private void summarizeBuilders(final List<NodeBuilder> nodeBuilders)
        throws RepositoryException
    {
        /*
         * i == 0 --> jcr:root
         * i == 1 --> jcr:root/Forms
         * i == 2 --> jcr:root/Forms/<some form object>
         */
        for (int i = nodeBuilders.size() - 2; i >= 2; i--) {
            summarizeBuilder(nodeBuilders.get(i), nodeBuilders.get(i - 1));
        }
    }

    private void summarizeBuilder(final NodeBuilder selectedNodeBuilder, final NodeBuilder prevNb)
        throws RepositoryException
    {
        // Iterate through all children of this node
        final Iterable<String> childrenNames = selectedNodeBuilder.getChildNodeNames();
        final Iterator<String> childrenNamesIter = childrenNames.iterator();
        boolean isInvalid = false;
        boolean isIncomplete = false;
        while (childrenNamesIter.hasNext()) {
            final String selectedChildName = childrenNamesIter.next();
            final NodeBuilder selectedChild = selectedNodeBuilder.getChildNode(selectedChildName);
            if ("lfs:AnswerSection".equals(selectedChild.getProperty("jcr:primaryType").getValue(Type.STRING))) {
                final Session resourceSession = this.currentResourceResolver.adaptTo(Session.class);
                if (!ConditionalSectionUtils.isConditionSatisfied(
                    resourceSession, selectedChild, selectedNodeBuilder)) {
                    continue;
                }
            }
            // Is selectedChild - invalid? , incomplete?
            if (selectedChild.hasProperty(STATUS_FLAGS)) {
                final Iterable<String> selectedProps = selectedChild.getProperty(STATUS_FLAGS).getValue(Type.STRINGS);
                final Iterator<String> selectedPropsIter = selectedProps.iterator();
                while (selectedPropsIter.hasNext()) {
                    final String thisStr = selectedPropsIter.next();
                    if (STATUS_FLAG_INVALID.equals(thisStr)) {
                        isInvalid = true;
                    }
                    if (STATUS_FLAG_INCOMPLETE.equals(thisStr)) {
                        isIncomplete = true;
                    }
                }
            }
        }
        // Set the flags in selectedNodeBuilder accordingly
        final List<String> statusFlags = new ArrayList<>();
        if (isInvalid) {
            statusFlags.add(STATUS_FLAG_INVALID);
        }
        if (isIncomplete) {
            statusFlags.add(STATUS_FLAG_INCOMPLETE);
        }
        // Write these statusFlags to the JCR repo
        selectedNodeBuilder.setProperty(STATUS_FLAGS, statusFlags, Type.STRINGS);
    }
}
