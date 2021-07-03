import csv from 'csv-parser';
import fs from 'fs';

export default function parseCSV(path) {
    const results = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(path)
            .pipe(csv())
            .on('data', (row) => results.push(row))
            .on('end', () => resolve({data: results}))
            .on('error', error => reject(error));
    });
}
