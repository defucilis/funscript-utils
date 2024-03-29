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
exports.getHalfSpeedScript = exports.getHalfSpeedGroup = void 0;
var utils_1 = require("./utils");
var sign = function (val) {
    if (val === 0)
        return 0;
    return val > 0 ? 1 : -1;
};
/**
 * Takes in a group of actions and creates a half-speed version of that group, without losing cadence
 * @param  {Action[]} actionGroup - The group to halve the speed of
 * @param  {Options} options - Options to change the behaviour of the speed-halving
 */
var getHalfSpeedGroup = function (actionGroup, options) {
    //Select 'apex' actions where the direction changes, and action pairs that represent a pause
    var keyActions = [];
    var apexCount = 0;
    var filteredGroup = actionGroup.filter(function (action, i) {
        if (i === 0)
            return true;
        if (i === actionGroup.length - 1)
            return true;
        //ignore actions that occur within a pause (there shouldn't be any, but just in case)
        var lastAction = actionGroup[i - 1];
        var nextAction = actionGroup[i + 1];
        return !(action.pos === lastAction.pos && action.pos === nextAction.pos);
    });
    if (options.removeShortPauses) {
        var newFilteredGroup_1 = [];
        var pauseTime_1 = options.shortPauseDuration && options.shortPauseDuration > 0
            ? options.shortPauseDuration
            : 2000;
        filteredGroup.forEach(function (action, i) {
            if (i === 0 || i === filteredGroup.length - 1) {
                newFilteredGroup_1.push(action);
                return;
            }
            var lastAction = actionGroup[i - 1];
            var nextAction = actionGroup[i + 1];
            //if the gap between to equal positions is less than 0.5 seconds (configurable?)
            if (action.pos === lastAction.pos && Math.abs(action.at - lastAction.at) < pauseTime_1) {
                newFilteredGroup_1.push({ at: (action.at + lastAction.at) * 0.5, pos: action.pos });
            }
            else if (action.pos === nextAction.pos && Math.abs(action.at - nextAction.at) < pauseTime_1) {
                //do nothing - we're going to combine them at the next action so we don't add it!
            }
            else {
                newFilteredGroup_1.push(action);
            }
        });
        filteredGroup = newFilteredGroup_1;
    }
    filteredGroup.forEach(function (action, i) {
        //The first and last points in a group are always added
        if (i === 0) {
            keyActions.push(__assign(__assign({}, action), { subActions: [], type: "first" }));
            return;
        }
        if (i === filteredGroup.length - 1) {
            //note - should this be a key action? Hard to know right now, need to test
            keyActions.push(__assign(__assign({}, action), { subActions: [], type: "last" }));
            return;
        }
        var lastAction = filteredGroup[i - 1];
        var nextAction = filteredGroup[i + 1];
        //Add the actions on either side of a pause
        if ((action.pos - lastAction.pos) === 0) {
            keyActions.push(__assign(__assign({}, action), { subActions: [], type: "pause" }));
            apexCount = 0;
            return;
        }
        if ((action.pos - nextAction.pos) === 0) {
            keyActions.push(__assign(__assign({}, action), { subActions: [], type: "prepause" }));
            apexCount = 0;
            return;
        }
        if (options.matchFirstDownstroke && i === 1 && action.pos < lastAction.pos) {
            apexCount = 1;
        }
        //apex actions - add every second one (reset when at a pause)
        if (sign(action.pos - lastAction.pos) !== sign(nextAction.pos - action.pos)) {
            if (apexCount === 0) {
                var lastKeyAction_1 = keyActions.slice(-1)[0];
                if (lastKeyAction_1.subActions) {
                    lastKeyAction_1.subActions = __spreadArray(__spreadArray([], lastKeyAction_1.subActions), [action]);
                }
                apexCount++;
                return;
            }
            else {
                keyActions.push(__assign(__assign({}, action), { subActions: [], type: "apex" }));
                apexCount = 0;
                return;
            }
        }
        var lastKeyAction = keyActions.slice(-1)[0];
        if (lastKeyAction.subActions) {
            lastKeyAction.subActions = __spreadArray(__spreadArray([], lastKeyAction.subActions), [action]);
        }
    });
    var pos = options.resetAfterPause ? 100 : keyActions[0].pos;
    var finalActions = [];
    keyActions.forEach(function (action, i) {
        if (i === 0) {
            var outputAction_1 = { at: action.at, pos: pos };
            if (options.debugMode) {
                outputAction_1.type = action.type;
                if (action.subActions && action.subActions.length > 0)
                    outputAction_1.subActions = action.subActions;
            }
            finalActions.push(outputAction_1);
            return;
        }
        var lastAction = keyActions[i - 1];
        var outputAction = { at: 0, pos: 0 };
        if (action.type === "pause") {
            outputAction.at = action.at;
            outputAction.pos = action.pos;
        }
        else {
            if (lastAction.subActions) {
                var max = Math.max.apply(Math, __spreadArray(__spreadArray([], (lastAction.subActions.map(function (a) { return a.pos; }))), [action.pos]));
                var min = Math.min.apply(Math, __spreadArray(__spreadArray([], (lastAction.subActions.map(function (a) { return a.pos; }))), [action.pos]));
                var newPos = Math.abs(pos - min) > Math.abs(pos - max) ? min : max;
                outputAction.pos = newPos;
                pos = newPos;
            }
            else {
                outputAction.pos = action.pos;
            }
            outputAction.at = action.at;
        }
        if (options.debugMode) {
            outputAction.type = action.type;
            if (action.subActions && action.subActions.length > 0)
                outputAction.subActions = action.subActions;
        }
        finalActions.push(outputAction);
    });
    if (options.matchGroupEndPosition) {
        if (finalActions.slice(-1)[0].pos !== actionGroup.slice(-1)[0].pos) {
            var finalActionDuration = finalActions.slice(-1)[0].at - finalActions.slice(-2)[0].at;
            var outputAction = { at: 0, pos: 0 };
            outputAction.pos = actionGroup.slice(-1)[0].pos;
            outputAction.at = finalActions.slice(-1)[0].at + finalActionDuration;
            if (options.debugMode) {
                finalActions.slice(-1)[0].type = "apex";
                outputAction.subActions = [];
                outputAction.type = "last";
            }
            finalActions.push(outputAction);
        }
    }
    return finalActions.map(function (action) { return (__assign(__assign({}, action), { pos: Math.round(action.pos), at: Math.round(action.at) })); });
};
exports.getHalfSpeedGroup = getHalfSpeedGroup;
/**
 * Creates a half-speed version of a script without sacrificing cadence by removing every second action (ish)
 * @param  {Funscript} script - The script to halve the speed of
 * @param  {Options} options - Options to configure how the halving is done
 * @returns The half-speed funscript
 */
var getHalfSpeedScript = function (script, options) {
    //onProgress("Loaded script with " + script.actions.length + " actions");
    var output = __assign({}, script);
    output.actions = [];
    //Split the source actions up into groups, separating two groups if 5x the last interval passes without any actions
    var orderedActions = script.actions.sort(function (a, b) { return a.at - b.at; });
    //Note that IF the first two actions are separated by more than five seconds, we manually add the first one and use the algorithm on the second onwards
    var longFirstWait = (orderedActions[1].at - orderedActions[0].at) > 5000;
    if (longFirstWait)
        output.actions.push(orderedActions[0]);
    var actionGroups = longFirstWait
        ? utils_1.getActionGroups(orderedActions.slice(1))
        : utils_1.getActionGroups(orderedActions);
    var slowerGroups = actionGroups.map(function (group) { return exports.getHalfSpeedGroup(group, options); });
    //finally, we combine these slower groups into the final actions array
    slowerGroups.forEach(function (group) {
        group.forEach(function (action) {
            output.actions.push(action);
        });
    });
    //ensure that the durations match up by adding a pause at the end
    if (output.actions.slice(-1)[0].at !== script.actions.slice(-1)[0].at) {
        output.actions.push({ at: script.actions.slice(-1)[0].at, pos: output.actions.slice(-1)[0].pos });
    }
    //onProgress("Slowed down action groups, new action count is " + output.actions.length);
    output.actions = output.actions.map(utils_1.roundAction);
    return output;
};
exports.getHalfSpeedScript = getHalfSpeedScript;
//# sourceMappingURL=funHalver.js.map