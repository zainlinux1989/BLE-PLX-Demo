'use strict';

let chalk = require('chalk');
let scan  = require('./src/modules/ble/scan');

module.exports = function() {

    let startScan = () => {
        console.log('startScan - begin');

        const delay = t => new Promise(resolve => setTimeout(resolve, t));

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
    }

    startScan();
};
