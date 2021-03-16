<h1 align="center">
  <a href='https://github.com/defucilis/funscript-utils'>Funscript Utils</a>    
  
  A set of TypeScript utilities for working with .funscript files
</h1>

<p align="center">
  <a href='https://www.npmjs.com/package/funscript-utils'>
      <img src="https://img.shields.io/npm/v/funscript-utils.svg" />
  </a>
  <a href='https://simple.wikipedia.org/wiki/MIT_License'>
      <img src="https://img.shields.io/badge/license-MIT-lightgrey" />
  </a>
  <img src="https://img.shields.io/bundlephobia/minzip/funscript-utils" />
  <img src="https://img.shields.io/npm/dw/funscript-utils" />
</p>

## Installation

```sh
npm i funscript-utils
```

## Modules

### Types

Contains some useful type definitions for working with funscripts

`Funscript`

  * Contains an array of `Action`s, and a `FunscriptMetadata` object

`FunscriptMetadata`

  * Contains some basic metadata about the funscript, extracted from its actions
  * For now, this is just its duration (in milliseconds) and the average intensity

`Action`

  * The basic elements of a funscript
  * 'at' value which refers to their time from the beginning of the script
  * `pos` value from 0 - 100 which represents the shuttle position at that time
  * There are also additional options which are added by various modules in funscript-utils

### FunConverter

FunConverter contains functions used to convert funscripts from one format to another.

`getFunscriptFromString(funscript: String)`

  * Takes a raw string read straight from a .funscript file, and outputs a Funscript object with populated metadata
  
`getIntensity(a1: Action, a2: Action)`

  * Gets an intensity value for an interval between two actions
  * Intensity is measured in 'positional movement per half-second'
    * So an intensity of 100 indicates a movement speed equivalent to moving from 0 -> 100 over 0.5 seconds
    * This means that an intensity of 100 can also be thought of as 'one full stroke per second'
    * For example, moving from pos=20 to pos=60 over 0.3 seconds gives an intensity value of 67
    * The formula for intensity is `500 * abs(a2.pos - a1.pos) / abs(a2.at - a1.at)`
    
`addFunscriptMetadata(funscript: Funscript)`

  * Primarily used internally, takes in a funscript object that's been directly parsed from a string, and calculates the average intensity and duration from its actions
  
`convertFunscriptToCsv(funscript: Funscript)`

  * Converts a funscript string into a csv blob for upload to the handyfeeling.com servers (to be loaded onto a Handy)
  
### FunHalver

FunHalver contains one important function, and a variety of helper functions that it uses.

`getHalfSpeedScript(funscript: Funscript, options)`

  * Halves the intensity of a script without changing its cadence. It will turn each 'up/down' stroke into alternating up and down strokes.
  * To do this, it splits the actions up into 'action groups', which are groups of actions separated by large gaps
  * Options:
    * removeShortPauses: if true, when two actions share a position value and are within `shortPauseDuration` milliseconds of each other, they will be merged
    * shortPauseDuration: the duration threshold that two actions need to be within to be merged if removeShortPauses is true. If not set, this value is 2000 milliseconds
    * matchFirstDownstroke: If true, ensures that the first downstroke in the original funscript will be matched by a corresponding downstroke in the half-speed script. This is important for matching scripts that are intended to follow a beat. If this isn't true, then the half-speed script can sometimes end up off the beat by exactly half a beat (since the actions that are being removed are the ones that originally fell on the beat)
    * matchGroupEndPosition: If true, will ensure that the half-speed script's position during rests between groups will match that of the original funscript
    * resetAfterPause: if true, will ensure that the first action in each group will have a position value of 100
    * debugMode: If true, the function will spit out a bunch of console.log lines for debugging
    
### FunMapper

Used to visualize funscripts in various ways.

`getColor(intensity: number)`

  * Converts a color into an RGB couplet (as an array of three numbers from 0 - 255) based on a standard funscript heatmap color palette (originally by Lucifie)

`renderHeatmap(canvas: HTMLCanvasElement, script: Funscript, options)`

  * Renders a funscript heatmap into a provided canvas object
  * Options:
    * showStrokeLength: If set to false, the funscript will be presented as a solid rectangle with a gradient of colors representing intensities. If true (or not set), the funscript's shape will correspond to stroke lengths
    
`renderActions(canvas: HTMLCanvasElement, script: Funscript)`

  * Renders a funscript's actions into a provided canvas object, as a series of lines showing the action's movements
  * Options:
    * clear: If set to false, the canvas will not be cleared before rendering
    * background: CSS string for the background color to be set (if clear has not been set to false) - defaults to #000
    * timeOnlyColor: CSS string for the line color - defaults to #FFF
    * lineWeight: Thickness of rendered lines - defaults to 3
    * position: Time from the start of the script, in milliseconds, that should be rendered
    * duration: Duration of actions that should be rendered - defaults to the full duration of the script
    * onlyTimes: If set to true, the action positions will not be shown, and instead only vertical lines at each action's time will be shown using `positionColor`
    * onlyTimeColor: CSS string for the color of the lines indicating line time, if `onlyTimes` is set to true - defaults to rgba(255,255,255,0.2)
    * offset: An x/y positional offset for all rendering. Given as an object with shape `{x: number, y: number}`
