import fs from 'fs';
import path from 'path';

const ERROR_FILE_PATH = path.resolve('./services/errors.json');

// Load once at startup
let ERROR_MAP = {};

try {
  ERROR_MAP = JSON.parse(fs.readFileSync(ERROR_FILE_PATH, 'utf-8'));
} catch (err) {
  console.error('❌ Could not load errors.json');
}

export class CustomError extends Error {
  constructor(code) {
    console.log("Throwing custom error with code:", ERROR_MAP[0][code]);
    const knownError = ERROR_MAP[0][code];

    console.log(knownError,"knownError");

    // If error exists in error list
    if (knownError) {
      super(knownError.error);
      this.statusCode = knownError.code;
      this.code = code;
    } 
    // Unknown error
    else {
      super('Something went wrong');
      this.statusCode = 500;
      this.code = 'INTERNAL_ERROR';
    }

    this.name = 'CustomError';
  }
}

// helper function
export const throwCustomError = (code) => {
  throw new CustomError(code);
};
