import { Action } from "./types";

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

export const getSpeed = (a1: Action, a2: Action) => {
    try {
        if(a2.at < a1.at) {
            const temp = a2;
            a2 = a1;
            a1 = temp;
        }
        return Math.abs(a2.pos - a1.pos) / Math.abs(a2.at - a1.at);
    } catch(error) {
        console.error("Failed on actions", a1, a2, error);
        return 0;
    }
}