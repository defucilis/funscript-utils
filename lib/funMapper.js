"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderActions = exports.renderHeatmap = exports.getColor = exports.formatColor = exports.heatmapColors = void 0;
var utils_1 = require("./utils");
exports.heatmapColors = [
    [0, 0, 0],
    [30, 144, 255],
    [34, 139, 34],
    [255, 215, 0],
    [220, 20, 60],
    [147, 112, 219],
    [37, 22, 122],
];
/**
 * Converts a three-element RGB array of colors into a CSS rgb color string
 * @param  {ColorGroup} c - Array of three color (RGB)
 * @param  {number} alpha=1 - Optional alpha value
 * @returns {string} CSS color string
 */
var formatColor = function (c, alpha) {
    if (alpha === void 0) { alpha = 1; }
    return "rgb(" + c[0] + ", " + c[1] + ", " + c[2] + ", " + alpha + ")";
};
exports.formatColor = formatColor;
var getLerpedColor = function (colorA, colorB, t) { return colorA.map(function (c, index) { return c + (colorB[index] - c) * t; }); };
var getAverageColor = function (colors) {
    var colorSum = colors.reduce(function (acc, c) { return [acc[0] + c[0], acc[1] + c[1], acc[2] + c[2]]; }, [0, 0, 0]);
    return [colorSum[0] / colors.length, colorSum[1] / colors.length, colorSum[2] / colors.length];
};
/**
 * Converts a intensity/speed value into a heatmap color. Adapted from Lucifie's heatmap generation script.
 * @param  {number} intensity - Speed value, in 0-100 movements per second
 * @returns Three-element array of R, G and B color values (0-255)
 */
var getColor = function (intensity) {
    //console.log(intensity);
    var stepSize = 120;
    if (intensity <= 0)
        return exports.heatmapColors[0];
    if (intensity > 5 * stepSize)
        return exports.heatmapColors[6];
    intensity += stepSize / 2.0;
    try {
        return getLerpedColor(exports.heatmapColors[Math.floor(intensity / stepSize)], exports.heatmapColors[1 + Math.floor(intensity / stepSize)], Math.min(1.0, Math.max(0.0, (intensity - Math.floor(intensity / stepSize) * stepSize) / stepSize)));
    }
    catch (error) {
        //console.error("Failed on intensity", intensity, error);
        return [0, 0, 0];
    }
};
exports.getColor = getColor;
var defaultHeatmapOptions = {
    showStrokeLength: true,
    gapThreshold: 5000,
};
/**
 * Renders a heatmap into a provided HTML5 Canvas
 * @param  {HTMLCanvasElement} canvas - HTML5 Canvas to be rendered into
 * @param  {Funscript} script - Funscript to render the heatmap from
 * @param  {HeatmapOptions|undefined=undefined} options - Rendering options
 */
var renderHeatmap = function (canvas, script, options) {
    if (options === void 0) { options = undefined; }
    if (options)
        options = __assign(__assign({}, defaultHeatmapOptions), options);
    else
        options = __assign({}, defaultHeatmapOptions);
    var width = canvas.width;
    var height = canvas.height;
    var ctx = canvas.getContext('2d');
    if (!ctx)
        return;
    if (options.background) {
        ctx.fillStyle = options.background;
        ctx.fillRect(0, 0, width, height);
    }
    else {
        ctx.clearRect(0, 0, width, height);
    }
    var msToX = width / script.actions.slice(-1)[0].at;
    var colorAverageList = [];
    var intensityList = [];
    var posList = [];
    var yMaxList = [script.actions[0].pos];
    var yMinList = [script.actions[0].pos];
    var yMin = 0;
    var yMax = 0;
    var yWindowSize = 15;
    var xWindowSize = 50;
    var lastX = 0;
    for (var i = 1; i < script.actions.length; i++) {
        var x = Math.floor(msToX * script.actions[i].at);
        if (options.gapThreshold && script.actions[i].at - script.actions[i - 1].at > options.gapThreshold) {
            colorAverageList = [];
            intensityList = [];
            posList = [];
            yMaxList = [script.actions[i].pos];
            yMinList = [script.actions[i].pos];
            lastX = x;
            continue;
        }
        var intensity = utils_1.getSpeed(script.actions[i - 1], script.actions[i]);
        intensityList.push(intensity);
        colorAverageList.push(exports.getColor(intensity));
        posList.push(script.actions[i].pos);
        if (intensityList.length > xWindowSize)
            intensityList = intensityList.slice(1);
        if (colorAverageList.length > xWindowSize)
            colorAverageList = colorAverageList.slice(1);
        if (posList.length > yWindowSize)
            posList = posList.slice(1);
        var averageIntensity = intensityList.reduce(function (acc, cur) { return acc + cur; }, 0) / intensityList.length;
        //const averageColor = getAverageColor(colorAverageList);
        var averageColor = exports.getColor(averageIntensity);
        var sortedPos = __spreadArray([], posList).sort(function (a, b) { return a - b; });
        var bottomHalf = sortedPos.slice(0, sortedPos.length / 2);
        var topHalf = sortedPos.slice(sortedPos.length / 2);
        var averageBottom = bottomHalf.reduce(function (acc, cur) { return acc + cur; }, 0) / bottomHalf.length;
        var averageTop = topHalf.reduce(function (acc, cur) { return acc + cur; }, 0) / topHalf.length;
        yMaxList.push(script.actions[i].pos);
        yMinList.push(script.actions[i].pos);
        yMin = yMinList.reduce(function (acc, cur) { return Math.min(acc, cur); }, 100);
        yMax = yMaxList.reduce(function (acc, cur) { return Math.max(acc, cur); }, 0);
        if (yMinList.length > yWindowSize)
            yMinList = yMinList.slice(1);
        if (yMaxList.length > yWindowSize)
            yMaxList = yMaxList.slice(1);
        var y2 = height * (averageBottom / 100.0);
        var y1 = height * (averageTop / 100.0);
        ctx.fillStyle = exports.formatColor(averageColor, 1);
        if (options.showStrokeLength) {
            ctx.fillRect(lastX, height - y2, x - lastX, y2 - y1);
        }
        else {
            ctx.fillRect(lastX, 0, x - lastX, height);
        }
        lastX = x;
    }
};
exports.renderHeatmap = renderHeatmap;
var defaultActionsOptions = {
    clear: true,
    background: "#000",
    lineColor: "#FFF",
    lineWeight: 3,
    startTime: 0,
    onlyTimes: false,
    onlyTimeColor: "rgba(255,255,255,0.1)",
    offset: { x: 0, y: 0 }
};
/**
 * Renders a funscript preview onto a provided HTML5 Canvas
 * @param  {HTMLCanvasElement} canvas - HTML5 Canvas to be rendered into
 * @param  {Funscript} script - Funscript to generate preview from
 * @param  {ActionsOptions} options? - Rendering options
 */
var renderActions = function (canvas, script, options) {
    var drawPath = function (ctx, funscript, opt) {
        var position = opt.startTime || 0;
        var duration = opt.duration || (script.metadata ? script.metadata.duration || 10 : 10);
        var scriptDuration = funscript.actions.slice(-1)[0].at;
        var min = Math.max(0, scriptDuration * position - duration * 0.5);
        var max = min + duration;
        ctx.beginPath();
        var first = true;
        funscript.actions
            .filter(function (a, i) {
            var prev = i === 0 ? a : funscript.actions[i - 1];
            var next = i === funscript.actions.length - 1 ? a : funscript.actions[i + 1];
            return next.at > min && prev.at < max;
        })
            .forEach(function (action) {
            var x = width * (action.at - min) / duration + (opt && opt.offset ? opt.offset.x : 0);
            var y = height - (action.pos / 100) * height + (opt && opt.offset ? opt.offset.y : 0);
            if (first)
                ctx.moveTo(x, y);
            else
                ctx.lineTo(x, y);
            if (opt && opt.onlyTimes)
                ctx.fillRect(x - 1, 0, 2, height);
            first = false;
        });
        if (!opt.onlyTimes)
            ctx.stroke();
    };
    var width = canvas.width;
    var height = canvas.height;
    var ctx = canvas.getContext('2d');
    if (!ctx)
        return;
    options = __assign(__assign({}, defaultActionsOptions), options);
    if (options.clear)
        ctx.clearRect(0, 0, width, height);
    if (options.clear) {
        ctx.fillStyle = options.background || "#000";
        ctx.fillRect(0, 0, width, height);
    }
    ctx.lineWidth = options.lineWeight || 3;
    ctx.strokeStyle = options.lineColor || "#FFF";
    ctx.fillStyle = options.onlyTimeColor || "rgba(255,255,255,0.1)";
    drawPath(ctx, script, options);
};
exports.renderActions = renderActions;
//# sourceMappingURL=funMapper.js.map