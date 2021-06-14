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

function personFromOih(msg) {
  const contact = {
    names: [
      {
        familyName: msg.data.lastName,
        givenName: msg.data.firstName,
        middleName: msg.data.middleName,
      },
    ],
    phoneNumbers: [],
    emailAddresses: [],
    addresses: [],
    organizations: [],
  };

  // Attempt to map contact Data to fields, first found entry for each type wins
  if (msg.data.contactData) {
    for (let i = 0; i < msg.data.contactData.length; i += 1) {
      const currentCD = msg.data.contactData[i];

      switch (currentCD.type) {
        case 'email':
          contact.emailAddresses.push({
            type: currentCD.description,
            value: currentCD.value,
          });
          break;
        case 'phone':
          contact.phoneNumbers.push({
            type: 'phone',
            value: currentCD.value,
          });
          break;
        case 'fax':
          contact.phoneNumbers.push({
            type: 'workFax',
            value: currentCD.value,
          });
          break;
        case 'mobile':
          contact.phoneNumbers.push({
            type: 'mobile',
            value: currentCD.value,
          });
          break;
        default:
          break;
      }
    }
  }

  if (msg.data.addresses) {
    // Attempt to add addresses, first of each kind wins
    for (let i = 0; i < msg.data.addresses.length; i += 1) {
      const currentAdr = msg.data.addresses[i];

      contact.addresses.push({
        streetAddress: `${currentAdr.street} ${currentAdr.streetNumber}`,
        postalCode: currentAdr.zipCode,
        city: currentAdr.city,
        region: currentAdr.region,
        country: currentAdr.country,
        countryCode: currentAdr.countryCode,
      });
    }
  }

  // Attempt to find a relation to populate company name, first wins
  if (contact.relations) {
    for (let i = 0; i < contact.relations.length; i += 1) {
      const relation = contact.relations[i];

      if (relation.type === 'PersonToOrganization' || relation.type === 'OrganizationToPerson') {
        if (relation.partner && relation.partner.name) {
          contact.organizations.push({
            name: relation.partner.name,
          });
          break;
        }
      }
    }
  }
  return { data: contact, metadata: msg.metadata };
}

module.exports = {
  personFromOih,
};
