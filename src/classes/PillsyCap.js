import async from 'async';
import gatt from '../modules/ble/gatt';
import {BleManager} from "react-native-ble-plx";
import {hexToBase64, base64ToArrayBuffer} from '../modules/StringExt';
import PillyLog from './PillsyLog';
import {Buffer} from "buffer";
import Base64 from 'react-native-base64';


export default class PillsyCap {
    constructor(address) {
        this.address = address.toLowerCase();
        this.manager = new BleManager();
        this.device = null;
        this.services = gatt.services;

        // Services UUID
        this.pillsyUUID = gatt.services.pillsy.uuid;
        this.batteryUUID = gatt.services.battery.uuid;
        this.deviceInfoUUID = gatt.services.deviceInfo.uuid;
        this.dfuUUID = gatt.services.dfu.uuid;

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
                        let address = this.getDeviceAddress(device.manufacturerData);

                        if (address === this.address) {
                            console.log(`Connected device address(id) : ${address}`);
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

    // Get Device Address(ID) from Manufacturer data
    getDeviceAddress = (data) =>{

        let buffer = Buffer.from(data, 'base64');
        // Type:        [Start] # bytes (total 12)
        // Device Id:   [3-8]   6 bytes

        let deviceID = buffer.subarray(3,9).toString('hex');
        let arr = [];

        for(let i=0;i<deviceID.length;i=i+2){
            arr.push(deviceID[i]+deviceID[i+1]);
        }
        // Return address in xx:xx:xx:xx:xx:xx form
        return arr.reverse().join(':').toLowerCase();
    }

    // LOG
    readLogs = () => {

        let charUUID = this.services.pillsy.characteristics.log;

        this.manager.monitorCharacteristicForDevice(this.device.id, this.pillsyUUID, charUUID,(error, data) => {
            if (error) {
                console.log(error.message)
                return
            }
            var buffer = Buffer.from(data.value, 'base64');
            let log = new PillyLog(buffer);
            log.print();

        })
    }

    stopLog = () => {

        let charUUID = this.services.pillsy.characteristics.log;

        this.manager.writeCharacteristicWithoutResponseForDevice(this.device.id, this.pillsyUUID, charUUID)
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

        let charUUID = this.services.pillsy.characteristics.time;
        let data = this.base64FromDate(new Date());

        this.manager.writeCharacteristicWithResponseForDevice(this.device.id, this.pillsyUUID, charUUID, data)
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

        let charUUID = this.services.pillsy.characteristics.time;

        this.manager.readCharacteristicForDevice(this.device.id, this.pillsyUUID, charUUID)
            .then((data)=>{
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
    }

    // ALERT
    alert = (key) => {
        console.log("Alert - key: ", key);

        let charUUID = this.services.pillsy.characteristics.beep;
        let data = hexToBase64(key.toString());

        this.manager.writeCharacteristicWithResponseForDevice(this.device.id, this.pillsyUUID, charUUID, data)
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

    // ALARM -- not changed
    setAlarm = (date, interval) => {
        console.log("Set alarm at %s which repeats every %d hours", date, interval);

        let intervalBuf = Buffer.alloc(4);
        intervalBuf.writeUInt32BE(interval);

        let dateBuf = this.base64FromDate(date);

        let data = Buffer.concat([dateBuf, intervalBuf]);

        let char = this.services.pillsy.alarm;
        char.write(data, false);
    }

    //  -- not changed
    clearAlarms = () => {
        console.log("Clearing all alarms on ", this.peripheral.address);

        let data = Buffer.alloc(4);
        let char = this.services.pillsy.alarm;
        char.write(data, false);
    }

    //  -- not changed
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

        let charUUID = this.services.pillsy.characteristics.admin;
        let data = hexToBase64(key.toString());

        this.manager.writeCharacteristicWithResponseForDevice(this.device.id, this.pillsyUUID, charUUID , data)
            .then((result)=>{
                // console.log(`Admin Logs : `);
                // console.log(result);
                // console.log('--------------------')
            })
            .catch((error)=>{
                console.log(error)
            })
    };

    keepAlive = () => {
        this.setAdmin(gatt.adminKeys.keepAlive);
    };

    drop = () => {
        this.setAdmin(gatt.adminKeys.disconnect);
    };

    hibernate = () => {
        this.setAdmin(gatt.adminKeys.hibernate);
    };

    forceCrash = () => {
        this.setAdmin(gatt.adminKeys.forceCrash);
    };

    //  -- not changed
    setVolume = (level) => {
        console.log("Set volume on ", this.peripheral.address);

        var key = gatt.adminKeys.volume[level];
        if (key) {
            this.setAdmin(key);
        } else {
            console.log("Invalid Volume!");
        }
    };

    //  -- not changed
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

    // BATTERY:
    readBattery = () => {

        let charUUID = this.services.battery.characteristics.level;

        this.manager.readCharacteristicForDevice(this.device.id, this.batteryUUID, charUUID)
            .then((data)=>{
                let buffer = Buffer.from(data.value, 'base64');
                const  value = buffer.readUInt8();

                console.log(`Battery level : ${value}`)
            })
            .catch((error)=>{
                console.log(`Battery read error : ${error}`)
            })
    };


    // INFO:
    readString = (char, callback) => {
        this.manager.readCharacteristicForDevice(this.device.id, this.deviceInfoUUID, char)
            .then((data)=>{
                const  value = Base64.decode(data.value)
                callback(value)
            })
            .catch((error)=>{
                callback(`Read info error : ${error}`)
            })
    };

    readDeviceInfo = () => {
        console.log("Read Info on ");

        let service = this.services.deviceInfo.characteristics;
        this.readString(service.modelNumber, (str) => {
            console.log("Model:", str);
        });
        this.readString(service.firmwareRevision, (str) => {
            console.log("Firmware Version:", str);
        });
        this.readString(service.hardwareRevision, (str) => {
            console.log("Hardware Revision:", str);
        });
        this.readString(service.softwareRevision, (str) => {
            console.log("Build Hash:", str);
        });
        this.readString(service.manufacturerName, (str) => {
            console.log("Manufacturer:", str);
        });
    };

    disconnect() {
        this.cap.disconnect();
    }
}
