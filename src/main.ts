import "./styles.css";
import { startPrototype } from "./ui/controller";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("缺少 #app 根节点");
}

startPrototype(app);
