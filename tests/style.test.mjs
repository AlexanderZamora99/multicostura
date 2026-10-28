import { test } from "node:test";
import assert from "node:assert/strict";
import { render, source as pageSource } from "./render.mjs";

const { html } = render();
const source = pageSource();
const rule = sel => {
  const m = source.match(new RegExp(`(?:^|\\n)\\s*${sel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\{([^}]*)\\}`));
  return m ? m[1] : "";
};

test("no cursive/serif display font is referenced", () => {
  assert.doesNotMatch(html, /Cormorant/);
  assert.doesNotMatch(html, /font-style:\s*italic/);
});

test("hero headline has no emphasized (italic) span", () => {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1];
  assert.doesNotMatch(h1, /<em>/);
});

test("backgrounds are neutral (no pink washes)", () => {
  assert.doesNotMatch(rule(".hero"), /radial-gradient|rgba\(214/);
  assert.match(rule(".alt"), /var\(--bg-2\)/);
  assert.match(source, /--bg-2:\s*#f4f4f4/i);
  assert.doesNotMatch(rule(".box.pinkbox"), /#fbd3e5|#f7a9cc/);
});

// changed: the trust block is now the canon light-grey block with line icons (it was a black strip)
test("trust block is light grey with near-black text, not fuchsia", () => {
  assert.match(rule(".trust"), /background:\s*var\(--bg-2\)/);
  assert.doesNotMatch(rule(".trust strong"), /var\(--mag\)/);
});
