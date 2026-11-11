/**
 * Sanitizes NBT data to ensure all byte values are valid (-128 to 127).
 */
function sanitizeNBT(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  if (obj.type === 'byteArray' && Array.isArray(obj.value)) {
    obj.value = obj.value.map(v => {
      if (v === undefined || v === null || isNaN(v)) return 0;
      let n = Number(v);
      if (n > 127) n = n - 256;
      if (n < -128) n = -128;
      return n;
    });
    return obj;
  }

  if (obj.type === 'byte' && (obj.value === undefined || obj.value === null || isNaN(obj.value))) {
    obj.value = 0;
    return obj;
  }

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) obj[i] = sanitizeNBT(obj[i]);
  } else {
    for (const key of Object.keys(obj)) obj[key] = sanitizeNBT(obj[key]);
  }

  return obj;
}

/**
 * Reads and writes the compressed "structure" tag of format version 2 .mcstructure files.
 */
class StructureCompression {
  /**
   * Value of the root "compression" tag when the "structure" tag is zlib data.
   */
  static zlibCompressionType = 1;

  /**
   * Format name for zlib data in CompressionStream and DecompressionStream.
   */
  static zlibStreamFormat = 'deflate';

  /**
   * Checks if the "structure" tag of the root tag is a compressed byte array.
   *
   * @param rootTag - The parsed root tag of the file.
   *
   * @returns `true` if the "structure" tag is compressed, `false` otherwise.
   */
  static isCompressed(rootTag) {
    return rootTag.value.structure?.type === 'byteArray';
  }

  /**
   * Replaces the compressed "structure" tag of the root tag with the parsed compound.
   *
   * @param rootTag - The parsed root tag of the file. It is changed in place.
   *
   * @returns `true` if the "structure" tag was decompressed, `false` otherwise.
   */
  static async decompressStructure(rootTag) {
    let compressionType = rootTag.value.compression?.value;
    if (compressionType !== this.zlibCompressionType) {
      console.error(`StructureCompression/decompressStructure: Unknown compression type '${compressionType}'`);
      return false;
    }

    let compressedBytes = new Uint8Array(Int8Array.from(rootTag.value.structure.value).buffer);
    let structureBytes = await this.transformBytes(compressedBytes, new DecompressionStream(this.zlibStreamFormat));
    let structureTag = nbt.parseUncompressed(Buffer.from(structureBytes), 'little');

    rootTag.value.structure = { type: 'compound', value: structureTag.value };
    return true;
  }

  /**
   * Writes the root tag to little endian NBT bytes. Compresses the "structure" tag when the root tag has a zlib "compression" tag.
   *
   * @param rootTag - The root tag to write. It is not changed.
   *
   * @returns The bytes of the .mcstructure file.
   */
  static async writeStructure(rootTag) {
    if (rootTag.value.compression?.value !== this.zlibCompressionType) return nbt.writeUncompressed(rootTag, 'little');

    let cleanValue = sanitizeNBT(structuredClone(rootTag.value.structure.value));
    let structureBytes = nbt.writeUncompressed({ type: 'compound', name: '', value: cleanValue }, 'little');
    let compressedBytes = await this.transformBytes(structureBytes, new CompressionStream(this.zlibStreamFormat));
    let compressedRootTag = {
      type: rootTag.type,
      name: rootTag.name,
      value: { ...rootTag.value, structure: { type: 'byteArray', value: Array.from(new Int8Array(compressedBytes.buffer)) } }
    };

    return nbt.writeUncompressed(compressedRootTag, 'little');
  }

  /**
   * Sends the bytes through a compression or decompression stream.
   *
   * @param bytes - The input bytes.
   * @param transformStream - The CompressionStream or DecompressionStream to use.
   *
   * @returns The output bytes.
   */
  static async transformBytes(bytes, transformStream) {
    let response = new Response(new Blob([bytes]).stream().pipeThrough(transformStream));
    return new Uint8Array(await response.arrayBuffer());
  }
}
