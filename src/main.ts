import "./styles.css";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Missing #app root");
}

app.innerHTML = `
  <section class="shell">
    <h1>Jianghu Goal</h1>
    <p>Prototype booted.</p>
  </section>
`;
