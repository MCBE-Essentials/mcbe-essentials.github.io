const fs = require('fs')
const { LevelDB } = require('leveldb-zlib')
const { WorldProvider } = require('bedrock-provider')
const registry = require('prismarine-registry')('bedrock_1.17.10')
const Block = require('prismarine-block')(registry)
const ChunkColumn = require('prismarine-chunk')(registry)

async function main() {
  const x = 0, z = 0
  const cc = new ChunkColumn({ x, z })
  cc.setBlock({ x: 0, y: 1, z: 0 }, Block.fromStateId(registry.blocksByName.dirt.defaultState))

  // Create a new database and store this chunk in there
  const db = new LevelDB('./sample', { createIfMissing: true }) // Create a DB class
  await db.open() // Open the database
  const world = new WorldProvider(db, { dimension: 0 })
  world.save(x, z, cc) // Store this chunk in world
  await db.close() // Close it
  // Done! 😃
}