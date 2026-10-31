// Purchase-assistant conversation: custom embroidery thread carries through to the WhatsApp order.
import test from "node:test";
import assert from "node:assert/strict";
import { render } from "./render.mjs";

const probe = `
  setTimeout(async () => {
    const click = async text => {
      const option = [...document.querySelectorAll("#chat-chips button")].find(b => b.textContent.includes(text));
      if (!option) throw new Error("Missing option: " + text);
      option.click();
    };
    const send = text => {
      const input = document.getElementById("chat-in");
      input.value = text;
      document.getElementById("chat-form").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    };
    try {
      document.getElementById("chat-btn").click();
      await click("Hacer un pedido");
      await click("Esencia");
      await click("Azul rey");
      await click("Diseño bajo pedido");
      await click("En el taller");
      await click("2");
      await click("Sí, con bordado");
      send("Dra. Ana");
      send("Odontóloga");
      await click("Otro color");
      send("Verde oliva");
      await click("Envío a otra ciudad");
      send("Cali, Calle 10 #20-30");
      send("Ana Pérez");
      send("3001234567");
      const link = document.querySelector("#chat-chips a.principal");
      const message = link && new URL(link.href).searchParams.get("text");
      document.body.insertAdjacentHTML("beforeend", '<pre id="chat-probe">' + JSON.stringify({
        button: link && link.textContent,
        message,
        summary: document.querySelector("#chat-log .msg.bot:last-child").textContent,
      }) + "</pre>");
    } catch (error) {
      document.body.insertAdjacentHTML("beforeend", '<pre id="chat-probe">' + JSON.stringify({ error: error.message }) + "</pre>");
    }
  }, 0);
`;
const html = render({ inject: probe }).html;
const result = JSON.parse((html.match(/<pre id="chat-probe">([\s\S]*?)<\/pre>/) || [, "{}"])[1]);

test("chatbot offers a custom embroidery thread and explains it can be ordered", () => {
  assert.equal(result.error, undefined);
  assert.match(result.summary, /no está disponible actualmente/i);
  assert.match(result.summary, /consultaremos por WhatsApp si se puede encargar/i);
});

test("final WhatsApp action includes the complete order and custom thread request", () => {
  assert.equal(result.error, undefined);
  assert.match(result.button, /Confirmar y enviar pedido por WhatsApp/);
  for (const detail of [
    "Modelo: Esencia",
    "Color: Azul rey",
    "Diseño bajo pedido",
    "Cantidad: 2",
    "Dra. Ana / Odontóloga",
    "hilo Verde oliva por encargar",
    "Entrega: Envío a: Cali, Calle 10 #20-30",
    "Nombre: Ana Pérez",
    "Celular: 3001234567",
    "Hilo especial solicitado: Verde oliva",
    "precio final se confirma al tomar las medidas",
    "envío se cotiza según el destino",
  ]) assert.ok(result.message.includes(detail), `WhatsApp message includes ${detail}`);
});
