const qs = require('qs');
const request = require('request-promise').defaults({ simple: false, resolveWithFullResponse: true });

// Replace this with you api's base URI
// const BASE_URI = 'https://api.example.com';


function getSecretsApiEndpoint() {
  return process.env.SECRET_SERVICE_ENDPOINT || 'https://secret-service.openintegrationhub.com';
}


/**
 * @desc Internal function that checks whether an object with a certain ID already
 * exists in the target system
 *
 * @access  Private
 * @param {String} token - An authorization/access token
 * @param {String} recordUid - A unique ID identifying an object in the target system
 * @return {Boolean} - true if object exists, false if not
 */
async function checkExistence(token, recordUid) {
  try {
    const response = await request({
      method: 'GET',
      uri: `https://people.googleapis.com/v1/${recordUid}`,
      json: true,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      qs: {
        personFields: 'names',
      },
    });

    return { exists: response.statusCode === 200, etag: response.body.etag };
  } catch (e) {
    console.error(e);
    return { exists: false };
  }
}

/**
 * @desc Upsert function which creates or updates
 * an object, depending on whether it already exists in the target system
 *
 * @access  Private
 * @param {Object} object - The data object that will be pushed to the API
 * @param {String} token - An authorization/access token
 * @param {String} recordUid
 * @return {Object} - the new created ot update object in Snazzy Contacts
 */
async function upsertObject(object, token, recordUid) {
  /* If a recordUid is supplied, double-check whether the object exists in the target system
     If your api natively supports conditional upserting, you can skip this step
  */
  let objectExists = false;

  const requestObject = object;

  if (recordUid) {
    const response = await checkExistence(token, recordUid);
    if (response.exists) {
      objectExists = true;
      requestObject.etag = response.etag;
    }
  }

  let method;
  let uri;

  if (objectExists) {
    // Update the object if it already exists
    method = 'PATCH';
    // eslint-disable-next-line max-len
    uri = `https://people.googleapis.com/v1/${recordUid.includes('people/') ? recordUid : `people/${recordUid}`}:updateContact?${qs.stringify({ updatePersonFields: 'addresses,names,emailAddresses,phoneNumbers' })}`;
  } else {
    // Create the object if it does not exist
    method = 'POST';
    uri = 'https://people.googleapis.com/v1/people:createContact';
  }

  try {
    const result = await request({
      method,
      uri,
      json: true,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: requestObject,
    });

    if (result.statusCode === 200 || result.statusCode === 201) {
      return { success: true, responseId: result.body.resourceName || recordUid };
    }
    return { success: false };
  } catch (e) {
    console.error(e);
    return { success: false };
  }
}

/**
 * This method fetches objects from Snazzy Contacts
 * depending on the value of count variable and type
 *
 * @param token - Snazzy Contacts token required for authentication
 * @param snapshot - current state of snapshot
 * @return {Object} - Array of person objects containing data and meta
 */
async function getObjects(token, snapshot = {}) {
  try {
    const query = {
      pageSize: 1000,
      personFields: 'names,emailAddresses,addresses,phoneNumbers,urls,occupations,organizations,photos',
    };

    if (snapshot.syncToken) {
      query.syncToken = snapshot.syncToken;
    } else {
      query.requestSyncToken = true;
    }

    const response = await request({
      method: 'GET',
      uri: `https://people.googleapis.com/v1/people/me/connections?${qs.stringify(query)}`,
      json: true,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.statusCode !== 200) {
      console.error('Could not fetch objects!');
      console.error(response.body);
      return { objects: [], newSnapshot: { syncToken: false } };
    }

    const newSnapshot = { ...snapshot };

    if (response.body.nextSyncToken) {
      newSnapshot.syncToken = response.body.nextSyncToken;
    }

    return {
      objects: response.body.connections || [],
      newSnapshot,
    };
  } catch (e) {
    console.error(e);
    return { objects: [] };
  }
}

/**
 * This method will authenticate the user in Snazzy Contacts
 * and return a Bearer token if it is successful
 *
 * @param {Object} config - incoming message object that contains username and password
 * @return {String} - Bearer token
 */
async function getAccessToken(config) {
  try {
    if (config.accessToken) {
      return config.accessToken;
    }

    const secretRequest = await request({
      method: 'GET',
      uri: `${getSecretsApiEndpoint()}/secrets/${config.secret}`,
      headers: {
        'x-auth-type': 'basic',
        authorization: `Bearer ${config.iamToken}`,
      },
      json: true,
    });

    const { value } = secretRequest.body;
    return value.accessToken;
  } catch (err) {
    return err;
  }
}


module.exports = {
  getObjects, upsertObject, getAccessToken, getSecretsApiEndpoint,
};
