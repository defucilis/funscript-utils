const sign = (val: number) => {
    if(val === 0) return 0;
    return val > 0 ? 1 : -1;
}

export interface Action {
    at: number;
    pos: number;
    subActions?: Action[];
    type?: "first" | "last" | "pause" | "prepause" | "apex";
}

export interface Options {
    removeShortPauses?: boolean;
    shortPauseDuration?: number;
    matchFirstDownstroke?: boolean;
    matchGroupEndPosition?: boolean;
    resetAfterPause?: boolean;
    debugMode?: boolean;
}

export const getActionGroups = (actions: Action[]) => {
    const actionGroups: Action[][] = [];
    let index = -1;
    let timeSinceLast = -1;
    actions.forEach((action, i) => {
        if(i === 0) {
            actionGroups.push([action]);
            index++;
            return;
        }
        if(i === 1) {
            actionGroups[index].push(action);
            timeSinceLast = Math.max(250, action.at - actions[i-1].at);
            return;
        }

        const newTimeSinceLast = action.at - actions[i-1].at;
        if(newTimeSinceLast > 5 * timeSinceLast) {
            actionGroups.push([action]);
            index++;
        } else {
            actionGroups[index].push(action);
        }

        timeSinceLast = Math.max(250, newTimeSinceLast);
    });
    return actionGroups;
}

export const getHalfSpeedGroup = (actionGroup: Action[], options: Options) => {
    //Select 'apex' actions where the direction changes, and action pairs that represent a pause
    const keyActions: Action[] = [];
    let apexCount = 0;
    let filteredGroup = actionGroup.filter((action, i) => {
        if(i === 0) return true;
        if(i === actionGroup.length - 1) return true;

        //ignore actions that occur within a pause (there shouldn't be any, but just in case)
        const lastAction = actionGroup[i - 1];
        const nextAction = actionGroup[i + 1];
        return !(action.pos === lastAction.pos && action.pos === nextAction.pos);
    });
    if(options.removeShortPauses) {
        const newFilteredGroup: Action[] = [];
        const pauseTime = options.shortPauseDuration && options.shortPauseDuration > 0 
            ? options.shortPauseDuration 
            : 2000;
        filteredGroup.forEach((action, i) => {
            if(i === 0 || i === filteredGroup.length - 1) {
                newFilteredGroup.push(action);
                return;
            }
            const lastAction = actionGroup[i - 1];
            const nextAction = actionGroup[i + 1];

            //if the gap between to equal positions is less than 0.5 seconds (configurable?)
            if(action.pos === lastAction.pos && Math.abs(action.at - lastAction.at) < pauseTime) {
                newFilteredGroup.push({at: (action.at + lastAction.at) * 0.5, pos: action.pos});
            } else if(action.pos === nextAction.pos && Math.abs(action.at - nextAction.at) < pauseTime) {
                //do nothing - we're going to combine them at the next action so we don't add it!
            } else {
                newFilteredGroup.push(action);
            }
        });
        filteredGroup = newFilteredGroup;
    }
    filteredGroup.forEach((action, i) => {
        //The first and last points in a group are always added
        if(i === 0) {
            keyActions.push({...action, subActions: [], type: "first"});
            return;
        }
        if(i === filteredGroup.length - 1) {
            //note - should this be a key action? Hard to know right now, need to test
            keyActions.push({...action, subActions: [], type: "last"});
            return;
        }

        const lastAction = filteredGroup[i - 1];
        const nextAction = filteredGroup[i + 1];

        //Add the actions on either side of a pause
        if((action.pos - lastAction.pos) === 0) {
            keyActions.push({...action, subActions: [], type: "pause"});
            apexCount = 0;
            return;
        }
        if((action.pos - nextAction.pos) === 0) {
            keyActions.push({...action, subActions: [], type: "prepause"});
            apexCount = 0;
            return;
        }

        if(options.matchFirstDownstroke && i === 1 && action.pos < lastAction.pos) {
            apexCount = 1;
        }

        //apex actions - add every second one (reset when at a pause)
        if(sign(action.pos - lastAction.pos) !== sign(nextAction.pos - action.pos)) {
            if(apexCount === 0) {
                const lastKeyAction = keyActions.slice(-1)[0];
                if(lastKeyAction.subActions) {
                    lastKeyAction.subActions = [...lastKeyAction.subActions, action];
                }
                apexCount++;
                return;
            } else {
                keyActions.push({...action, subActions: [], type: "apex"});
                apexCount = 0;
                return;
            }
        }

        const lastKeyAction = keyActions.slice(-1)[0];
        if(lastKeyAction.subActions) {
            lastKeyAction.subActions = [...lastKeyAction.subActions, action];
        }
    });

    let pos = options.resetAfterPause ? 100 : keyActions[0].pos;
    const finalActions: Action[] = [];
    keyActions.forEach((action, i) => {
        if(i === 0) {
            let outputAction: Action = {at: action.at, pos};
            if(options.debugMode) {
                outputAction.type = action.type;
                if(action.subActions && action.subActions.length > 0) outputAction.subActions = action.subActions;
            }
            finalActions.push(outputAction);
            return;
        }

        const lastAction = keyActions[i-1];

        let outputAction: Action = {at: 0, pos: 0};
        if(action.type === "pause") {
            outputAction.at = action.at;
            outputAction.pos = action.pos;
        } else {
            if(lastAction.subActions) {
                const max = Math.max(...[...(lastAction.subActions.map(a => a.pos)), action.pos]);
                const min = Math.min(...[...(lastAction.subActions.map(a => a.pos)), action.pos]);
                const newPos = Math.abs(pos - min) > Math.abs(pos - max) ? min : max;

                outputAction.pos = newPos;
                pos = newPos;
            } else {
                outputAction.pos = action.pos;
            }

            outputAction.at = action.at;
        }

        if(options.debugMode) {
            outputAction.type = action.type;
            if(action.subActions && action.subActions.length > 0) outputAction.subActions = action.subActions;
        }
        finalActions.push(outputAction);
    });

    if(options.matchGroupEndPosition) {
        if(finalActions.slice(-1)[0].pos !== actionGroup.slice(-1)[0].pos) {
            const finalActionDuration = finalActions.slice(-1)[0].at - finalActions.slice(-2)[0].at;
            const outputAction: Action = {at: 0, pos: 0};
            outputAction.pos = actionGroup.slice(-1)[0].pos;
            outputAction.at = finalActions.slice(-1)[0].at + finalActionDuration;

            if(options.debugMode) {
                finalActions.slice(-1)[0].type = "apex";

                outputAction.subActions = [];
                outputAction.type = "last";
            }
            finalActions.push(outputAction);
        }
    }

    return finalActions;
}

// eslint-disable-next-line no-unused-vars
const getSimpleActionsOld = (actions: Action[]) => {
    const simpleActions = [];
    for(let i = 0; i < actions.length; i++) {
        const action = actions[i];
        if(i === 0) {
            simpleActions.push(action);
            continue;
        }
        if(i === actions.length - 1) {
            simpleActions.push(action);
            continue;
        }
        const lastAction = actions[i - 1];
        const nextAction = actions[i + 1];

        if(sign(action.pos - lastAction.pos) === sign(action.pos - nextAction.pos)) {
            simpleActions.push(action);
        }
    }
    return simpleActions;
}

// eslint-disable-next-line no-unused-vars
const getHalfSpeedGroupOld = (actionGroup: Action[]) => {
    if(actionGroup.length < 4) return [];
    const output = [];

    //first, we explicitly place a pos-99 marker projeted back one movement to ensure nice clean gaps between groups
    output.push({
        pos: 99,
        at: actionGroup[0].at - (actionGroup[2].at - actionGroup[0].at)
    });

    for(let i = 0; i < actionGroup.length - 3; i += 4) {
        const min = Math.min(actionGroup[i].pos, actionGroup[i+1].pos, actionGroup[i+2].pos, actionGroup[i+3].pos);
        const max = Math.max(actionGroup[i].pos, actionGroup[i+1].pos, actionGroup[i+2].pos, actionGroup[i+3].pos);
        //note - min and max are swapped here to make sure that the pattern begins on a downbeat and ends on an upbeat
        output.push({
            pos: min,
            at: actionGroup[i].at
        });
        output.push({
            pos: max,
            at: actionGroup[i+2].at
        });
    }

    //if there weren't an even four in the group (so there are beats left over), and the position isn't at the top,
    //we add one more movement using the last interval time to move it to the top to prepare for the next group
    if(actionGroup.length % 4 === 0) {
        return output;
    } else if(actionGroup.length % 4 === 3) {
        const min = Math.min(actionGroup.slice(-3)[0].pos, actionGroup.slice(-2)[0].pos, actionGroup.slice(-1)[0].pos);
        const max = Math.max(actionGroup.slice(-3)[0].pos, actionGroup.slice(-2)[0].pos, actionGroup.slice(-1)[0].pos);
        output.push({
            pos: min,
            at: actionGroup.slice(-3)[0].at
        });
        output.push({
            pos: max,
            at: actionGroup.slice(-1)[0].at
        });
    }
    if(output.slice(-1)[0].pos < 99) {
        output.push({
            pos: 99,
            at: output.slice(-1)[0].at + (output.slice(-1)[0].at - output.slice(-3)[0].at)
        });
    }

    return output;
}

export const getHalfSpeedScript = (script: {actions: Action[]}, options: Options) => {
    //onProgress("Loaded script with " + script.actions.length + " actions");
    const output = {...script};
    output.actions = [];

    //Split the source actions up into groups, separating two groups if 5x the last interval passes without any actions
    const orderedActions = script.actions.sort((a, b) => a.at - b.at);
    //Note that IF the first two actions are separated by more than five seconds, we manually add the first one and use the algorithm on the second onwards
    const longFirstWait = (orderedActions[1].at - orderedActions[0].at) > 5000;
    if(longFirstWait) output.actions.push(orderedActions[0]);
    const actionGroups = longFirstWait 
        ? getActionGroups(orderedActions.slice(1))
        : getActionGroups(orderedActions);
    const slowerGroups = actionGroups.map(group => getHalfSpeedGroup(group, options));

    //finally, we combine these slower groups into the final actions array
    slowerGroups.forEach(group => {
        group.forEach(action => {
            output.actions.push(action);
        })
    });
    
    //ensure that the durations match up by adding a pause at the end
    if(output.actions.slice(-1)[0].at !== script.actions.slice(-1)[0].at) {
        output.actions.push({at: script.actions.slice(-1)[0].at, pos: output.actions.slice(-1)[0].pos});
    }
    //onProgress("Slowed down action groups, new action count is " + output.actions.length);
    return output;
}