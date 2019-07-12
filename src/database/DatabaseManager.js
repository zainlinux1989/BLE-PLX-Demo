import realm from './Schema'
import {SCHEMA_NAME} from './Schema'
export default class DatabaseManager {
    constructor(){
        let object = realm.objects(SCHEMA_NAME)
    }

    // Pass data in parameters
    createRecord = () => {
        realm.write(() => {
            realm.create(SCHEMA_NAME, { id: this.#getPrimaryKeyId(SCHEMA_NAME), deviceId: '12:32', platform: 'android' });   //
            realm.create(SCHEMA_NAME, { id: this.#getPrimaryKeyId(SCHEMA_NAME), deviceId: '10:33', platform: 'android' });   //
            realm.create(SCHEMA_NAME, { id: this.#getPrimaryKeyId(SCHEMA_NAME), deviceId: '11:32', platform: 'ios' });   //
        });
    };


    readRecord = () => {
        let data = realm.objects(SCHEMA_NAME);        // Get all objects
        // let data = realm.objects(SCHEMA_NAME).filtered('platform == $0', 'android');        // deviceId == ''
        return data;
    };

    updateRecord = () => {
        // Apply filter
        let items = realm.objects(SCHEMA_NAME).filtered('platform == $0', 'android');

        // Update value of filtered items
        for(let item of items){
            realm.write(() => {
                item.platform = 'ios';
            });
        }
    };

    deleteRecord = () => {
        realm.write(()=>{
            // Apply filter
            let items = realm.objects(SCHEMA_NAME).filtered('deviceId == $0', '12:32');

            // delete first matched record
            realm.delete(items[0]);
        })
    };

    deleteAllRecords = () => {
        realm.write(()=>{
            // Apply filter
            let items = realm.objects(SCHEMA_NAME).filtered('deviceId == $0', '11:32');

            // delete all matched records
            realm.delete(items);
        })
    };

    close = () => {
        realm.close();
    };

    // Private method, Return autoincremented primary key,
    #getPrimaryKeyId = (schema) => {
        if (realm.objects(schema).max("id")) {
            return realm.objects(schema).max("id") + 1;
        }
        else{
            return 1;
        }
    }

}
