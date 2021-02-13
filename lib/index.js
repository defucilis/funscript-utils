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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHalfSpeedGroup = exports.getActionGroups = void 0;
var sign = function (val) {
    if (val === 0)
        return 0;
    return val > 0 ? 1 : -1;
};
var getActionGroups = function (actions) {
    var actionGroups = [];
    var index = -1;
    var timeSinceLast = -1;
    actions.forEach(function (action, i) {
        if (i === 0) {
            actionGroups.push([action]);
            index++;
            return;
        }
        if (i === 1) {
            actionGroups[index].push(action);
            timeSinceLast = Math.max(250, action.at - actions[i - 1].at);
            return;
        }
        var newTimeSinceLast = action.at - actions[i - 1].at;
        if (newTimeSinceLast > 5 * timeSinceLast) {
            actionGroups.push([action]);
            index++;
        }
        else {
            actionGroups[index].push(action);
        }
        timeSinceLast = Math.max(250, newTimeSinceLast);
    });
    return actionGroups;
};
exports.getActionGroups = getActionGroups;
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
                    lastKeyAction_1.subActions = __spreadArrays(lastKeyAction_1.subActions, [action]);
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
            lastKeyAction.subActions = __spreadArrays(lastKeyAction.subActions, [action]);
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
                var max = Math.max.apply(Math, __spreadArrays((lastAction.subActions.map(function (a) { return a.pos; })), [action.pos]));
                var min = Math.min.apply(Math, __spreadArrays((lastAction.subActions.map(function (a) { return a.pos; })), [action.pos]));
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
    return finalActions;
};
exports.getHalfSpeedGroup = getHalfSpeedGroup;
// eslint-disable-next-line no-unused-vars
var getSimpleActionsOld = function (actions) {
    var simpleActions = [];
    for (var i = 0; i < actions.length; i++) {
        var action = actions[i];
        if (i === 0) {
            simpleActions.push(action);
            continue;
        }
        if (i === actions.length - 1) {
            simpleActions.push(action);
            continue;
        }
        var lastAction = actions[i - 1];
        var nextAction = actions[i + 1];
        if (sign(action.pos - lastAction.pos) === sign(action.pos - nextAction.pos)) {
            simpleActions.push(action);
        }
    }
    return simpleActions;
};
// eslint-disable-next-line no-unused-vars
var getHalfSpeedGroupOld = function (actionGroup) {
    if (actionGroup.length < 4)
        return [];
    var output = [];
    //first, we explicitly place a pos-99 marker projeted back one movement to ensure nice clean gaps between groups
    output.push({
        pos: 99,
        at: actionGroup[0].at - (actionGroup[2].at - actionGroup[0].at)
    });
    for (var i = 0; i < actionGroup.length - 3; i += 4) {
        var min = Math.min(actionGroup[i].pos, actionGroup[i + 1].pos, actionGroup[i + 2].pos, actionGroup[i + 3].pos);
        var max = Math.max(actionGroup[i].pos, actionGroup[i + 1].pos, actionGroup[i + 2].pos, actionGroup[i + 3].pos);
        //note - min and max are swapped here to make sure that the pattern begins on a downbeat and ends on an upbeat
        output.push({
            pos: min,
            at: actionGroup[i].at
        });
        output.push({
            pos: max,
            at: actionGroup[i + 2].at
        });
    }
    //if there weren't an even four in the group (so there are beats left over), and the position isn't at the top,
    //we add one more movement using the last interval time to move it to the top to prepare for the next group
    if (actionGroup.length % 4 === 0) {
        return output;
    }
    else if (actionGroup.length % 4 === 3) {
        var min = Math.min(actionGroup.slice(-3)[0].pos, actionGroup.slice(-2)[0].pos, actionGroup.slice(-1)[0].pos);
        var max = Math.max(actionGroup.slice(-3)[0].pos, actionGroup.slice(-2)[0].pos, actionGroup.slice(-1)[0].pos);
        output.push({
            pos: min,
            at: actionGroup.slice(-3)[0].at
        });
        output.push({
            pos: max,
            at: actionGroup.slice(-1)[0].at
        });
    }
    if (output.slice(-1)[0].pos < 99) {
        output.push({
            pos: 99,
            at: output.slice(-1)[0].at + (output.slice(-1)[0].at - output.slice(-3)[0].at)
        });
    }
    return output;
};
var convertFunscript = function (script, options) {
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
        ? exports.getActionGroups(orderedActions.slice(1))
        : exports.getActionGroups(orderedActions);
    var slowerGroups = actionGroups.map(function (group) { return exports.getHalfSpeedGroup(group, options); });
    console.log(slowerGroups[0]);
    /*
    Basic idea:
    First, we simplify the script by turning it into a series of linear motions up and down (no velocity changes except when changing direction)
        - If a point represents a change in direction, then we add it (and its position) to the new points list
    */
    /*
    //remove any velocity changes that aren't changes in direction
     const simpleActions = getSimpleActionsOld(script.actions);
     onProgress("Simplified actions - new count is " + simpleActions.length);
     //next, we break these simple points up into blocks, splitting them up when there's a gap of greater than five of the last interval
     const actionGroups = getActionGroups(simpleActions);
     onProgress("Split actions into " + actionGroups.length + " groups");
 
     //now, we take each group of four points and turn them into two points, using the maximum and minimum positions for each
     const slowerGroups = actionGroups.map(group => getHalfSpeedGroupOld(group));
     */
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
    return output;
};
exports.default = convertFunscript;
//# sourceMappingURL=index.js.map