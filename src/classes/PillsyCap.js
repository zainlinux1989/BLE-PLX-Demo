import async from 'async';
import gatt from '../modules/ble/gatt';
import {BleManager} from "react-native-ble-plx";
import {hexToBase64, base64ToArrayBuffer} from '../modules/StringExt';
import PillyLog from './PillsyLog';
import {Buffer} from "buffer";


export default class PillsyCap {
    constructor(id) {
        this.id = id;
        this.manager = new BleManager();
        this.device = null;
        this.services = gatt.services;
        //     {
        //     pillsy: {
        //         uuid: gatt.services.pillsy.uuid
        //     },
        //     battery: {
        //         uuid: gatt.services.battery.uuid
        //     },
        //     deviceInfo: {
        //         uuid: gatt.services.deviceInfo.uuid
        //     },
        //     dfu: {
        //         uuid: gatt.services.dfu.uuid
        //     }
        // }
    }

    componentWillMount(): void {

    }

    connect = () => {
        return new Promise((resolve, reject) => {
            const subscription = this.manager.onStateChange((state) => {
                if (state === 'PoweredOn') {
                    this.manager.startDeviceScan(null, null, (error, device) => {
                        //subscription.remove();
                        if(error){
                            this.manager.stopDeviceScan();
                            this.device = null;
                            reject(null);
                        }
                        // Check if it is a device you are looking for based on advertisement data
                        // or other criteria.
                        console.log(`Device name : ${device.name}`);
                        if (device.name === this.id) {

                            this.manager.stopDeviceScan();

                            device.connect()
                                .then((device)=>{
                                    return device.discoverAllServicesAndCharacteristics();
                                })
                                .then((device) => {
                                    this.device = device;
                                    resolve(device);
                                })
                                .catch((error) => {
                                    // Handle errors
                                    this.device = null;
                                    reject(null);
                                });

                        }
                        // else{
                        //     this.device = null;
                        //     reject(null);
                        // }
                    });
                }
                // else{
                //     this.device = null;
                //     reject(null);
                // }
            }, true);
        });
    };

    // LOG
    readLogs = () => {
        /*
            this.device.readCharacteristicForService(this.services.pillsy.uuid, this.services.pillsy.characteristics.log)
            .then((data)=>{
                console.log(`Data : ${data.value}`)
            })
            .catch((error)=>{
                console.log(`Data error : ${error}`)
            })
        */

        // Uint8Array(16)

        this.device.readCharacteristicForService(this.services.pillsy.uuid, this.services.pillsy.characteristics.log)
            .then((data)=>{

                // const arrayBuffer = base64ToArrayBuffer(data.value);
                // const viewData = new DataView(arrayBuffer);
                // console.log(`Read Logs : ${log.value}`)

                var buffer = Buffer.from(data.value, 'base64');
                // var buf = new Uint8Array(arrayBuffer);

                let log = new PillyLog(buffer);
            })
            .catch((error)=>{
                console.log((`Unable to read logs ${error}`))
            })

    }

    stopLog = () => {
        this.manager.writeCharacteristicWithoutResponseForDevice(this.device.id, this.services.pillsy.uuid, this.services.pillsy.characteristics.log)
            .then(()=>{
                console.log('Stop logs successfully')
            })
            .catch((error)=>{
                console.log('Unable to stop logs')
            })

    }

    // TIME
    base64FromDate = (date) => {
        let time = date.getTime();
        let seconds = parseInt(time / 1000);

        return btoa(seconds);
        // let buffer = new Buffer(4);
        // buffer.writeUInt32BE(seconds);
        // return buffer;
    }

    setTime = () => {
        console.log("Set time on ");

        let data = this.base64FromDate(new Date());

        let char = this.services.pillsy.time;

        this.manager.writeCharacteristicWithResponseForDevice(this.device.id, this.services.pillsy.uuid, this.services.pillsy.characteristics.time, data)
            .then((success)=>{
                console.log(`Time set successfully : ${success}`)
            })
            .catch((error)=>{
                console.log(`Time set error : ${error}`);
            })

        // char.write(data, false);
    }

    readTime = () => {
        console.log("Read Time on ");

        let char = this.services.pillsy.time;

        this.device.readCharacteristicForDevice(this.services.pillsy.uuid, this.services.pillsy.characteristics.time)
            .then((data)=>{

                // const arrayBuffer = base64ToArrayBuffer(data.value);
                // const view = new DataView(arrayBuffer);
                // const value = view.getUint32(0, false);

                let buffer = Buffer.from(data.value, 'base64');
                const value = buffer.readUInt32BE();

                let date = new Date(value * 1000);
                let delta = (new Date() - date) / 1000;
                console.log(`Date: ${date}, Delta: ${delta} seconds`);
                console.log(`Time read success : ${value}`)
            })
            .catch((error)=>{
                console.log(`Time read error : ${error}`)
            })
        /*
        char.read();
        char.once('data', function(data) {
            let time = data.readUInt32BE();
            let date = new Date(time * 1000);
            let delta = (new Date() - date) / 1000;
            console.log("Time: %d Date: %s, Delta: %d seconds", time, date, delta);
        });
         */
    }

    // ALERT
    alert = (key) => {
        console.log("Alert - key: ", key);
        let data = hexToBase64(key.toString());
        this.manager.writeCharacteristicWithResponseForDevice(this.device.id, gatt.services.pillsy.uuid, gatt.services.pillsy.characteristics.beep, data)
            .then((result)=>{
                console.log(result)
            })
            .catch((error)=>{
                console.log(error)
            })
    }

    // BEEP
    beep = () => {
        this.alert(0x1);
    }

    blink = () => {
        this.alert(0x2);
    }

    warn = () => {
        this.alert(0x4);
    }

    chirp = () => {
        this.alert(0x8);
    }

    // ALARM
    setAlarm = (date, interval) => {
        console.log("Set alarm at %s which repeats every %d hours", date, interval);

        let intervalBuf = Buffer.alloc(4);
        intervalBuf.writeUInt32BE(interval);

        let dateBuf = this.base64FromDate(date);

        let data = Buffer.concat([dateBuf, intervalBuf]);

        let char = this.services.pillsy.alarm;
        char.write(data, false);
    }

    clearAlarms = () => {
        console.log("Clearing all alarms on ", this.peripheral.address);

        let data = Buffer.alloc(4);
        let char = this.services.pillsy.alarm;
        char.write(data, false);
    }

    readAlarm = () => {
        console.log("Read Alarm on ", this.peripheral.address);

        let char = this.services.pillsy.alarm
        char.read();
        char.once('data', function(data) {
            let time = data.readUInt32BE();
            let interval = data.readUInt32BE(4);

            let date = new Date(time * 1000);
            console.log("Next Alarm: %d Date: %s Interval:", time, date, interval);
        });
    }

    // ADMIN
    setAdmin = (key) => {
        console.log("Admin - key: ", key);
        let data = hexToBase64(key.toString());
        this.manager.writeCharacteristicWithResponseForDevice(this.device.id, gatt.services.pillsy.uuid, gatt.services.pillsy.characteristics.admin, data)
            .then((result)=>{
                console.log(result)
            })
            .catch((error)=>{
                console.log(error)
            })
    }

    keepAlive = () => {
        this.setAdmin(gatt.adminKeys.keepAlive);
    }

    drop = () => {
        this.setAdmin(gatt.adminKeys.disconnect);
    }

    hibernate = () => {
        this.setAdmin(gatt.adminKeys.hibernate);
    }

    forceCrash = () => {
        this.setAdmin(gatt.adminKeys.forceCrash);
    }

    setVolume = (level) => {
        console.log("Set volume on ", this.peripheral.address);

        var key = gatt.adminKeys.volume[level];
        if (key) {
            this.setAdmin(key);
        } else {
            console.log("Invalid Volume!");
        }
    }

    setPingInterval = (interval) => {
        console.log("Set ping interval on ", this.peripheral.address);

        var num = parseInt(interval);
        var key = gatt.adminKeys.pingInterval[num];
        if (key) {
            this.setAdmin(key);
        } else {
            console.log("Invalid Ping Interval!");
        }
    }

    // BATTERY

    readBattery = () => {

        this.device.readCharacteristicForService(this.services.battery.uuid, this.services.battery.characteristics.level)
            .then((data)=>{
                // const arrayBuffer = base64ToArrayBuffer(data.value);
                // const view = new DataView(arrayBuffer);
                // const value = view.getUint8(0);

                let buffer = Buffer.from(data.value, 'base64');
                const  value = buffer.readUInt8();

                console.log(`Battery level : ${value}`)
            })
            .catch((error)=>{
                console.log(`Battery read error : ${error}`)
            })

        /*
        let char = this.services.battery.level
        char.subscribe();
        char.on('data', function(data) {
            let pct = data.readUInt8();
            console.log("Battery:", pct + "%");
        });
         */
    }

    // INFO:

    readString = (char, callback) => {
        char.read(function(err, data) {
            callback(data.toString());
        })
    }

    readDeviceInfo = () => {
        console.log("Read Info on ", this.peripheral.address);

        let service = this.services.deviceInfo
        this.readString(service.modelNumber, function(str) {
            console.log("Model:", str);
        });
        this.readString(service.firmwareRevision, function(str) {
            console.log("Firmware Version:", str);
        });
        this.readString(service.hardwareRevision, function(str) {
            console.log("Hardware Revision:", str);
        });
        this.readString(service.softwareRevision, function(str) {
            console.log("Build Hash:", str);
        });
        this.readString(service.manufacturerName, function(str) {
            console.log("Manufacturer:", str);
        });
    }

    disconnect() {
        this.cap.disconnect();
    }
}
