import { NewDrill } from '../shared/models/drill.js'
import * as database from './database.js'

export async function generateTestDrills(amount: number) {
    await database.addEvent({ name: "Event 1", color: "#2255cc"})
    await database.addEvent({ name: "Event 2", color: "#22aacc"})
    await database.addEvent({ name: "Event 3", color: "#bf21a7"})
    await database.addEvent({ name: "Event 4", color: "#bd6111"})
    await database.addLevel({ name: "Level 1", color: "#2255cc"})
    await database.addLevel({ name: "Level 2", color: "#22aacc"})
    await database.addLevel({ name: "Level 3", color: "#bf21a7"})
    await database.addLevel({ name: "Level 4", color: "#4e21bf"})

    const events = database.getEvents()
    const levels = database.getLevels()

    const drills: NewDrill[] = []

    for (let i = 0; i < amount; i++) {
        drills.push({
            name: `Drill ${i}`,
            description: getRandomDescription(200),
            events: events.filter(() => Math.random() < 0.5).map(x => x.id),
            levels: levels.filter(() => Math.random() < 0.5).map(x => x.id),
            image: null
        })
    }

    await database.addDrills(drills)
}

function getRandomDescription(length: number): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let result = "";

  while (result.length < length) {
    const remaining = length - result.length;
    const chunkLength = Math.min(
      Math.floor(Math.random() * 15) + 1,
      remaining
    );

    for (let i = 0; i < chunkLength; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }

    if (result.length < length && Math.random() < 0.3) {
      result += " ";
    }
  }

  return result;
}