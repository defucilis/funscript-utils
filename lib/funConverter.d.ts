import { Funscript } from "./types";
/**
 * Converts a JSON string into a funscript object, computes metadata, and performs cleanup
 * @param  {string} funscriptJson - JSON string to be converted into a funscript object
 * @returns Converted funscript object
 */
export declare const getFunscriptFromString: (funscriptJson: string) => Funscript;
/**
 * Adds metadata (average speed and duration) to a funscript, as well as make sure that its actions are in the right order
 * @param  {Funscript} funscript - Funscript to be processed
 * @returns Processed funscript with metadata
 */
export declare const addFunscriptMetadata: (funscript: Funscript) => Funscript;
/**
 * Converts a funscript into a CSV blob suitable for upload to a Handy
 * @param  {string} funscript - Funscript to be converted
 * @returns Plaintext blob ready to be uploaded to a Handy
 */
export declare const convertFunscriptToCsv: (funscript: string) => Blob;
//# sourceMappingURL=funConverter.d.ts.map