import React, {Component} from 'react';
import {BleManager} from 'react-native-ble-plx';

export default class Scan extends Component
{
    constructor(props){
        super(props);
        this.manager = new BleManager();
    }

    componentWillMount(): void {
        const subscription = this.manager.onStateChange((state) => {
            if (state === 'PoweredOn') {
                subscription.remove();
            }
        }, true);
    }

    scanDevice = (callback) => {
        this.manager.startDeviceScan(null, null, (error, device) => {
            if(error){
                this.manager.stopDeviceScan();
                callback(error,null)
            }
            // Check if it is a device you are looking for based on advertisement data
            // or other criteria.
            console.log(`Device name : ${device.name}`);
            if (device.name === 'Pillsy') {

                this.manager.stopDeviceScan();

                device.connect()
                    .then((device) => {
                        let cap = new PillsyCap(device);
                        callback(null,cap)
                    })
                    .catch((error) => {
                        // Handle errors
                        callback(error,null)
                    });

            }
        })
    }

}

