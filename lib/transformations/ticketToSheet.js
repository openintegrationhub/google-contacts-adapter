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

function ticketToSheet(msg) {
  const values = [
    msg.metadata.recordUid || '',
    msg.data.for_rowid || '',
    msg.data.for_rowid_display || '',
    msg.data.employee_assigned || '',
    msg.data.employee_assigned_name || '',
    msg.data.status || '',
    msg.data.category1 || '',
    msg.data.category2 || '',
    msg.data.category3 || '',
    msg.data.category4 || '',

  ];

  if (msg.data.notes) {
    for (let i = 0; i < msg.data.notes.length; i += 1) {
      values.push(`${msg.data.notes[i].author} @ ${msg.data.notes[i].time} ${msg.data.notes[i].date}: ${msg.data.notes[i].text}`);
    }
  }


  return values;
}

module.exports = {
  ticketToSheet,
};
