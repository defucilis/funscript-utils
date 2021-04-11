import { Action, Funscript, FunscriptMetadata } from "./types";

export const getFunscriptFromString = (funscript: string) => {
    const script = JSON.parse(funscript);
    return addFunscriptMetadata(script);
}

export const getIntensity = (a1: Action, a2: Action) => {
    try {
        if(a2.at < a1.at) {
            const temp = a2;
            a2 = a1;
            a1 = temp;
        }
        const slope = Math.min(20, 500.0 / (a2.at - a1.at));
        return slope * Math.abs(a2.pos - a1.pos);
    } catch(error) {
        console.error("Failed on actions", a1, a2, error);
        return 0;
    }
}

export const addFunscriptMetadata = (funscript: Funscript): Funscript => {
    const output: Funscript = {...funscript};

    output.actions = output.actions.sort((a: Action, b: Action) => a.at - b.at);
    const duration = output.actions.slice(-1)[0].at;

    const averageIntensity = output.actions.reduce((acc, action, index) => {
        return index === 0 ? acc : acc + getIntensity(output.actions[index - 1], output.actions[index]);
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