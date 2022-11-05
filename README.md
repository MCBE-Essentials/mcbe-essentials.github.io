# MCBE Essentials

**MCBE Essentials** is a collection of Web Tools built for Minecraft Bedrock Edition.

## License
This work is licensed under the Creative Commons Attribution-ShareAlike 4.0 International License. To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/4.0/ or send a letter to Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.

## Apps

Each app has been classified below.

| App                        | Type        | Upld.      | Dwnld.    | Exports as                           | Libraries             |
| :-----------:              | :---------: | :-----:    | :-------: | :-----------:                        | --------------------- |
| Shape Coordinate           | Generator   | No         | No        | Text (clipboard)                     |                       |
| GiveNBT                    | Generator   | No         | No        | Text (clipboard)                     | bridge.               |
| Selector                   | Generator   | No         | No        | Text (clipboard)                     | bridge.               |
| Camera Movement            | Generator   | No         | No        | Text (clipboard)                     |                       |
| Tellraw                    | Generator   | No         | No        | Text (clipboard)                     |                       |
| Loopr                      | Generator   | Yes        | Yes       | Text (clipboard), .lpr               |                       |
| Instant Pack               | Generator   | No         | Yes       | .zip, .mcpack                        | bridge.               |
| World Generator            | Generator   | Internally | Yes       | .mcworld                             | pnbt, jszip, leveldat |
| World Packager             | Editor      | Yes        | Yes       | .zip, .mcworld, .mctemplate, .mcpack | pnbt, jszip, leveldat |
| Trade Table                | Editor      | Yes        | Yes       | .json                                | bridge., item         |
| Trade Table Previewer      | Visualizer  | Yes        | No        |                                      | item                  |
| Dialogue                   | Editor      | Yes        | Yes       | .json                                |                       |
| Structure                  | Editor      | Yes        | Yes       | .mcstructure                         | pnbt, bridge., item   |
| Loot Tabler                | Editor      | Yes        | Yes       | .zip, .mcworld, .mctemplate          | pnbt, item            |
| Structure to Function      | Converter   | Yes        | Yes       | .mcfunction                          | pnbt                  |
| *Log to Graph*             | Visualizer  | Yes        | No        |                                      | nbt2                  |

## Global code

Certain files are applied across the entire site for easy editing and consistency.
- `js/datahandler.js` 
- `js/bridge-connect.js`
- `navtop.html`
- `navleft.html`
- `minecraft-ui.css`

## Domains

The stable release is available at [https://mcbe-essentials.github.io](https://mcbe-essentials.github.io)

The nightly build is available at [https://mcbe-essentials.glitch.me](https://mcbe-essentials.glitch.me) but is only accesible if you have entered dev mode on the site.

\ ゜ o ゜)ノ