/* eslint no-param-reassign: "off" */

/**
 * Copyright 2020 Basaas GmbH

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const { transform } = require('@openintegrationhub/ferryman');
const { getObjects, getAccessToken } = require('./../utils/helpers');
const { personToOih } = require('./../transformations/personToOih');

/**
 * This method will be called from OIH platform providing following data
 *
 * @param msg - incoming message object that contains keys `data` and `metadata`
 * @param cfg - configuration that is account information and configuration field values
 * @param snapshot - saves the current state of integration step for the future reference
 */
async function processTrigger(msg, cfg, snapshot = {}) {
  try {
    const { applicationUid, domainId, schema } = cfg;

    /*
     This function performs a login and returns an access token.
     If your application supports persistent API keys, you can instead simply use the key directly.
  */
    const token = await getAccessToken(cfg);

    // Initialise the snapshot if it is not provided
    snapshot.lastUpdate = snapshot.lastUpdate || (new Date(0)).getTime();

    const oihMeta = {
      applicationUid: (applicationUid !== undefined && applicationUid !== null) ? applicationUid : undefined,
      schema: (schema !== undefined && schema !== null) ? schema : undefined,
      domainId: (domainId !== undefined && domainId !== null) ? domainId : undefined,
    };

    const { objects, newSnapshot } = await getObjects(token, snapshot);

    console.log(`Found ${objects.length} new records.`);

    if (newSnapshot) this.emit('snapshot', newSnapshot);

    if (objects.length > 0) {
      objects.forEach((elem) => {
        const newElement = {};

        oihMeta.recordUid = elem.uid;

        newElement.metadata = oihMeta;
        newElement.data = elem;
        // Emit the object with meta and data properties

        const transformedElement = transform(newElement, cfg, personToOih);

        // Emit the object to the OIH
        this.emit('data', transformedElement);
      });
    }

    console.log('Finished execution');
    this.emit('end');
  } catch (e) {
    console.log(`ERROR: ${e}`);
    this.emit('error', e);
  }
}

module.exports = {
  process: processTrigger,
};
