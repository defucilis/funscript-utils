import { Action } from "./types";
/**
 * Splits a funscript action array into sensible 'groups' of actions, separated by pauses
 * @param  {Action[]} actions - Array of actions, from a funscript JSON object
 * @returns Array of Action arrays - each array is one group
 */
export declare const getActionGroups: (actions: Action[]) => Action[][];
/**
 * Takes in two actions and returns the speed value the transition between them represents.
 * This value is measured in '0-100 movements per second'
 * If the first action occurs after the second action, the two actions have their times swapped for the purposes of the calculation
 * @param  {Action} firstAction - The action that occurs first
 * @param  {Action} secondAction - The action that occurs second
 * @returns {number} The speed value, in 0-100 movements per second
 */
export declare const getSpeed: (firstAction: Action, secondAction: Action) => number;
/**
 * Ensures that an action is within range and doesnt have any decimals
 */
export declare const roundAction: (action: Action) => Action;
//# sourceMappingURL=utils.d.ts.map