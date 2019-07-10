'use strict';

module.exports = class PillsyLog {

    constructor(data) {


        if (data.byteLength != 16) {
            console.log("Invalid Log Record");
            return
        }

        // Type:        [Start] # bytes
        // Signature:   [0]     1 byte
        // Type:        [1]     1 byte
        // - UNUSED -   [2]     2 bytes
        // Timestamp:   [4]     4 bytes
        // Payload:     [8]     8 bytes

        let signature = data.readUInt8(0);
        let char = String.fromCharCode(signature);
        if (char === '!') {
            // console.log("Read Caboose");
            this.type = "Caboose"
        } else if (char != '@') {
            console.log("Invalid Signature");
            return
        }

        let logType = data.readUInt8(1);
        let type = String.fromCharCode(logType);

        let time = data.readUInt32LE(4, true); // little endian
        this.timestamp = new Date(time * 1000);

        let payload = data.slice(8);

        this.data = {}

        switch (type) {
        case '1': // Lid Open / Close
            this.type = "Lid"
            let lid = payload.readUInt8(0);
            var state = lid + "?";

            switch (lid) {
            case 0x00:
                state = "Open";
                break;
            case 0x01:
                state = "Close";
                break;
            case 0x02:
                state = "Tap";
                break;
            case 0x03:
                state = "Double_Tap";
                break;
            default:
                break;
            }

            this.data.state = state
            break;

        case '2': // State Change
            this.type = "State"
            let int = payload.readUInt8(0);
            var state = int + "?";

            switch (int) {
            case 0x00:
                state = "App Start";
                break;
            case 0x01:
                state = "Hibernate";
                break;
            case 0x02:
                state = "Wakeup";
                break;
            case 0x03:
                state = "Activated";
                break;
            case 0x04:
                state = "Alarm";
                break;
            case 0x05:
                state = "Ping";
                break;
            }
            this.data.state = state

            break;

        case '3': // Fault
            this.type = "Fault"

            let error = payload.readUInt32LE(0);
            let address = payload.readUInt32LE(4);

            this.data = {
                "error": error,
                "address": address
            }

            break;

        case '4': // Battery
            this.type = "Battery"
            let voltsUnloaded = payload.readUInt16LE(0);
            let loadedVolts = payload.readUInt16LE(2);

            this.data = {
                "voltsUnloaded": voltsUnloaded,
                "loadedVolts": loadedVolts
            }

            break;

        default:
            break;
        }
    }

    print() {
        if (this.type == "Caboose") {
            return
        }
        console.log("%s %s", this.type, this.timestamp, this.data);
    }
}
