import app from "./app";
import { AppDataSource } from "./db/connection";

async function main() {
  try {
    await AppDataSource.initialize();
    console.log("Connected database");
    app.listen(3000, () => {
      console.log("Active Server on http://localhost:3000/api-docs");
    });
  } catch (err) {
    if (err instanceof Error) {
      console.log(err.message);
    }
  }
}

main();
