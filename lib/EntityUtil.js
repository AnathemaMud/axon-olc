'use strict';

const { Broadcast: B, Logger, Data, Room } = require('ranvier');

exports.save = (state, area, type, callback) => {
  switch (type.toLowerCase()) {
    case 'room':
      const r = __dirname + `/../../${area.bundle}/areas/${area.name}/rooms.yml`;
      console.log(r);
      const rooms = [];
      for (const [id, room] of [...area.rooms.entries()]) {
        const defToSave = JSON.parse(JSON.stringify(room.def));
        delete defToSave.entityReference;
        rooms.push(defToSave);
      }
      Data.saveFile(r, rooms, callback);
      area.changesMade.room = false;
      break;
    case 'area':
      const m = __dirname + `/../../${area.bundle}/areas/${area.name}/manifest.yml`;
      console.log(m);
      // Data.saveFile(m, area.saveDefinition(), callback);
      // area.changesMade.manifest = false;
      break;
    case 'npc':
      const n = __dirname + `/../../${area.bundle}/areas/${area.name}/npcs.yml`;
      console.log(n);
      const npcs = [];
      for (const mobER of [...area.defaultEntities.npcs]) {
        const mob = state.MobFactory.create(area, mobER);
        // npcs.push(mob.saveDefinition());
      }
      // Data.saveFile(n, npcs, callback);
      // area.changesMade.npc = false;
      break;
    case 'item':
      const i = __dirname + `/../../${area.bundle}/areas/${area.name}/items.yml`;
      console.log(i);
      const items = [];
      for (const itemER of [...area.defaultEntities.items]) {
        const item = state.ItemFactory.create(area, itemER);
        // items.push(item.saveDefinition());
      }
      // Data.saveFile(i, items, callback);
      // area.changesMade.item = false;
      break;
    case 'quest':
      const q = __dirname + `/../../${area.bundle}/areas/${area.name}/quests.yml`;
      console.log(q);
      const quests = [];
      for (const [id, questDef] of [...state.QuestFactory.quests.entries()]) {
        if (questDef.area === area.name) {
          // const defToSave = JSON.parse(JSON.stringify(questDef.config));
          // delete defToSave.entityReference;
          // quests.push(defToSave);
        }
      }
      // Data.saveFile(q, quests, callback);
      // area.changesMade.quest = false;
      break;
  }
}

exports.reloadFromRoomDefinition = (room, newDef) => {
  room.title = newDef.title;
  room.description = newDef.description;
  // room.behaviors = newDef.behaviors;
  room.defaultNpcs = newDef.npcs || [];
  room.defaultItems = newDef.items || [];
  room.defaultDoors = newDef.doors || {};
  room.exits = newDef.exits || [];
  room.def = newDef;
  room.defEdit = newDef;
}

exports.createRoomDefinition = (state, area, config = {}, player) => {
  if (config.id) {
    const existingRoom = state.RoomManager.getRoom(this.title + ":" + config.id);
    if (existingRoom) {
      Logger.warn(`Can't create a new room definition in AreaEx, ID:[${config.id}] already exists.`);
      return false;
    }
  } else {
    const newId = nextId(area.rooms.keys());
    if (isNaN(newId)) {
      Logger.warn(`Can't create find a nextRoomId for a new room definition in AreaEx, ID:[${config.id}].`);
      return false;
    }
    config.id = newId;
  }

  const createdByName = player ? ` created by ${player.capName}` : '';

  return {
    id: config.room && config.room.id || config.id || 0,
    title: config.room && config.room.title || config.title || `An Unfinished Room`,
    description: config.room && config.room.description || config.description || `An unfinished description${createdByName}.`,
    coordinates: config.room && config.room.coordinates || config.coordinates || [],
    exits: config.room && config.room.exits || config.exits || [],
    items: config.room && config.room.items || config.items || [],
    npcs: config.room && config.room.npcs || config.npcs || [],

    metadata: {},
  };
}

exports.createItemDefinition = (state, area, config = {}, player) => {
  if (config.id) {
    const existingItem = state.ItemFactory.entities.has(area.name + ':' + config.id);
    if (existingItem) {
      Logger.warn(`Can't create a new item definition, ID:[${config.id}] already exists.`);
      return false;
    }
  } else {
    const newId = nextId(state.ItemFactory.entities.keys());
    if (isNaN(newId)) {
      Logger.warn(`Can't create find a newId for a new item definition, ID:[${config.id}].`);
      return false;
    }
    config.id = newId;
  }

  const createdByName = player ? ` created by ${player.capName}` : '';

  return {
    id: config.item && config.item.id || config.id || 0,
    name: config.item && config.item.name || config.name || `an unfinished item`,
    description: config.item && config.item.description || config.description || ``,
    // behaviors: config.item && config.item.behaviors || config.behaviors || {},
    keywords: config.item && config.item.keywords || config.keywords || ['item', 'unfinished'],
    roomDesc: config.item && config.item.roomDesc || config.roomDesc || `An uninished item${createdByName} is here.`,
    type: config.item && config.item.type || config.type || ItemType.OBJECT,
    items: config.room && config.room.items || config.items || [],

    closeable: config.closeable && config.item.closeable || config.closeable || false,
    closed: config.closed && config.item.closed || config.closed || false,
    locked: config.locked && config.item.locked || config.locked || false,
    lockedBy: config.lockedBy && config.item.lockedBy || config.lockedBy || null,
    maxItems: config.maxItems && config.item.maxItems || config.maxItems || Infinity,

    metadata: {},
  };
}



// Hard limit of 1000, but can change if more are needed.
function nextId(idArray = []) {
  for (let i = 0; i < 1000; i++) {
    if (!idArray.includes(i)) {
      return i;
    }
  }
  Logger.warn(`Can't find a new ID.`);
  return false;
}