import { Funscript } from "./types";
declare type ColorGroup = number[];
export declare const heatmapColors: ColorGroup[];
/**
 * Converts a three-element RGB array of colors into a CSS rgb color string
 * @param  {ColorGroup} c - Array of three color (RGB)
 * @param  {number} alpha=1 - Optional alpha value
 * @returns {string} CSS color string
 */
export declare const formatColor: (c: ColorGroup, alpha?: number) => string;
/**
 * Converts a intensity/speed value into a heatmap color. Adapted from Lucifie's heatmap generation script.
 * @param  {number} intensity - Speed value, in 0-100 movements per second
 * @returns Three-element array of R, G and B color values (0-255)
 */
export declare const getColor: (intensity: number) => ColorGroup;
export interface HeatmapOptions {
    background?: string;
    showStrokeLength?: boolean;
    gapThreshold?: number;
}
/**
 * Renders a heatmap into a provided HTML5 Canvas
 * @param  {HTMLCanvasElement} canvas - HTML5 Canvas to be rendered into
 * @param  {Funscript} script - Funscript to render the heatmap from
 * @param  {HeatmapOptions|undefined=undefined} options - Rendering options
 */
export declare const renderHeatmap: (canvas: HTMLCanvasElement, script: Funscript, options?: HeatmapOptions | undefined) => void;
export interface ActionsOptions {
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
/**
 * Renders a funscript preview onto a provided HTML5 Canvas
 * @param  {HTMLCanvasElement} canvas - HTML5 Canvas to be rendered into
 * @param  {Funscript} script - Funscript to generate preview from
 * @param  {ActionsOptions} options? - Rendering options
 */
export declare const renderActions: (canvas: HTMLCanvasElement, script: Funscript, options?: ActionsOptions | undefined) => void;
export {};
//# sourceMappingURL=funMapper.d.ts.map