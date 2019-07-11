import realm from './CapSchema'

export default class CapDB {
    constructor(){
        this.MODEL_NAME = 'Cap';
        let object = realm.objects(this.MODEL_NAME)
    }

    // Pass data in parameters
    insert = () => {
        realm.write(() => {
            realm.create(this.MODEL_NAME, { id: this.getPrimaryKeyId(this.MODEL_NAME), deviceId: '12:32', platform: 'android' });   //
            realm.create(this.MODEL_NAME, { id: this.getPrimaryKeyId(this.MODEL_NAME), deviceId: '10:33', platform: 'android' });   //
            realm.create(this.MODEL_NAME, { id: this.getPrimaryKeyId(this.MODEL_NAME), deviceId: '11:32', platform: 'ios' });   //
        });
    };


    read = () => {
        let data = realm.objects(this.MODEL_NAME);        // Get all objects
        // let data = realm.objects(this.MODEL_NAME).filtered('platform == $0', 'android');        // deviceId == ''
        return data;
    };

    update = () => {
        let items = realm.objects(this.MODEL_NAME).filtered('platform == $0', 'android');

        for(let item of items){
            realm.write(() => {
                item.platform = 'ios';
            });
        }
    };

    getPrimaryKeyId = (model) => {
        if (realm.objects(model).max("id")) {
            return realm.objects(model).max("id") + 1;
        }
        else{
            return 1;
        }
    }

}
