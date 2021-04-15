import { Action, Funscript } from "./types";
import { getSpeed } from "./utils";

export const getFunscriptFromString = (funscript: string) => {
    const script = JSON.parse(funscript);
    return addFunscriptMetadata(script);
}

export const addFunscriptMetadata = (funscript: Funscript): Funscript => {
    const output: Funscript = {...funscript};

    output.actions = output.actions.sort((a: Action, b: Action) => a.at - b.at);
    const duration = output.actions.slice(-1)[0].at;

    const averageIntensity = output.actions.reduce((acc, action, index) => {
        return index === 0 ? acc : acc + getSpeed(output.actions[index - 1], output.actions[index]);
    }, 0) / (output.actions.length - 1);

    output.fuMetadata = {
        duration,
        averageIntensity,
    }
    return output;
}

export const convertFunscriptToCsv = (funscript: string) => {
    const script = JSON.parse(funscript);
    const csv = script.actions.map((action: Action) => {
        return action.at + "," + action.pos;
    }).join("\n");
    const csvBlob = new Blob([csv], {
        type: "text/plain"
    });

    return csvBlob;
}