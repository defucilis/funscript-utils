import { Action, Funscript } from "./types"

export const getOffsetScript = (funscript: Funscript, offset: number): Funscript => {
    if(offset < -1 * funscript.actions.slice(-1)[0].at) return funscript;
    
    return {...funscript, actions: funscript.actions.map((action: Action) => {
        return {...action, at: action.at + offset}
    }).filter((action: Action) => action.at >= 0)};
}

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

    let fullStrokeDuration: number = 0;
    switch(maxSpeed) {
        case "launch":
            fullStrokeDuration = 265;
            break;
        case "handy":
            fullStrokeDuration = 231;
            break;
        default:
            fullStrokeDuration = maxSpeed;
             break;
    }
    const maxPossibleSpeed = 100 / fullStrokeDuration;

    const newActions: Action[] = [funscript.actions[0]];
    for(let i = 1; i < funscript.actions.length; i++) {
        const action = funscript.actions[i];
        const lastAction = newActions[i - 1];
        const actionSpeed = getSpeed(action, lastAction);
        if(actionSpeed <= maxPossibleSpeed) {
            newActions.push(action);
            continue;
        }

        let newPos = action.pos;
        if(action.pos < lastAction.pos) {
            newPos = lastAction.pos - maxPossibleSpeed * (action.at - lastAction.at)
        } else {
            newPos = lastAction.pos + maxPossibleSpeed * (action.at - lastAction.at)
        }
        newActions.push({...action, pos: newPos});
    }
    return {...funscript, actions: newActions};
}