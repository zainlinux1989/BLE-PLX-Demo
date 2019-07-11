import Realm from 'realm'

class CapSchema extends Realm.Object {}
CapSchema.schema = {
    name: 'Cap',
    primaryKey: 'id',
    properties: {
        id: {type: 'int'},
        deviceId: {type: 'string'},
        platform: {type: 'string'}
    }
};

const currentVersion = Realm.schemaVersion(Realm.defaultPath);

const realm = new Realm(
    {
        schema: [CapSchema],
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
