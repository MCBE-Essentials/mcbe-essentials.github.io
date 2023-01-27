# MCBE Essentials

**MCBE Essentials** is a collection of Web Tools built for Minecraft Bedrock Edition.

## License
This work is licensed under the Creative Commons Attribution-ShareAlike 4.0 International License. To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/4.0/ or send a letter to Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.

## Apps

Each app has been classified below. *Italicized* apps no longer recieve feature updates.

| Editors                    | Generators                 | Visualizers               | Converters                 |
| :------------------------: | :------------------------: | :-----------------------: | :------------------------: |
| World Packager             | Shape Coordinate Generator | Trade Table Previewer     | Structure to Function      |
| Trade Table Editor         | GiveNBT Generator          | Recipe Previewer          |                            |
| Dialogue Editor            | Selector Generator         | *Server Log to Graph*     |                            |
| Structure Editor           | Camera Movement Generator  |                           |                            |
| *Legacy Structure Editor*  | Tellraw Generator          |                           |                            |
| Loot Tabler                | Loopr                      |                           |                            |
|                            | Loopr Docs                 |                           |                            |
|                            | Instant Pack               |                           |                            |
|                            | World Generator            |                           |                            |

## Global code
Certain files are applied across the entire site for easy editing and consistency.
- `js/datahandler.js` 
- `js/bridge-connect.js`
- `navtop.html`
- `navleft.html`
- `minecraft-ui.css`
- `script.js`
- `style.css`

### Libraries
These files get used in multiple places depending on which apps need them.
- `leveldat.js` - Utilities for interacting with NBT data, parsed from `pnbt.js`
- `pnbt.js` - Library for reading and parsing NBT data.
- `filesaver.js` - Code to download File objects to the viewer's device. Also appended when `js/datahandler.js` is used.
- `jszip.js` - Creates and edits .zip files
- `item/` - The files in this folder control the item engine, which renders Minecraft items across the entire website

#### Discontinued
- `nbt.js` - Parses NBT data, but cannot write it
- `nbt2.js` - An alternate version of `nbt.js` that has support for reading past the bedrock.dat level header

### External Resources
*List coming soon!*

## Domains

The stable release is available at [https://mcbe-essentials.github.io](https://mcbe-essentials.github.io)

The nightly build is available at [https://mcbe-essentials.glitch.me](https://mcbe-essentials.glitch.me) but is only accesible if you have entered dev mode on the site. Features on the nightly build may not fully work.

\ ゜ o ゜)ノ