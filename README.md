# MCBE Essentials

**MCBE Essentials** is a collection of Web Tools built for Minecraft Bedrock Edition.

## Apps

The site currently has 11 functioning apps and 4 sub-apps (doesn't appear in the site's shortcuts, but are considered a part of the main apps anyways).

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

This code is available across the entire app.

- The left sidebar's structure code, available in `left.html`
- The general stylesheet, available at `style.css`
- **In some apps,** `pnbt.js` is used as an NBT - JSON library
- **In some apps,** `filesaver.js` is used to download files.
  - Other apps use their own strange system of downloading a file via a pseudo-`<a>` element.
- Apps that are not supported by mobile use `nomobile.js` and get redirected to `nomobile.html`

## Domains

The stable release is available at [https://mcbe-essentials.github.io](https://mcbe-essentials.github.io)

The development version is available at [https://mcbe-essentials.glitch.me](https://mcbe-essentials.glitch.me) but is only accesible if you have entered dev mode on the site.

## To Do
### Bugs and inconsistancies
- Make all apps use `filesaver.js` to download files.
- Make all apps use `pnbt.js` to save files.

\ ゜ o ゜)ノ
