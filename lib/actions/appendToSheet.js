/* eslint no-param-reassign: "off" */
/* eslint consistent-return: "off" */


const { transform } = require('@openintegrationhub/ferryman');
const { appendToSheet, getAccessToken } = require('./../utils/helpers');
const { oihPersonToSheet } = require('../transformations/oihPersonToSheet');
const { oihObjectToSheet } = require('../transformations/oihObjectToSheet');

/**
 * This method will be called from OIH platform upon receiving data
 *
 * @param {Object} msg - incoming message object that contains keys `data` and `metadata`
 * @param {Object} cfg - configuration that contains login information and configuration field values
 */
async function processAction(msg, cfg) {
  try {
    /*
       This function performs a login and returns an access token.
       If your application supports persistent API keys, you can instead simply use the key directly.
    */
    const token = await getAccessToken(cfg);

    /*
      Make sure to pass the object through the transform interface.
      This allows for flow-specific custom mappings to be used.
    */

    let transformedObject;
    if (
      cfg.transformationType
      && (
        cfg.transformationType === 'personANDorganization'
        || cfg.transformationType === 'person'
        || cfg.transformationType === 'organization'
      )
    ) {
      transformedObject = transform(msg, cfg, oihPersonToSheet);
    } else {
      transformedObject = transform(msg, cfg, oihObjectToSheet);
    }

    // Execute the upsert operation
    await appendToSheet(transformedObject, token, cfg.sheetId, cfg.devMode);

    console.log('Finished execution');
    this.emit('end');
  } catch (e) {
    console.log(`ERROR: ${e}`);
    this.emit('error', e);
  }
}

module.exports = {
  process: processAction,
};
