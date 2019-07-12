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
import DatabaseManager from './src/database/DatabaseManager';

export default class App extends Component {
    constructor() {
        super();
        this.manager = new BleManager();
    }
    componentWillMount() {

        // Database work START
        let object = new DatabaseManager();

        // Insert Object
        object.createRecord();        // pass parameters from here

        console.log('-----------------')

        // Read All objects, before
        for (let o of object.readRecord()) {
            console.log(`${o.id}  ${o.deviceId} ${o.platform}`);
        }

        console.log('-----------------')
        // Update object
        // object.updateRecord()
        // Delete object
        // object.deleteAllRecords();

        console.log('-----------------')

        // Read All objects after update/delete
        for (let o of object.readRecord()) {
            console.log(`${o.id}  ${o.deviceId} ${o.platform}`);
        }

        object.close();
        // Database work END


        // use Later
        /*
        this.startScan();
        */

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
        let address = 'EB:D7:0A:27:64:63';   // EB:D7:0A:27:64:63   address of current device
        let cap = new PillsyCap(address);
        console.log('startScan - begin');

        const delay = t => new Promise(resolve => setTimeout(resolve, t));

        cap.connect()
            .then((device)=>{
                if(device != null){
                    console.log(`Connected Device Address(ID) : ${address}`);
                    cap.keepAlive();
                    // cap.beep();
                    // cap.blink();
                    cap.readLogs();
                    cap.readBattery();
                    // cap.readTime();
                    cap.readDeviceInfo();
                    cap.drop();
                }
                else{
                    console.log('Device error')
                }
            })
            .catch((error)=>{
                console.log(`Device error : ${error}`)
            })
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
