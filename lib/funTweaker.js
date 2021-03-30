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
exports.getRemappedScript = exports.getOffsetScript = void 0;
var getOffsetScript = function (funscript, offset) {
    if (offset < -1 * funscript.actions.slice(-1)[0].at)
        return funscript;
    return __assign(__assign({}, funscript), { actions: funscript.actions.map(function (action) {
            return __assign(__assign({}, action), { at: action.at + offset });
        }).filter(function (action) { return action.at >= 0; }) });
};
exports.getOffsetScript = getOffsetScript;
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
//# sourceMappingURL=funTweaker.js.map