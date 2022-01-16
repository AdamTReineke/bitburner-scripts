import { writeFile } from 'fs';
import * as https from 'https';
import path from 'path';

https.get('https://raw.githubusercontent.com/danielyxie/bitburner/dev/src/ScriptEditor/NetscriptDefinitions.d.ts', (response) => {
    let data = '';

    // called when a data chunk is received.
    response.on('data', (chunk) => {
        data += chunk;
    });

    // called when the complete response is received.
    response.on('end', () => {
        writeFile(path.resolve() + "/types.d.ts", data.replace(/export interface/g, "interface").replace(/export enum/g, "enum"), () => {
            console.log('file acquired');
        });
    });

}).on("error", (error) => {
    console.log("Error: " + error.message);
});