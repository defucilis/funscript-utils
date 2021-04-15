import { Action, Funscript } from './types';
export interface Options {
    removeShortPauses?: boolean;
    shortPauseDuration?: number;
    matchFirstDownstroke?: boolean;
    matchGroupEndPosition?: boolean;
    resetAfterPause?: boolean;
    debugMode?: boolean;
}
/**
 * Takes in a group of actions and creates a half-speed version of that group, without losing cadence
 * @param  {Action[]} actionGroup - The group to halve the speed of
 * @param  {Options} options - Options to change the behaviour of the speed-halving
 */
export declare const getHalfSpeedGroup: (actionGroup: Action[], options: Options) => {
    pos: number;
    at: number;
    subActions?: Action[] | undefined;
    type?: "first" | "last" | "pause" | "prepause" | "apex" | undefined;
}[];
/**
 * Creates a half-speed version of a script without sacrificing cadence by removing every second action (ish)
 * @param  {Funscript} script - The script to halve the speed of
 * @param  {Options} options - Options to configure how the halving is done
 * @returns The half-speed funscript
 */
export declare const getHalfSpeedScript: (script: Funscript, options: Options) => Funscript;
//# sourceMappingURL=funHalver.d.ts.map