"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSpeed = exports.getActionGroups = void 0;
/**
 * Splits a funscript action array into sensible 'groups' of actions, separated by pauses
 * @param  {Action[]} actions - Array of actions, from a funscript JSON object
 * @returns Array of Action arrays - each array is one group
 */
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
/**
 * Takes in two actions and returns the speed value the transition between them represents.
 * This value is measured in '0-100 movements per second'
 * If the first action occurs after the second action, the two actions have their times swapped for the purposes of the calculation
 * @param  {Action} firstAction - The action that occurs first
 * @param  {Action} secondAction - The action that occurs second
 * @returns {number} The speed value, in 0-100 movements per second
 */
var getSpeed = function (firstAction, secondAction) {
    if (!firstAction || !secondAction)
        return 0;
    if (firstAction.at === secondAction.at)
        return 0;
    try {
        if (secondAction.at < firstAction.at) {
            var temp = secondAction;
            secondAction = firstAction;
            firstAction = temp;
        }
        return 1000 * (Math.abs(secondAction.pos - firstAction.pos) / Math.abs(secondAction.at - firstAction.at));
    }
    catch (error) {
        console.error("Failed on actions", firstAction, secondAction, error);
        return 0;
    }
};
exports.getSpeed = getSpeed;
//# sourceMappingURL=utils.js.map