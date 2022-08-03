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

function oihPersonToSheet(msg) {
  const values = [
    msg.metadata.recordUid || '',
    msg.data.for_rowid || '',
    msg.data.name || '',
    msg.data.firstName || '',
    msg.data.middleName || '',
    msg.data.lastName || '',
  ];

  if (msg.data.contactData) {
    for (let i = 0; i < msg.data.contactData.length; i += 1) {
      values.push(msg.data.contactData[i].value);
    }
  }

  if (msg.data.addresses) {
    for (let i = 0; i < msg.data.addresses.length; i += 1) {
      const currentAdr = msg.data.addresses[i];

      values.push(currentAdr.street || '');
      values.push(currentAdr.streetNumber || '');
      values.push(currentAdr.zipCode || '');
      values.push(currentAdr.city || '');
      values.push(currentAdr.region || '');
      values.push(currentAdr.country || '');
      values.push(currentAdr.countryCode || '');
    }
  }

  return values;
}

module.exports = {
  oihPersonToSheet,
};
