// Builds editable Fabric objects for a template. Browser-only.
import { Canvas, FabricImage, Line, Textbox, type FabricObject } from "fabric";
import { H, W, drawSeal, type Theme, type Signature } from "./renderer";
import { paintBackground } from "./backgrounds";
import type { Category } from "./categories";

export type Fields = { name: string; eventTitle: string; eventDate: string; organizer: string; signatures: Signature[]; certId: string };

export const fam = (s: string) => s.split(",")[0]!.replace(/['"]/g, "").trim();
const measure = document.createElement("canvas").getContext("2d")!;

function fitSize(txt: string, family: string, weight: string, size: number, maxW: number, spacing = 0) {
  let s = size;
  while (s > 20) {
    measure.font = `${weight} ${s}px "${family}"`;
    const w = measure.measureText(txt).width + txt.length * s * (spacing / 1000);
    if (w <= maxW) break;
    s -= 3;
  }
  return s;
}

export function sealCanvas(color: string, label: string, ink: string, size = 360) {
  const cv = document.createElement("canvas");
  cv.width = size; cv.height = size;
  drawSeal(cv.getContext("2d")!, size / 2, size / 2, size / 2 - 4, color, label || "★", ink);
  return cv;
}

export function setBackground(fc: Canvas, templateId: string, accent: string) {
  const { canvas, theme } = paintBackground(templateId, accent);
  const img = new FabricImage(canvas, { selectable: false, evented: false, objectCaching: false, width: W, height: H, originX: "left", originY: "top", left: 0, top: 0 });
  fc.backgroundColor = "";
  fc.backgroundImage = img;
  return theme;
}

type Opts = { templateId: string; accent: string; cat: Category; fields: Fields; texts?: Partial<Record<string, string>> };

export function buildDesign(fc: Canvas, o: Opts) {
  fc.clear();
  const t: Theme = setBackground(fc, o.templateId, o.accent);
  fc.set("data", { templateId: o.templateId, accent: o.accent });
  const center = t.align === "center";
  const x = center ? W / 2 : t.left;
  const maxW = center ? W - 900 : W - t.left - 760;
  const T = (role: string, fallback: string) => o.texts?.[role] ?? fallback;

  const add = (role: string, txt: string, y: number, fontFamily: string, weight: string, size: number, fill: string, spacing = 0, extra: Partial<Textbox> = {}) => {
    const family = fam(fontFamily);
    const tb = new Textbox(txt, {
      left: x, top: y, originX: center ? "center" : "left", originY: "center",
      width: maxW, textAlign: center ? "center" : "left",
      fontFamily: family, fontWeight: weight, fontSize: fitSize(txt, family, weight, size, maxW, spacing),
      fill, charSpacing: spacing, splitByGrapheme: false, ...extra,
    });
    (tb as FabricObject & { data?: unknown }).data = { role };
    fc.add(tb);
    return tb;
  };

  let y = t.top;
  if (o.fields.organizer) { add("organizer", T("organizer", o.fields.organizer.toUpperCase()), y, t.labelFont, "600", 34, t.muted, 300); y += 110; }
  add("title", T("title", o.cat.title.toUpperCase()), y, t.titleFont, t.titleWeight, 86, t.ink, t.titleTracking * 12); y += 130;
  add("subtitle", T("subtitle", o.cat.subtitle), y, t.bodyFont, "400", 42, t.muted); y += 190;
  add("name", o.fields.name, y, t.nameFont, t.nameWeight, t.nameSize, t.ink); y += 140;
  const rule = new Line(center ? [W / 2 - 360, y, W / 2 + 360, y] : [t.left, y, t.left + 520, y], { stroke: t.ruleColor, strokeWidth: 5 });
  fc.add(rule); y += 100;
  add("description", T("description", o.cat.description), y, t.bodyFont, "400", 42, t.muted); y += 95;
  add("event", T("event", o.fields.eventTitle), y, t.titleFont, "700", 64, t.eventColor); y += 85;
  if (o.fields.eventDate) add("date", T("date", o.fields.eventDate.toUpperCase()), y, t.labelFont, "600", 30, t.muted, 240);

  // signatures
  const sigs = o.fields.signatures.filter((s) => s.name.trim());
  const sigY = H - 330;
  const area = center ? W * 0.62 : W - t.left - 800;
  const sx = center ? (W - area) / 2 : t.left;
  const step = area / Math.max(1, sigs.length);
  sigs.forEach((s, i) => {
    const cx = center ? sx + step * i + step / 2 : sx + step * i + 230;
    const mk = (txt: string, yy: number, family: string, weight: string, size: number, fill: string, spacing = 0, role = "sig") => {
      const f = fam(family);
      const tb = new Textbox(txt, { left: cx, top: yy, originX: "center", originY: "center", width: 440, textAlign: "center", fontFamily: f, fontWeight: weight, fontSize: fitSize(txt, f, weight, size, 440, spacing), fill, charSpacing: spacing });
      (tb as FabricObject & { data?: unknown }).data = { role };
      fc.add(tb);
    };
    mk(s.name, sigY - 55, "Great Vibes", "400", 72, t.ink, 0, "sigScript");
    fc.add(new Line([cx - 190, sigY, cx + 190, sigY], { stroke: t.ink, strokeWidth: 3, opacity: 0.7 }));
    mk(s.name.toUpperCase(), sigY + 45, t.labelFont, "700", 28, t.ink, 150);
    mk(s.role.toUpperCase(), sigY + 90, t.labelFont, "500", 22, t.muted, 200);
  });

  // seal
  const seal = new FabricImage(sealCanvas(t.accent, o.cat.badge, t.sealInk), {
    left: center ? W - 300 : W - 420, top: center ? H - 360 : H / 2 - 80, originX: "center", originY: "center",
  });
  (seal as FabricObject & { data?: unknown }).data = { role: "seal", color: t.accent, ink: t.sealInk, label: o.cat.badge };
  fc.add(seal);

  // certificate id
  add("certId", `CERTIFICATE ID · ${o.fields.certId}`, 168, "JetBrains Mono", "500", 22, t.muted, 150, center ? {} : { left: t.left });
  fc.requestRenderAll();
  return t;
}

export function textOf(fc: Canvas, role: string) {
  const o = fc.getObjects().find((x) => (x as FabricObject & { data?: { role?: string } }).data?.role === role) as Textbox | undefined;
  return o?.text;
}
