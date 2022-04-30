# MCBE Essentials

**MCBE Essentials** is a collection of Web Tools built for Minecraft Bedrock Edition.

## Apps

The site currently has 8 functioning apps and 1 shadow application (doesn't appear in the site's shortcuts).

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
