import { describe, it, expect } from "vitest";
import { Privateai } from "../src/core.js";
describe("Privateai", () => {
  it("init", () => { expect(new Privateai().getStats().ops).toBe(0); });
  it("op", async () => { const c = new Privateai(); await c.process(); expect(c.getStats().ops).toBe(1); });
  it("reset", async () => { const c = new Privateai(); await c.process(); c.reset(); expect(c.getStats().ops).toBe(0); });
});
