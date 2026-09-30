// Full (text + seal + background) template previews rendered offscreen, queued and cached.
import { StaticCanvas, type Canvas } from "fabric";
import { H, W } from "./renderer";
import { buildDesign, type Fields } from "./design";
import type { Category } from "./categories";

const cache = new Map<string, string>();
let chain: Promise<unknown> = Promise.resolve();

export function fullPreview(templateId: string, accent: string, cat: Category, fields: Fields): Promise<string> {
  const key = `${templateId}|${accent}|${cat.id}|${fields.name}`;
  const hit = cache.get(key);
  if (hit) return Promise.resolve(hit);
  const job = chain.then(async () => {
    const el = document.createElement("canvas");
    const sc = new StaticCanvas(el, { width: W, height: H, renderOnAddRemove: false });
    buildDesign(sc as unknown as Canvas, { templateId, accent, cat, fields });
    sc.renderAll();
    const url = sc.toDataURL({ format: "jpeg", quality: 0.8, multiplier: 360 / W });
    sc.dispose();
    cache.set(key, url);
    await new Promise((r) => setTimeout(r, 0));
    return url;
  });
  chain = job.catch(() => undefined);
  return job;
}
