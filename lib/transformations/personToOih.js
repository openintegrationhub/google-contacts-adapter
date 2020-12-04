/* eslint "max-len":  ["error", { "code": 170 }] */
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

const getPhoto = (payload) => {
  const hit = payload.photos.find(elem => elem.metadata && elem.metadata.primary === true);
  if (hit) {
    return hit.url;
  }
  return null;
};

const getJobTitle = (payload) => {
  const hit = payload.organizations.find(elem => elem.current === true);
  if (hit) {
    return hit.title || '';
  }
  return null;
};

module.exports.personToOih = (msg) => {
  const { data, metadata } = msg;

  if (Object.keys(msg).length === 0 && msg.constructor === Object) {
    return msg;
  }

  const contactData = [];
  const addresses = [];

  if (data.contactData) {
    for (let i = 0; i < data.emailAddresses.length; i += 1) {
      const cd = data.emailAddresses[i];
      contactData.push({
        value: cd.value,
        type: 'email',
      });
    }
    for (let i = 0; i < data.phoneNumbers.length; i += 1) {
      const pn = data.phoneNumbers[i];
      contactData.push({
        value: pn.value,
        type: 'phone',
      });
    }
  }

  if (data.addresses) {
    for (let j = 0; j < data.addresses.length; j += 1) {
      const adr = data.addresses[j];
      addresses.push({
        street: adr.streetAddress,
        streetNumber: '',
        zipCode: adr.postalCode,
        city: adr.city,
        region: adr.region,
        country: adr.country,
        countryCode: adr.countryCode,
      });
    }
  }

  const expression = {
    metadata: {
      recordUid: metadata.recordUid,
      operation: msg.operation,
      applicationUid: (metadata.applicationUid !== undefined && metadata.applicationUid !== null) ? metadata.applicationUid : 'appUid not set yet',
      iamToken: (metadata.iamToken !== undefined && metadata.iamToken !== null) ? metadata.iamToken : undefined,
      domainId: (metadata.domainId !== undefined && metadata.domainId !== null) ? metadata.domainId : undefined,
      schema: (metadata.schema !== undefined && metadata.schema !== null) ? metadata.schema : undefined,
    },
    data: {
      firstName: data.names ? data.names[0].givenName : '',
      lastName: data.names ? data.names[0].familyName : '',
      title: null,
      photo: data.photos ? getPhoto(data) : null,
      jobTitle: data.organizations ? getJobTitle(data) : null,
      salutation: data.names ? data.names[0].honorificPrefix : '',
      gender: data.genders && data.genders.length ? data.genders[0].value : null,
      birthday: data.birthdays && data.birthdays.length ? data.birthdays[0].text : null,
      displayName: data.names ? data.names[0].displayName : '',
      middleName: data.names ? data.names[0].middleName : '',
      nickname: data.nicknames && data.nicknames.length ? data.nicknames[0].value : '',
      contactData,
      addresses,
    },
  };

  // Remove null values
  Object.keys(expression.data).forEach(
    key => (expression.data[key] == null || expression.data[key] === undefined)
            && delete expression.data[key],
  );

  return expression;
};
