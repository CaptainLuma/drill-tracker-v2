// import path from 'node:path'
// import os from 'node:os'
// import { app } from 'electron'
import { defineConfig } from 'drizzle-kit'

// const userDataPath = app?.getPath('userData') ?? path.join(
//     process.env.APPDATA ?? path.join(os.homedir(), '.config'),
//     'drill-tracker-v2'
// )
// console.log("userDataPath:", userDataPath)

export default defineConfig({
    dialect: 'sqlite',
    schema: './src/electron/drizzle/schema.ts',
    out: './drizzle/migrations',
    driver: "durable-sqlite",
    // dbCredentials: {
    //     url: path.join(userDataPath, 'data', 'drill-tracker.db'),
    // },
    verbose: true,
    strict: true,
})