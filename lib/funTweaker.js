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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLimitedScript = exports.getRemappedScript = exports.getOffsetScript = void 0;
var utils_1 = require("./utils");
/**
 * Adds a fixed time offset to all actions in a funscript
 * @param  {Funscript} funscript - The funscript to offset
 * @param  {number} offset - The offset to apply, in milliseconds
 * @returns The offset funscript
 */
var getOffsetScript = function (funscript, offset) {
    if (offset < -1 * funscript.actions.slice(-1)[0].at)
        return funscript;
    return __assign(__assign({}, funscript), { actions: funscript.actions.map(function (action) {
            return __assign(__assign({}, action), { at: action.at + offset });
        }).filter(function (action) { return action.at >= 0; }) });
};
exports.getOffsetScript = getOffsetScript;
/**
 * Remaps all funscript positions to a newly defined range
 * @param  {Funscript} funscript - The funscript to remap
 * @param  {number} min - The new minimum position
 * @param  {number} max - The new maximum position
 * @returns The remapped funscript
 */
var getRemappedScript = function (funscript, min, max) {
    var currentMin = 100;
    var currentMax = 0;
    funscript.actions.forEach(function (action) {
        currentMin = Math.min(currentMin, action.pos);
        currentMax = Math.max(currentMax, action.pos);
    });
    return __assign(__assign({}, funscript), { actions: funscript.actions.map(function (action) {
            var newPos = min + ((action.pos - currentMin) / (currentMax - currentMin)) * (max - min);
            return __assign(__assign({}, action), { pos: Math.max(0, Math.min(100, Math.round(newPos))) });
        }) });
};
exports.getRemappedScript = getRemappedScript;
/**
 * Limits a funscript's position values to ensure that it doesn't exceed a given maximum speed value
 * @param  {Funscript} funscript - The funscript to limit
 * @param  {"launch"|"handy"|number} maxSpeed - The time, in milliseconds, it takes for the device to complete one full movement (one-direction). Known device values are included as string options
 * @returns The limited funscript
 */
var getLimitedScript = function (funscript, maxSpeed) {
    if (!funscript || !funscript.actions || funscript.actions.length === 0)
        return funscript;
    var maxSpeedValue = 0;
    switch (maxSpeed) {
        case "launch":
            maxSpeedValue = 377;
            break;
        case "handy":
            maxSpeedValue = 432;
            break;
        default:
            maxSpeedValue = maxSpeed;
            break;
    }
    var newActions = [funscript.actions[0]];
    for (var i = 1; i < funscript.actions.length; i++) {
        var action = funscript.actions[i];
        var lastAction = newActions[i - 1];
        var actionSpeed = utils_1.getSpeed(action, lastAction);
        if (actionSpeed <= maxSpeedValue) {
            newActions.push(action);
            continue;
        }
        var newPos = action.pos;
        if (action.pos < lastAction.pos) {
            newPos = lastAction.pos - maxSpeedValue * (action.at - lastAction.at) / 1000;
        }
        else {
            newPos = lastAction.pos + maxSpeedValue * (action.at - lastAction.at) / 1000;
        }
        newActions.push(__assign(__assign({}, action), { pos: newPos }));
    }
    return __assign(__assign({}, funscript), { actions: newActions });
};
exports.getLimitedScript = getLimitedScript;
//# sourceMappingURL=funTweaker.js.map