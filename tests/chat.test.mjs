import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { render } from "./render.mjs";

const source = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const FAQS = (source.match(/claves:\s*\[/g) || []).length;

const { html, stderr } = render();
const dom = html.replace(/<script[\s\S]*?<\/script>/g, "");

// Simula una conversación: abrir, preguntar con tildes/mayúsculas, preguntar algo desconocido, usar un chip y pulsar Esc.
const flow = `(() => {
  const $ = id => document.getElementById(id), note = (k, v) => document.body.setAttribute("data-" + k, v);
  $("chat-btn").click();
  note("focus", document.activeElement.id);
  const ask = t => { $("chat-input").value = t; $("chat-form").requestSubmit(); };
  ask("¿CUÁNTO demoran en ENTREGARME el pedido?");
  ask("xyzzy qwerty");
  document.querySelector(".faq-chip").click();
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
  note("closed", $("chat-panel").hidden);
})();
`;
const talk = render({ inject: flow });
const log = talk.html.replace(/<script[\s\S]*?<\/script>/g, "");
const from = log.indexOf('id="chat-log"'), to = log.indexOf('id="chat-chips"');
const bubbles = from >= 0 && to > from ? log.slice(from, to) : ""; // solo las burbujas del chat

test("floating chat button and dialog panel exist", () => {
  assert.match(dom, /<button[^>]*id="chat-btn"[^>]*aria-label="[^"]+"/);
  assert.match(dom, /<div[^>]*id="chat-panel"[^>]*role="dialog"/);
});

test("one quick-reply chip per FAQ entry", () => {
  assert.ok(FAQS >= 6, "expected a meaningful FAQ");
  assert.equal((dom.match(/class="faq-chip"/g) || []).length, FAQS);
});

test("chat button does not overlap the WhatsApp float", () => {
  assert.match(source, /\.chat-btn\s*\{[^}]*bottom:\s*(9\d|1\d\d)px/);
});

test("opening the chat moves focus into the panel", () => {
  assert.match(log, /data-focus="chat-input"/);
});

test("free text is matched ignoring case and accents", () => {
  assert.ok(bubbles.length > 0 && /3 a 5 días hábiles/.test(bubbles));
});

test("unknown question offers the WhatsApp hand-off with a summary", () => {
  assert.ok(log.includes("No encontré eso. ¿Te comunico por WhatsApp?"));
  assert.match(log, /href="https:\/\/wa\.me\/573217830050\?text=[^"]*xyzzy%20qwerty/);
});

test("Escape closes the panel", () => {
  assert.match(log, /data-closed="true"/);
});

test("chatbot runs without uncaught errors", () => {
  assert.doesNotMatch(stderr, /Uncaught/);
  assert.doesNotMatch(talk.stderr, /Uncaught/);
});
