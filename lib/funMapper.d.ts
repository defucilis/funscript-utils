import { Funscript } from "./types";
declare type ColorGroup = number[];
export declare const heatmapColors: ColorGroup[];
export declare const formatColor: (c: ColorGroup, alpha?: number) => string;
export declare const getColor: (intensity: number) => number[];
export interface HeatmapOptions {
    background?: string;
    showStrokeLength?: boolean;
}
export declare const renderHeatmap: (canvas: HTMLCanvasElement, script: Funscript, options?: HeatmapOptions | undefined) => void;
interface ActionsOptions {
    clear?: boolean;
    background?: string;
    lineColor?: string;
    lineWeight?: number;
    startTime?: number;
    duration?: number;
    onlyTimes?: boolean;
    onlyTimeColor?: string;
    offset?: {
        x: number;
        y: number;
    };
}
export declare const renderActions: (canvas: HTMLCanvasElement, script: Funscript, options?: ActionsOptions | undefined) => void;
export {};
//# sourceMappingURL=funMapper.d.ts.map