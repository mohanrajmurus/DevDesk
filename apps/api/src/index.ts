// Local dev entrypoint. On Vercel the platform imports the default export from
// app.ts and runs it as a function — this file is not used there. The DB
// connection is established lazily by middleware in app.ts.
import "dotenv/config";
import { app } from "./app.js";

const PORT = process.env.PORT ?? 4000;

app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
