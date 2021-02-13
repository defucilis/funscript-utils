export interface Action {
    at: number;
    pos: number;
    subActions?: Action[];
    type?: "first" | "last" | "pause" | "prepause" | "apex";
}
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
export declare const getHalfSpeedScript: (script: {
    actions: Action[];
}, options: Options) => {
    actions: Action[];
};
//# sourceMappingURL=index.d.ts.map