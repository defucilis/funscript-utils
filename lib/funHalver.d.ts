import { Action, Funscript } from './types';
export interface Options {
    removeShortPauses?: boolean;
    shortPauseDuration?: number;
    matchFirstDownstroke?: boolean;
    matchGroupEndPosition?: boolean;
    resetAfterPause?: boolean;
    debugMode?: boolean;
}
export declare const getActionGroups: (actions: Action[]) => Action[][];
export declare const getHalfSpeedGroup: (actionGroup: Action[], options: Options) => Action[];
export declare const getHalfSpeedScript: (script: Funscript, options: Options) => Funscript;
//# sourceMappingURL=funHalver.d.ts.map