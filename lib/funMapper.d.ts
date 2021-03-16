import { Funscript } from "./types";
declare type ColorGroup = number[];
export declare const heatmapColors: ColorGroup[];
export declare const formatColor: (c: ColorGroup, alpha?: number) => string;
export declare const getColor: (intensity: number) => number[];
export interface HeatmapOptions {
    background?: string;
    showStrokeLength?: boolean;
}
declare const renderHeatmap: (canvas: HTMLCanvasElement, script: Funscript, options?: HeatmapOptions | undefined) => void;
export default renderHeatmap;
//# sourceMappingURL=funMapper.d.ts.map