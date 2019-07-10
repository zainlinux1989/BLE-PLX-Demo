/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';
import {BleManager} from 'react-native-ble-plx'
import PillsyCap from './src/classes/PillsyCap';

export default class App extends Component {
    constructor() {
        super();
        this.manager = new BleManager();
    }
    componentWillMount() {
        this.startScan();
        /*
      const subscription = this.manager.onStateChange((state) => {
        if (state === 'PoweredOn') {
          this.scanAndConnect();
          subscription.remove();
        }
      }, true);
         */
    }

    startScan = () => {

        let cap = new PillsyCap('Pillsy');   // EB:D7:0A:27:64:63
        console.log('startScan - begin');

        const delay = t => new Promise(resolve => setTimeout(resolve, t));

        cap.connect()
            .then((device)=>{
                if(device != null){
                    console.log(`Device ID : ${device.id}`);
                    cap.keepAlive();
                    // cap.beep();
                    cap.blink();
                    cap.readLogs();
                    // cap.readBattery();
                    // cap.readTime();
                    // cap.drop();
                }
                else{
                    console.log('Device error')
                }
            })
            .catch((error)=>{
                console.log(`Device error : ${error}`)
            })


        /*
        scan.find(async (err, cap) => {
            if (err){
                console.error('Error processing pillsycap: ', err);

                throw err;
            }
            else{
                if (!cap){
                    console.warn('Did not find any pillsy caps....');

                    return;
                }
                else{
                    console.log('successfully processed pillsycap, now keep alive and set time..');

                    cap.keepAlive();
                    cap.readTime();
                    cap.readAlarm();

                    cap.readLogs(log => {
                        log.print();
                    });

                    await delay(1000);
                    cap.setTime();
                    await delay(1000);
                    cap.beep();
                    await delay(1000);
                    cap.clearAlarms();
                    await delay(1000);
                    cap.setPingInterval(15);
                    await delay(1000);
                    cap.drop();

                    console.log(chalk.yellow("finished processing this cap, exit..."));
                    process.exit(1);
                }
            }
        });
         */
    }




    scanAndConnect() {
        this.manager.startDeviceScan(null, null, (error, device) => {
            if (error) {
                // Handle error (scanning will be stopped automatically)
                return
            }

            // Check if it is a device you are looking for based on advertisement data
            // or other criteria.
            console.log(`Device name : ${device.name}`);
            if (device.name === 'Pillsy') {


                device.connect()
                    .then((device) => {
                        return device.discoverAllServicesAndCharacteristics(device.id)
                    })
                    .then((device) => {
                        // Do work on device with services and characteristics
                        this.manager.servicesForDevice(device.id)
                            .then((services) => {
                                // console.log(service)
                                services.map((service) => {
                                    //0000fe09-0000-1000-8000-00805f9b34fb
                                    service.characteristics()
                                        .then((characteristics)=>{
                                            characteristics.map((char)=>{
                                                //console.log(`Characteristic : ${char}`)
                                                this.manager.readCharacteristicForDevice(device.id, service.uuid,char.uuid)
                                                    .then((data)=>{
                                                        console.log('*******************************************');
                                                        console.log(`-- Service ID : ${service.uuid}`);
                                                        console.log(`-- Character ID : ${data.uuid}`);
                                                        console.log(`-- Character data : ${atob(data.value)}`);
                                                        console.log('*******************************************');
                                                    })
                                                    .catch((error)=>{
                                                        console.log(`** Character error : ${error}`)
                                                    })
                                            })
                                        })
                                        .catch((error)=>{
                                            console.log(`** Characteristics error : ${error}`)
                                        })
                                    console.log(`** Service UUID : ${service.uuid}`)
                                })
                            })
                            .catch((error) => {
                                console.log(`** Service error : ${error}`)
                            })
                    })
                    .catch((error) => {
                        // Handle errors
                    });


                // Stop scanning as it's not necessary if you are scanning for one device.
                this.manager.stopDeviceScan();

                // Proceed with connection.
            }
        });
    }

    render() {
        return (
            <View style={styles.container}>

            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
});
