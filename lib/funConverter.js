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
exports.convertFunscriptToCsv = exports.addFunscriptMetadata = exports.getIntensity = exports.getFunscriptFromString = void 0;
var getFunscriptFromString = function (funscript) {
    var script = JSON.parse(funscript);
    return exports.addFunscriptMetadata(script);
};
exports.getFunscriptFromString = getFunscriptFromString;
var getIntensity = function (a1, a2) {
    try {
        if (a2.at < a1.at) {
            var temp = a2;
            a2 = a1;
            a1 = temp;
        }
        var slope = Math.min(20, 500.0 / (a2.at - a1.at));
        return slope * Math.abs(a2.pos - a1.pos);
    }
    catch (error) {
        console.error("Failed on actions", a1, a2, error);
        return 0;
    }
};
exports.getIntensity = getIntensity;
var addFunscriptMetadata = function (funscript) {
    var output = __assign({}, funscript);
    output.actions = output.actions.sort(function (a, b) { return a.at - b.at; });
    var duration = output.actions.slice(-1)[0].at;
    var averageIntensity = output.actions.reduce(function (acc, action, index) {
        return index === 0 ? acc : acc + exports.getIntensity(output.actions[index - 1], output.actions[index]);
    }, 0) / (output.actions.length - 1);
    output.fuMetadata = {
        duration: duration,
        averageIntensity: averageIntensity,
    };
    return output;
};
exports.addFunscriptMetadata = addFunscriptMetadata;
var convertFunscriptToCsv = function (funscript) {
    var script = JSON.parse(funscript);
    var csv = script.actions.map(function (action) {
        return action.at + "," + action.pos;
    }).join("\n");
    var csvBlob = new Blob([csv], {
        type: "text/plain"
    });
    return csvBlob;
};
exports.convertFunscriptToCsv = convertFunscriptToCsv;
//# sourceMappingURL=funConverter.js.map