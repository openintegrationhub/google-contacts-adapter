/* eslint no-unused-expressions: "off" */

const { expect } = require('chai');
const nock = require('nock');
const { getAccessToken, getObjects, upsertObject } = require('./../lib/utils/helpers');

const dummyAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';

describe('Helpers', () => {
  it('should fetch access token', async () => {
    nock('https://secret-service.openintegrationhub.com')
      .get('/secrets/5d4c052dca2bda001072684c')
      .reply(200, { value: { accessToken: dummyAccessToken } });

    const cfg = {
      secret: '5d4c052dca2bda001072684c',
    };
    const token = await getAccessToken(cfg);
    console.log('Token received', token);
    expect(token).to.equal(dummyAccessToken);
  });

  it('should get Objects, filtered by timestamp', async () => {
    nock('https://people.googleapis.com', { reqheaders: { authorization: `Bearer ${dummyAccessToken}` } })
      .filteringPath(() => '/v1/people/me/connections')
      .get('/v1/people/me/connections')
      .reply(200, {

        connections: [
          {
            firstName: 'Jane',
            lastName: 'Doe',
            lastUpdate: '2020-10-26T15:44:10+0000',
          },
          {
            firstName: 'Somebody',
            lastName: 'Else',
            lastUpdate: '2019-10-26T15:44:10+0000',
          },
          {
            firstName: 'Nobody',
            middleName: 'of',
            lastName: 'Note',
            lastUpdate: '2018-10-26T15:44:10+0000',
          },
        ],

      });

    const { objects, newSnapshot } = await getObjects(dummyAccessToken, {});
    console.log('Objects fetched', objects);
    console.log(newSnapshot);
    expect(objects).to.have.lengthOf(3);
  });

  xit('should dynamically insert an object', async () => {
    nock('https://api.example.com', { reqheaders: { authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' } })
      .post('/', { firstName: 'New', lastName: 'Entry' })
      .reply(201, { id: '4711' });


    const { success, responseId } = await upsertObject({ firstName: 'New', lastName: 'Entry' }, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');

    expect(success).to.be.true;
    expect(responseId).to.equal('4711');
  });

  xit('should dynamically update an object', async () => {
    nock('https://api.example.com', { reqheaders: { authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' } })
      .get('/4711')
      .reply(200, { id: '4711' });

    nock('https://api.example.com', { reqheaders: { authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' } })
      .put('/4711', { firstName: 'Updated' })
      .reply(200, { id: '4711' });


    const { success, responseId } = await upsertObject({ firstName: 'Updated' }, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9', '4711');

    expect(success).to.be.true;
    expect(responseId).to.equal('4711');
  });
});
