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
package ca.sickkids.ccm.lfs.permissions.spi;

import java.util.Collections;
import java.util.List;

import org.apache.jackrabbit.oak.api.PropertyState;
import org.apache.jackrabbit.oak.api.Type;
import org.apache.jackrabbit.oak.spi.security.authorization.restriction.RestrictionPattern;
import org.apache.jackrabbit.oak.spi.security.authorization.restriction.RestrictionProvider;
import org.osgi.framework.Bundle;
import org.osgi.framework.wiring.FrameworkWiring;
import org.osgi.service.component.ComponentContext;

/**
 * Service interface used by {@link ca.sickkids.ccm.lfs.permissions.internal.FormsRestrictionProvider} to create
 * {@link RestrictionPattern}. For each component providing this service, its {@link #getName()} must be the same as the
 * property name used to store the restriction in the repository.
 *
 * @version $Id$
 */
public interface RestrictionFactory
{
    /**
     * The name of this restriction factory, must be the same as the name of the property storing this restriction in
     * the repository.
     *
     * @return a name
     */
    String getName();

    /**
     * The type of the value used for storing the restriction value.
     *
     * @return a type
     */
    Type<?> getType();

    /**
     * Returns a new restriction with the specified value.
     *
     * @param value the restriction value
     * @return a new restriction pattern
     */
    RestrictionPattern forValue(PropertyState value);

    /**
     * Refresh the FormsRestrictionProvider.
     * @param context The context of this factory's bundle
     */
    default void refreshProvider(ComponentContext context)
    {
        // To reload of restriction provider component, we need the system bundle
        // as well as the restriction provider's service bundle
        Bundle systemBundle = context.getBundleContext().getBundle(0);
        Bundle toReload = context.getBundleContext().getServiceReference(RestrictionProvider.class).getBundle();
        List<Bundle> bundles = Collections.singletonList(toReload);
        systemBundle.adapt(FrameworkWiring.class).refreshBundles(bundles);
    }
}
