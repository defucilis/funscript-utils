import { Funscript } from "./types";
/**
 * Adds a fixed time offset to all actions in a funscript
 * @param  {Funscript} funscript - The funscript to offset
 * @param  {number} offset - The offset to apply, in milliseconds
 * @returns The offset funscript
 */
export declare const getOffsetScript: (funscript: Funscript, offset: number) => Funscript;
/**
 * Remaps all funscript positions to a newly defined range
 * @param  {Funscript} funscript - The funscript to remap
 * @param  {number} min - The new minimum position
 * @param  {number} max - The new maximum position
 * @returns The remapped funscript
 */
export declare const getRemappedScript: (funscript: Funscript, min: number, max: number) => Funscript;
/**
 * Limits a funscript's position values to ensure that it doesn't exceed a given maximum speed value
 * @param  {Funscript} funscript - The funscript to limit
 * @param  {"launch"|"handy"|number} maxSpeed - The time, in milliseconds, it takes for the device to complete one full movement (one-direction). Known device values are included as string options
 * @returns The limited funscript
 */
export declare const getLimitedScript: (funscript: Funscript, maxSpeed: "launch" | "handy" | number) => Funscript;
//# sourceMappingURL=funTweaker.d.ts.map