//Parser.js - Convert MCBE concepts to JSON and vice versa
//This file is just a concept and has no functionality whatsoever.
/*
  Support for:
  - Coordinates
  - Selectors
  - Identifiers
  - Score / Hasitem ranges
*/

const McbeFormatParser = {
  selector: {
    extract: function (sel) {
      if (!sel.includes("@")) {
        console.error("Invalid selector, missing @");
        return false;
      }
    },
    create: function (sel) {},
  },
  coordinate: {},
  identifier: {},
  range: {},
  command: {},
};

var exampleRange = {
  type: "range",
  min: 25,
  max: false //Continues upwards infinitly
  /*
    min: 4,
    max: 4 //A single number
  */
};

var exampleCoordinates = {
  type: "coordinate",
  x: {
    modifier: "~",
    value: -25
  },
  y: {
    modifier: "^",
    value: 69
  },
  z: {
    modifier: "",
    value: +2
  }
};

var exampleCommand = {
  type: "command",
  command: "dialogue",
  arguments: [
    "open",
    {
      type: "selector",
      value: "@e",
      arguments: {
        c: 0,
        type: {
          include: {
            type: "identifier",
            namespace: "minecraft",
            identifier: "npc",
            data: false
          }
        }
      }
    },
    {
      type: "selector",
      value: "@p",
      arguments: false
    },
    "my.scene"
  ]
};

var exampleIdentifier = {
  type: "identifier",
  namespace: "minecraft",
  identifier: "carrot",
  data: 3
};

var exampleSelector = {
  type: "selector",
  value: "@e",
  arguments: {
    x: 0,
    y: 0,
    z: 0,
    r: 0,
    rm: 0,
    c: 0,
    l: 0,
    lm: 0,
    rx: 0,
    rxm: 0,
    ry: 0,
    rym: 0,
    m: "c",
    name: {
      include: "myName",
      exclude: ["name1"],
    },
    type: {
      include: "m:id",
      exclude: ["m:id2"],
    },
    family: {
      include: "family1",
      exclude: ["family2"],
    },
    tag: {
      include: ["myTag", "myTag2"],
      exclude: ["tag3"],
    },
    scores: {
      foo: {
        type: "range",
        min: 1,
        max: 3
      },
    },
    hasitem: [
      {
        item: "my:item",
        data: 0,
        quantity: {
          type: "range",
          min: 1,
          max: 10
        },
        location: "slot.weapon.mainhand",
        slot: 0
      }
    ],
  },
};
