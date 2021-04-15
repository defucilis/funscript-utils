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
exports.convertFunscriptToCsv = exports.addFunscriptMetadata = exports.getFunscriptFromString = void 0;
var utils_1 = require("./utils");
/**
 * Converts a JSON string into a funscript object, computes metadata, and performs cleanup
 * @param  {string} funscriptJson - JSON string to be converted into a funscript object
 * @returns Converted funscript object
 */
var getFunscriptFromString = function (funscriptJson) {
    var script = JSON.parse(funscriptJson);
    return exports.addFunscriptMetadata(script);
};
exports.getFunscriptFromString = getFunscriptFromString;
/**
 * Adds metadata (average speed and duration) to a funscript, as well as make sure that its actions are in the right order
 * @param  {Funscript} funscript - Funscript to be processed
 * @returns Processed funscript with metadata
 */
var addFunscriptMetadata = function (funscript) {
    var output = __assign({}, funscript);
    output.actions = output.actions.sort(function (a, b) { return a.at - b.at; });
    var duration = output.actions.slice(-1)[0].at;
    var averageIntensity = output.actions.reduce(function (acc, action, index) {
        return index === 0 ? acc : acc + utils_1.getSpeed(output.actions[index - 1], output.actions[index]);
    }, 0) / (output.actions.length - 1);
    output.fuMetadata = {
        duration: duration,
        averageIntensity: averageIntensity,
    };
    return output;
};
exports.addFunscriptMetadata = addFunscriptMetadata;
/**
 * Converts a funscript into a CSV blob suitable for upload to a Handy
 * @param  {string} funscript - Funscript to be converted
 * @returns Plaintext blob ready to be uploaded to a Handy
 */
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