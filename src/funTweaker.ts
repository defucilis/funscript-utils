import { Action, Funscript } from "./types"
import { getActionGroups, getSpeed } from "./utils";

/**
 * Adds a fixed time offset to all actions in a funscript
 * @param  {Funscript} funscript - The funscript to offset
 * @param  {number} offset - The offset to apply, in milliseconds
 * @returns The offset funscript
 */
export const getOffsetScript = (funscript: Funscript, offset: number): Funscript => {
    if(offset < -1 * funscript.actions.slice(-1)[0].at) return funscript;
    
    return {...funscript, actions: funscript.actions.map((action: Action) => {
        return {...action, at: action.at + offset}
    }).filter((action: Action) => action.at >= 0)};
}
/**
 * Remaps all funscript positions to a newly defined range
 * @param  {Funscript} funscript - The funscript to remap
 * @param  {number} min - The new minimum position
 * @param  {number} max - The new maximum position
 * @returns The remapped funscript
 */
export const getRemappedScript = (funscript: Funscript, min: number, max: number): Funscript => {
    let currentMin = 100;
    let currentMax = 0;
    funscript.actions.forEach(action => {
        currentMin = Math.min(currentMin, action.pos);
        currentMax = Math.max(currentMax, action.pos);
    });

    return {...funscript, actions: funscript.actions.map(action => {
        const newPos = min + ((action.pos - currentMin) / (currentMax - currentMin)) * (max - min);
        return {...action, pos: Math.max(0, Math.min(100, Math.round(newPos)))}
    })};
}
/**
 * Limits a funscript's position values to ensure that it doesn't exceed a given maximum speed value
 * @param  {Funscript} funscript - The funscript to limit
 * @param  {"launch"|"handy"|number} maxSpeed - The time, in milliseconds, it takes for the device to complete one full movement (one-direction). Known device values are included as string options
 * @returns The limited funscript
 */
export const getLimitedScript = (
    funscript: Funscript, 
    maxSpeed: "launch" | "handy" | number
): Funscript => {
    if(!funscript || !funscript.actions || funscript.actions.length === 0) return funscript;

    let maxSpeedValue: number = 0;
    switch(maxSpeed) {
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

    const newActions: Action[] = [funscript.actions[0]];
    for(let i = 1; i < funscript.actions.length; i++) {
        const action = funscript.actions[i];
        const lastAction = newActions[i - 1];
        const actionSpeed = getSpeed(action, lastAction);
        if(actionSpeed <= maxSpeedValue) {
            newActions.push(action);
            continue;
        }

        let newPos = action.pos;
        if(action.pos < lastAction.pos) {
            newPos = lastAction.pos - maxSpeedValue * (action.at - lastAction.at) / 1000
        } else {
            newPos = lastAction.pos + maxSpeedValue * (action.at - lastAction.at) / 1000
        }
        newActions.push({...action, pos: newPos});
    }
    return {...funscript, actions: newActions};
}