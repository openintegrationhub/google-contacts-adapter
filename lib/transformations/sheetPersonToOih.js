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

function sheetPersonToOih(msg) {
  const expression = {
    data: {
      firstName: msg.data.firstname,
      lastName: msg.data.lastname,
      photo: msg.data.photo,
      jobTitle: msg.data.jobtitle,
      salutation: msg.data.salutation,
      gender: msg.data.gender,
      birthday: msg.data.birthday,
      displayName: msg.data.displayName,
      middleName: msg.data.middleName,
      nickname: msg.data.nickname,
      contactData: [],
      addresses: [],
    },
    metadata: msg.metadata,
  };

  if (msg.data.email) {
    expression.data.contactData.push({
      type: 'email',
      value: msg.data.email,
    });
  }

  if (msg.data.phone) {
    expression.data.contactData.push({
      type: 'phone',
      value: msg.data.phone,
    });
  }

  if (msg.data.fax) {
    expression.data.contactData.push({
      type: 'fax',
      value: msg.data.fax,
    });
  }

  if (msg.data.city || msg.data.street || msg.data.streetnumber || msg.data.country || msg.data.zipcode) {
    expression.data.addresses.push({
      city: msg.data.city,
      street: msg.data.street,
      streetNumber: msg.data.streetNumber,
      country: msg.data.country,
      zipCode: msg.data.zipcode,
    });
  }

  return expression;
}

module.exports = {
  sheetPersonToOih,
};
