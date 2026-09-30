import 'dotenv/config';
import app from "./app.js";
import connectDataBase from "./db/connection.js";
import seedAdmin from "./db/seedAdmin.js";

const PORT = process.env.PORT || 4000;

await connectDataBase();
await seedAdmin();

app.listen(PORT, () => {
    console.log(`Server ON || Hosted on: http://localhost:${PORT}`);
});
