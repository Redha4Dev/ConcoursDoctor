import "dotenv/config";
import app from "./app.js";
import { identityDb, correctionDb } from "./config/db.js";

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await identityDb.$connect();
    console.log("✓ Identity Database connected");

    await correctionDb.$connect();
    console.log("✓ Correction Database connected");

    app.listen(PORT, () => {
      console.log(`✓ Server running at http://localhost:${PORT}`);

      console.log(`documentaion here : http://localhost:${PORT}/api/docs `);
    });
  } catch (err) {
    console.error("✗ Failed to start server:", err);
    process.exit(1);
  }
};

start();
