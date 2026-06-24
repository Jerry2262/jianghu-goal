import "./styles.css";
import { startPrototype } from "./ui/controller";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Missing #app root");
}

startPrototype(app);
