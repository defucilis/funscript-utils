import { getIntensity } from "./funConverter";
import { Action, Funscript } from "./types";

//colors from Lucife
type ColorGroup = number[];
export const heatmapColors: ColorGroup[] = [
    [0, 0, 0],
    [30, 144, 255],
    [34, 139, 34],
    [255, 215, 0],
    [220, 20, 60],
    [147, 112, 219],
    [37, 22, 122],
]

export const formatColor = (c: ColorGroup, alpha = 1) => {
    return "rgb(" + c[0] + ", " + c[1] + ", " + c[2] + ", " + alpha + ")";
}

const getLerpedColor = (colorA: ColorGroup, colorB: ColorGroup, t: number) => colorA.map((c, index) => c + (colorB[index] - c) * t);

const getAverageColor = (colors: ColorGroup[]) => {
    const colorSum = colors.reduce((acc, c) => [acc[0] + c[0], acc[1] + c[1], acc[2] + c[2]], [0, 0, 0]);
    return [colorSum[0] / colors.length, colorSum[1] / colors.length, colorSum[2] / colors.length];   
}

//function adapted from Lucife
export const getColor = (intensity: number) => {
    //console.log(intensity);
    const stepSize = 60;
    if(intensity <= 0) return heatmapColors[0];
    if(intensity > 5 * stepSize) return heatmapColors[6];
    intensity += stepSize / 2.0;
    try {
        return getLerpedColor(
            heatmapColors[Math.floor(intensity / stepSize)],
            heatmapColors[1 + Math.floor(intensity / stepSize)],
            Math.min(1.0, Math.max(0.0, (intensity - Math.floor(intensity / stepSize) * stepSize) / stepSize))
        );
    } catch(error) {
        console.error("Failed on intensity", intensity, error);
        return [0, 0, 0];
    }
}

export interface HeatmapOptions {
    background?: string;
    showStrokeLength?: boolean;
}
const defaultHeatmapOptions: HeatmapOptions = {
    showStrokeLength: true
}

const renderHeatmap = (canvas: HTMLCanvasElement, script: Funscript, options: HeatmapOptions | undefined = undefined) => {
    if(options) options = {...defaultHeatmapOptions, ...options};
    else options = {...defaultHeatmapOptions};

    const width = canvas.width;
    const height = canvas.height;
    const ctx = canvas.getContext('2d');
    if(!ctx) return;

    if(options.background) {
        ctx.fillStyle = options.background;
        ctx.fillRect(0, 0, width, height);
    } else {
        ctx.clearRect(0, 0, width, height);
    }

    const msToX = width / script.actions.slice(-1)[0].at;

    let colorAverageList: ColorGroup[] = [];
    let intensityList: number[] = [];
    let posList: number[] = [];
    let yMaxList = [script.actions[0].pos];
    let yMinList = [script.actions[0].pos];
    let yMin = 0;
    let yMax = 0;
    const yWindowSize = 15;
    const xWindowSize = 50;
    let lastX = 0;
    for(let i = 1; i < script.actions.length; i++) {
        const intensity = getIntensity(script.actions[i - 1], script.actions[i]);
        intensityList.push(intensity);
        colorAverageList.push(getColor(intensity));
        posList.push(script.actions[i].pos);
        
        if(intensityList.length > xWindowSize) intensityList = intensityList.slice(1);
        if(colorAverageList.length > xWindowSize) colorAverageList = colorAverageList.slice(1);
        if(posList.length > yWindowSize) posList = posList.slice(1);

        const averageIntensity = intensityList.reduce((acc, cur) => acc + cur, 0) / intensityList.length;
        //const averageColor = getAverageColor(colorAverageList);
        const averageColor = getColor(averageIntensity);
        const sortedPos = [...posList].sort((a, b) => a - b);
        const bottomHalf = sortedPos.slice(0, sortedPos.length / 2);
        const topHalf = sortedPos.slice(sortedPos.length / 2);
        const averageBottom = bottomHalf.reduce((acc, cur) => acc + cur, 0) / bottomHalf.length;
        const averageTop = topHalf.reduce((acc, cur) => acc + cur, 0) / topHalf.length;

        yMaxList.push(script.actions[i].pos);
        yMinList.push(script.actions[i].pos);
        yMin = yMinList.reduce((acc, cur) => Math.min(acc, cur), 100);
        yMax = yMaxList.reduce((acc, cur) => Math.max(acc, cur), 0);

        if(yMinList.length > yWindowSize) yMinList = yMinList.slice(1);
        if(yMaxList.length > yWindowSize) yMaxList = yMaxList.slice(1);


        const x = Math.floor(msToX * script.actions[i].at);

        let y2 = height * (averageBottom / 100.0);
        let y1 = height * (averageTop / 100.0);

        ctx.fillStyle = formatColor(averageColor, 1);
        if(options.showStrokeLength) {
            ctx.fillRect(lastX, height - y2, x - lastX, y2 - y1);
        } else {
            ctx.fillRect(lastX, 0, x-lastX, height);
        }

        lastX = x;
    }
}

export default renderHeatmap;