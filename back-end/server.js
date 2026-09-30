import 'dotenv/config';
import app from "./app.js";
import connectDataBase from "./db/connection.js";

const PORT = process.env.PORT || 4000;

await connectDataBase();

app.listen(PORT, () => {
    console.log(`Server ON || Hosted on: http://localhost:${PORT}`);
});
