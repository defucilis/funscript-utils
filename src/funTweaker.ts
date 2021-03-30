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