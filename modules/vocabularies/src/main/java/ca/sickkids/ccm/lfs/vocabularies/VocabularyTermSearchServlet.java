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
package ca.sickkids.ccm.lfs.vocabularies;

import java.io.IOException;
import java.io.Writer;

import javax.jcr.RepositoryException;
import javax.json.Json;
import javax.json.stream.JsonGenerator;
import javax.servlet.Servlet;

import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.SlingHttpServletResponse;
import org.apache.sling.api.servlets.SlingSafeMethodsServlet;
import org.apache.sling.servlets.annotations.SlingServletResourceTypes;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.log.LogService;

@Component (service = {Servlet.class})
@SlingServletResourceTypes(resourceTypes = {"lfs/Vocabulary"}, methods = {"GET"})
public class VocabularyTermSearchServlet extends SlingSafeMethodsServlet 
{
	/**
	 * 
	 */
	private static final long serialVersionUID = -8244429250995709300L;

	@Reference
	private LogService logger;
	
	private static final int limit = 10;
	
	@Override
	public void doGet(final SlingHttpServletRequest request, final SlingHttpServletResponse response) throws IOException
	{
		String suggest = request.getParameter("suggest");
		String query = request.getParameter("query");
		
		if (suggest != null) {
			handleFullTextMatch(request, response);
		} else if (query != null) {
			handleLuceneQuery (request, response);
		} else {
			Writer out = response.getWriter(); 
		    Json.createGenerator(out).writeStartObject().writeEnd().flush();
			out.close();
		}
	}
	
	private void handleFullTextMatch(final SlingHttpServletRequest request, final SlingHttpServletResponse response) 
	{
		String suggest = request.getParameter("suggest");
		
	}
	
	private void handleLuceneQuery(final SlingHttpServletRequest request, final SlingHttpServletResponse response) 
	{
		String query = request.getParameter("query");
	}
}
