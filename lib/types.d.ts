export interface Funscript {
    actions: Action[];
    fuMetadata?: FunscriptMetadata;
}
export interface FunscriptMetadata {
    duration: number;
    averageIntensity: number;
}
export interface Action {
    at: number;
    pos: number;
    subActions?: Action[];
    type?: "first" | "last" | "pause" | "prepause" | "apex";
}
//# sourceMappingURL=types.d.ts.map