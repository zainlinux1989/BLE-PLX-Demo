'use strict';

const pillsy = {
    uuid: 'fe09',
    characteristics: {
        admin:  '00000000-8ff8-4d84-896a-8eaa1c28fe43', // write
        alarm:  '00000001-8ff8-4d84-896a-8eaa1c28fe43', // write/read
        log:    '00000002-8ff8-4d84-896a-8eaa1c28fe43', // notify
        time:   '00000003-8ff8-4d84-896a-8eaa1c28fe43', // write/read
        beep:   '00000004-8ff8-4d84-896a-8eaa1c28fe43'  // write/read
    }
};

const battery = {
    uuid: '180f',
    characteristics: {
        level: '2a19'
    }
};

const deviceInfo = {
    uuid: '180a',
    characteristics: {
        modelNumber     : '2a24',
        firmwareRevision: '2a26',
        hardwareRevision: '2a27',
        softwareRevision: '2a28',
        manufacturerName: '2a29'
    }
};

const dfu = {
    uuid: '00001530-1212-efde-1523-785feabcd123',
    characteristics: {
        controlState : '00001531-1212-efde-1523-785feabcd123',
        packet       : '00001532-1212-efde-1523-785feabcd123',
        version      : '00001534-1212-efde-1523-785feabcd123'
    }
};

const services = {
    pillsy: pillsy,
    battery: battery,
    deviceInfo: deviceInfo,
    dfu: dfu
};

const adminKeys = {
    keepAlive:  0x53,
    disconnect: 0x54,
    hibernate:  0x55,
    forceCrash: 0x56,

    volume: {
        off:    0x60,
        low:    0x61,
        medium: 0x62,
        high:   0x63,
    },

    pingInterval: {
        // min:key
        0:   0x70, // off
        1:   0x71,
        5:   0x72,
        10:  0x73,
        15:  0x74, // default
        30:  0x75,
        60:  0x76,
        90:  0x77,
        120: 0x78,
        180: 0x79,
        240: 0x7A
    },
};

const beepKeys = {
    beep: 0x1,
    blink: 0x2,
    warn: 0x4,
    chirp: 0x8,
};


module.exports = {
    services: services,
    main: [pillsy.uuid],
    all: [pillsy.uuid, battery.uuid, deviceInfo.uuid, dfu.uuid],
    adminKeys: adminKeys,
    beepKeys: beepKeys
};
