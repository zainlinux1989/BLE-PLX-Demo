import Realm from 'realm'

export const SCHEMA_NAME = 'Cap';

class Schema extends Realm.Object {}
Schema.schema = {
    name: SCHEMA_NAME,
    primaryKey: 'id',
    properties: {
        id: {type: 'int'},
        deviceId: {type: 'string'},
        platform: {type: 'string'}
    }
};

const realm = new Realm(
    {
        schema: [Schema],
        schemaVersion:14,
        migration: function(oldRealm, newRealm) {
            newRealm.deleteAll();
        }});
export default realm;






/*
properties: {
        id: {type: 'int'},
        deviceId: {type: 'string'},
        platform: {type: 'string'},
        eventValue: {type: 'string'},
        eventType: {type: 'string'},
        eventTime: {type: 'int'},
        latitude: {type: 'double'},
        longitude: {type: 'double'},
        owner: {type: 'string'},
        method: {type: 'string'},
        syncState: {type: 'int'},
        createAt: {type: 'int'},
        updateAt: {type: 'int'}
    }

*/
