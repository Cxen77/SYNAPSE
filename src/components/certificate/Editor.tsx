import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActiveSelection, Canvas, Circle, FabricImage, Gradient, Group, Line, Path, Polygon, Rect, Shadow, Textbox, Triangle, type FabricObject } from "fabric";
import QRCode from "qrcode";
import {
  AlignCenter, AlignLeft, AlignRight, ArrowDown, ArrowUp, Bold, Circle as CircleIcon, Copy, Download, FileText, Image as ImageIcon,
  Images, Italic, LayoutTemplate, Minus, PenLine, QrCode, Redo2, Save, Shapes, Square, Star, Trash2, Type, Undo2, Upload, Users, ZoomIn, ZoomOut, Award, Palette, Ribbon,
  Lock, Unlock, Eye, EyeOff, FlipHorizontal2, FlipVertical2, Layers, Grid3x3, Search, Triangle as TriIcon, ArrowRight, FileJson, Group as GroupIcon, Ungroup, CloudUpload,
} from "lucide-react";
import { CATEGORIES, type Category } from "@/lib/certificate/categories";
import { TEMPLATE_LIST } from "@/lib/certificate/backgrounds";
import "@/lib/certificate/templates-extra";
import "@/lib/certificate/templates-more";
import { fullPreview } from "@/lib/certificate/preview";
import { H, W } from "@/lib/certificate/renderer";
import { buildDesign, sealCanvas, setBackground, textOf, type Fields } from "@/lib/certificate/design";
import { ensureFonts } from "@/components/certificate/CertificateCanvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

type Obj = FabricObject & { data?: Record<string, unknown> };
const AUTOSAVE = "cert-studio-autosave-v2";
const MINE = "cert-studio-my-templates";
const UPLOADS = "cert-studio-uploads";
const FONTS = ["Playfair Display", "Cormorant Garamond", "Libre Baskerville", "Cinzel", "Great Vibes", "Pinyon Script", "Montserrat", "Manrope", "Space Grotesk", "JetBrains Mono"];
const PANELS = [
  { id: "templates", label: "Templates", icon: LayoutTemplate },
  { id: "uploads", label: "Uploads", icon: CloudUpload },
  { id: "elements", label: "Elements", icon: Shapes },
  { id: "types", label: "Types", icon: Award },
  { id: "background", label: "Background", icon: Palette },
  { id: "layers", label: "Layers", icon: Layers },
  { id: "bulk", label: "Bulk", icon: Users },
  { id: "saved", label: "Saved", icon: Save },
] as const;
type Panel = (typeof PANELS)[number]["id"];

const DEFAULT_FIELDS: Fields = {
  name: "Aarav Sharma", eventTitle: "Synapse Hackathon 2026", eventDate: "March 14, 2026", organizer: "Synapse Tech Club",
  signatures: [{ name: "Priya Nair", role: "Event Coordinator" }, { name: "Dr. R. Menon", role: "Head of Department" }], certId: "SYN-2026-000123",
};

function download(url: string, name: string) { const a = document.createElement("a"); a.href = url; a.download = name; a.click(); }
const slug = (s: string) => s.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "") || "certificate";
const readFile = (f: File) => new Promise<string>((r) => { const fr = new FileReader(); fr.onload = () => r(fr.result as string); fr.readAsDataURL(f); });
/** Downscale large photos so they fit in browser storage. SVG kept as-is. */
async function shrink(url: string, max = 1400): Promise<string> {
  if (url.startsWith("data:image/svg")) return url;
  const img = new Image(); img.src = url; await img.decode();
  const s = Math.min(1, max / Math.max(img.width, img.height));
  if (s === 1 && url.length < 900_000) return url;
  const c = document.createElement("canvas"); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL(url.startsWith("data:image/png") ? "image/png" : "image/jpeg", 0.88);
}
const isImage = (o: unknown): boolean => o instanceof FabricImage;
const starPts = (r: number) => Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + (Math.PI * i) / 5; const rr = i % 2 ? r * 0.45 : r; return { x: Math.cos(a) * rr, y: Math.sin(a) * rr }; });

function TemplateCard({ id, name, accent, cat, active, onPick }: { id: string; name: string; accent: string; cat: Category; active: boolean; onPick: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    const el = ref.current!; let alive = true;
    const io = new IntersectionObserver(([e]) => {
      if (!e?.isIntersecting) return; io.disconnect();
      ensureFonts().then(() => fullPreview(id, accent, cat, DEFAULT_FIELDS)).then((u) => alive && setSrc(u)).catch(() => {});
    }, { rootMargin: "200px" });
    io.observe(el); return () => { alive = false; io.disconnect(); };
  }, [id, accent, cat]);
  return (
    <button ref={ref} onClick={onPick} className={`group overflow-hidden rounded-md border-2 text-left transition ${active ? "border-primary" : "border-border hover:border-muted-foreground"}`}>
      <div className="relative aspect-[2480/1754] w-full overflow-hidden bg-muted">
        {src ? <img src={src} alt={name} className="block size-full object-cover transition duration-300 group-hover:scale-105" /> : <div className="size-full animate-pulse" />}
      </div>
      <p className="px-2 py-1 text-xs font-semibold">{name}</p>
    </button>
  );
}

export default function Editor() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const elRef = useRef<HTMLCanvasElement>(null);
  const fcRef = useRef<Canvas | null>(null);
  const hist = useRef<{ stack: string[]; idx: number; lock: boolean }>({ stack: [], idx: -1, lock: false });
  const clip = useRef<Obj | null>(null);
  const [panel, setPanel] = useState<Panel>("templates");
  const [sel, setSel] = useState<Obj | null>(null);
  const [, force] = useState(0);
  const [zoomF, setZoomF] = useState(1);
  const [fit, setFit] = useState(0.4);
  const [templateId, setTemplateId] = useState("degree");
  const [accent, setAccent] = useState("#1e3a8a");
  const [catId, setCatId] = useState("participation");
  const [recipients, setRecipients] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [mine, setMine] = useState<{ name: string; json: string; thumb: string }[]>([]);
  const [saveName, setSaveName] = useState("");
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [uploads, setUploads] = useState<string[]>([]);
  const [tplQuery, setTplQuery] = useState("");
  const [tplGroup, setTplGroup] = useState("All");
  const [grid, setGrid] = useState(false);
  const [dragging, setDragging] = useState(false);
  useEffect(() => { try { setUploads(JSON.parse(localStorage.getItem(UPLOADS) || "[]")); } catch { /* ignore */ } }, []);
  const zoom = fit * zoomF;

  const fc = () => fcRef.current!;
  const rerender = () => force((n) => n + 1);

  const snapshot = useCallback(() => {
    const c = fcRef.current; const h = hist.current;
    if (!c || h.lock) return;
    const json = JSON.stringify(c.toObject(["data"]));
    h.stack = h.stack.slice(0, h.idx + 1); h.stack.push(json);
    if (h.stack.length > 50) h.stack.shift();
    h.idx = h.stack.length - 1;
    setCanUndo(h.idx > 0); setCanRedo(false);
    try { localStorage.setItem(AUTOSAVE, json); } catch { /* quota */ }
  }, []);

  const loadJSON = useCallback(async (json: string) => {
    const c = fc(); hist.current.lock = true;
    await c.loadFromJSON(JSON.parse(json));
    c.requestRenderAll(); hist.current.lock = false;
    const d = (c as unknown as { data?: { templateId?: string; accent?: string } }).data;
    if (d?.templateId) setTemplateId(d.templateId);
    if (d?.accent) setAccent(d.accent);
    setSel(null);
  }, []);

  const undo = async () => { const h = hist.current; if (h.idx <= 0) return; h.idx--; await loadJSON(h.stack[h.idx]!); setCanUndo(h.idx > 0); setCanRedo(true); };
  const redo = async () => { const h = hist.current; if (h.idx >= h.stack.length - 1) return; h.idx++; await loadJSON(h.stack[h.idx]!); setCanUndo(true); setCanRedo(h.idx < h.stack.length - 1); };

  const cat = useMemo(() => CATEGORIES.find((c) => c.id === catId)!, [catId]);

  const build = useCallback((tid: string, acc: string, c: Category, keepText: boolean) => {
    const f = fc();
    const texts: Record<string, string> = {};
    const fields = { ...DEFAULT_FIELDS };
    if (keepText) {
      for (const r of ["organizer", "title", "subtitle", "description", "event", "date"]) { const v = textOf(f, r); if (v) texts[r] = v; }
      fields.name = textOf(f, "name") ?? fields.name;
    }
    hist.current.lock = true;
    buildDesign(f, { templateId: tid, accent: acc, cat: c, fields, texts });
    hist.current.lock = false;
    setSel(null); snapshot();
  }, [snapshot]);

  // init
  useEffect(() => {
    let disposed = false;
    const c = new Canvas(elRef.current!, { preserveObjectStacking: true, backgroundColor: "#ffffff" });
    fcRef.current = c;
    const onSel = () => setSel((c.getActiveObject() as Obj) ?? null);
    c.on("selection:created", onSel); c.on("selection:updated", onSel); c.on("selection:cleared", () => setSel(null));
    c.on("object:modified", () => { snapshot(); rerender(); });
    c.on("text:changed", () => rerender());
    c.on("object:added", () => rerender()); c.on("object:removed", () => rerender());
    c.on("text:editing:exited", () => snapshot());
    // snap to center
    let guides: { v: boolean; h: boolean } = { v: false, h: false };
    c.on("object:moving", (e) => {
      const o = e.target; const p = o.getCenterPoint(); const th = 14;
      guides = { v: Math.abs(p.x - W / 2) < th, h: Math.abs(p.y - H / 2) < th };
      if (guides.v || guides.h) o.setPositionByOrigin({ x: guides.v ? W / 2 : p.x, y: guides.h ? H / 2 : p.y } as never, "center", "center");
    });
    c.on("mouse:up", () => { guides = { v: false, h: false }; c.requestRenderAll(); });
    c.on("after:render", () => {
      if (!guides.v && !guides.h) return;
      const ctx = c.getContext(); const z = c.getZoom();
      ctx.save(); ctx.strokeStyle = "#ec4899"; ctx.lineWidth = 1; ctx.setLineDash([6, 4]);
      if (guides.v) { ctx.beginPath(); ctx.moveTo((W / 2) * z, 0); ctx.lineTo((W / 2) * z, H * z); ctx.stroke(); }
      if (guides.h) { ctx.beginPath(); ctx.moveTo(0, (H / 2) * z); ctx.lineTo(W * z, (H / 2) * z); ctx.stroke(); }
      ctx.restore();
    });
    ensureFonts().then(async () => {
      if (disposed) return;
      const saved = localStorage.getItem(AUTOSAVE);
      if (saved) { try { await loadJSON(saved); snapshot(); } catch { build("degree", "#1e3a8a", CATEGORIES[0]!, false); } }
      else build("degree", "#1e3a8a", CATEGORIES[0]!, false);
    });
    try { setMine(JSON.parse(localStorage.getItem(MINE) || "[]")); } catch { /* ignore */ }
    return () => { disposed = true; c.dispose(); fcRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // fit to container
  useEffect(() => {
    const el = wrapRef.current!;
    const ro = new ResizeObserver(() => setFit(Math.max(0.1, (el.clientWidth - 32) / W)));
    ro.observe(el); return () => ro.disconnect();
  }, []);
  useEffect(() => { const c = fcRef.current; if (!c) return; c.setDimensions({ width: W * zoom, height: H * zoom }); c.setZoom(zoom); c.requestRenderAll(); }, [zoom]);

  // keyboard
  useEffect(() => {
    const onKey = async (e: KeyboardEvent) => {
      const c = fcRef.current; if (!c) return;
      const tgt = e.target as HTMLElement;
      if (tgt.tagName === "INPUT" || tgt.tagName === "TEXTAREA") return;
      const a = c.getActiveObject() as (Obj & { isEditing?: boolean }) | undefined;
      if (a?.isEditing) return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "z") { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
      if (mod && e.key.toLowerCase() === "y") { e.preventDefault(); redo(); return; }
      if (!a) return;
      if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); removeSel(); }
      if (mod && e.key.toLowerCase() === "c") clip.current = a;
      if (mod && e.key.toLowerCase() === "v" && clip.current) { e.preventDefault(); duplicate(clip.current); }
      if (mod && e.key.toLowerCase() === "d") { e.preventDefault(); duplicate(a); }
      if (mod && e.key.toLowerCase() === "g") { e.preventDefault(); e.shiftKey ? ungroupSel() : groupSel(); return; }
      if (mod && e.key.toLowerCase() === "l") { e.preventDefault(); toggleLock(a); return; }
      const step = e.shiftKey ? 20 : 4;
      const mv: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
      if (mv[e.key]) { e.preventDefault(); a.set({ left: a.left + mv[e.key]![0], top: a.top + mv[e.key]![1] }); a.setCoords(); c.requestRenderAll(); snapshot(); }
    };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  });

  // ---------- actions ----------
  const addObj = (o: FabricObject, role?: string) => {
    if (role) (o as Obj).data = { role };
    const c = fc(); c.add(o); c.setActiveObject(o); c.requestRenderAll(); snapshot();
  };
  const removeSel = () => { const c = fc(); c.getActiveObjects().forEach((o) => c.remove(o)); c.discardActiveObject(); c.requestRenderAll(); snapshot(); };
  const duplicate = async (o: Obj) => { const cl = (await o.clone(["data"])) as Obj; cl.set({ left: o.left + 40, top: o.top + 40 }); addObj(cl); };
  const update = (props: Record<string, unknown>) => { if (!sel) return; sel.set(props); sel.setCoords(); fc().requestRenderAll(); rerender(); snapshot(); };
  const layer = (dir: "up" | "down") => { if (!sel) return; const c = fc(); dir === "up" ? c.bringObjectForward(sel) : c.sendObjectBackwards(sel); c.requestRenderAll(); snapshot(); };

  const text = (t: string, size: number, family: string, weight = "400") =>
    addObj(new Textbox(t, { left: W / 2, top: H / 2, originX: "center", originY: "center", width: 1000, textAlign: "center", fontSize: size, fontFamily: family, fontWeight: weight, fill: "#111827" }));

  const addImage = async (file: File, role?: string) => {
    const url = await readFile(file);
    const img = await FabricImage.fromURL(url);
    img.scaleToWidth(role === "signature" ? 380 : 320);
    img.set({ left: W / 2, top: H / 2, originX: "center", originY: "center" });
    addObj(img, role);
  };
  const addQR = async () => {
    const id = textOf(fc(), "certId")?.split("·").pop()?.trim() || "SYN-CERT";
    const url = await QRCode.toDataURL(`https://synapse.app/verify/${id}`, { margin: 1, width: 400 });
    const img = await FabricImage.fromURL(url); img.scaleToWidth(220);
    img.set({ left: 260, top: H - 280, originX: "center", originY: "center" }); addObj(img, "qr");
  };
  const addSeal = () => {
    const img = new FabricImage(sealCanvas(accent, cat.badge, "#ffffff"), { left: W / 2, top: H / 2, originX: "center", originY: "center" });
    (img as Obj).data = { role: "seal", color: accent, ink: "#ffffff", label: cat.badge };
    addObj(img);
  };
  const addRibbon = () => addObj(new Polygon([{ x: 0, y: 0 }, { x: 900, y: 0 }, { x: 840, y: 60 }, { x: 900, y: 120 }, { x: 0, y: 120 }, { x: 60, y: 60 }], { left: W / 2, top: H / 2, originX: "center", originY: "center", fill: accent }));

  const updateSeal = (patch: { color?: string; label?: string }) => {
    if (!sel || sel.data?.["role"] !== "seal") return;
    const d = { ...(sel.data as { color: string; ink: string; label: string }), ...patch };
    (sel as unknown as FabricImage).setElement(sealCanvas(d.color, d.label, d.ink));
    sel.data = { ...d, role: "seal" }; fc().requestRenderAll(); rerender(); snapshot();
  };

  const pickType = (c: Category) => {
    setCatId(c.id);
    const f = fc();
    const map: Record<string, string> = { title: c.title.toUpperCase(), subtitle: c.subtitle, description: c.description };
    f.getObjects().forEach((o) => {
      const r = (o as Obj).data?.["role"] as string | undefined;
      if (r && map[r]) (o as Textbox).set("text", map[r]);
      if (r === "seal") { const d = (o as Obj).data as { color: string; ink: string }; (o as unknown as FabricImage).setElement(sealCanvas(d.color, c.badge, d.ink)); (o as Obj).data = { ...d, role: "seal", label: c.badge }; }
    });
    f.requestRenderAll(); snapshot();
  };

  const setBg = (kind: "solid" | "gradient", a: string, b?: string) => {
    const c = fc(); (c as unknown as { backgroundImage?: unknown }).backgroundImage = undefined;
    c.backgroundColor = kind === "solid" ? a : (new Gradient({ type: "linear", coords: { x1: 0, y1: 0, x2: W, y2: H }, colorStops: [{ offset: 0, color: a }, { offset: 1, color: b! }] }) as never);
    c.requestRenderAll(); snapshot();
  };
  const bgImage = async (file: File) => {
    const img = await FabricImage.fromURL(await readFile(file));
    img.set({ scaleX: W / img.width, scaleY: H / img.height, selectable: false, evented: false, objectCaching: false, originX: "left", originY: "top", left: 0, top: 0 });
    const c = fc(); c.backgroundImage = img; c.requestRenderAll(); snapshot();
  };

  // ---------- export ----------
  const render = (mime: "image/png" | "image/jpeg" = "image/png") => {
    const c = fc(); c.discardActiveObject(); c.requestRenderAll();
    return c.toDataURL({ format: mime === "image/png" ? "png" : "jpeg", quality: 0.92, multiplier: 1 / zoom });
  };
  const withName = (name: string, idx: number, fn: () => void) => {
    const c = fc(); const saved: [Textbox, string][] = [];
    c.getObjects().forEach((o) => {
      if (!(o instanceof Textbox)) return;
      const r = (o as Obj).data?.["role"]; saved.push([o, o.text]);
      let t = o.text.replaceAll("{name}", name);
      if (r === "name") t = name;
      if (r === "certId") t = `CERTIFICATE ID · SYN-${new Date().getFullYear()}-${String(idx + 1).padStart(6, "0")}`;
      o.set("text", t);
    });
    hist.current.lock = true; fn();
    saved.forEach(([o, t]) => o.set("text", t)); c.requestRenderAll(); hist.current.lock = false;
  };
  const names = recipients.split("\n").map((s) => s.split(",")[0]!.trim()).filter(Boolean);
  const currentName = () => textOf(fc(), "name") || "certificate";

  const exportPng = () => download(render(), `${slug(currentName())}.png`);
  const exportPdf = async (list: string[] | null) => {
    setBusy("pdf");
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    if (!list) pdf.addImage(render("image/jpeg"), "JPEG", 0, 0, 297, 210);
    else list.forEach((n, i) => withName(n, i, () => { if (i) pdf.addPage(); pdf.addImage(render("image/jpeg"), "JPEG", 0, 0, 297, 210); }));
    pdf.save(list ? "certificates.pdf" : `${slug(currentName())}.pdf`); setBusy(null);
  };
  const exportZip = async () => {
    setBusy("zip");
    const JSZip = (await import("jszip")).default; const zip = new JSZip();
    names.forEach((n, i) => withName(n, i, () => zip.file(`${String(i + 1).padStart(3, "0")}_${slug(n)}.png`, render().split(",")[1]!, { base64: true })));
    const blob = await zip.generateAsync({ type: "blob" }); download(URL.createObjectURL(blob), "certificates.zip"); setBusy(null);
  };

  const saveMine = () => {
    const json = JSON.stringify(fc().toObject(["data"]));
    const t = fc().toDataURL({ format: "jpeg", quality: 0.7, multiplier: 300 / (W * zoom) });
    const next = [{ name: saveName || `Design ${mine.length + 1}`, json, thumb: t }, ...mine];
    try { localStorage.setItem(MINE, JSON.stringify(next)); setMine(next); setSaveName(""); toast.success("Saved to My templates"); }
    catch { toast.error("Browser storage is full — delete an old design first"); }
  };

  // ---------- uploads & images ----------
  const saveUploads = (list: string[]) => {
    setUploads(list);
    try { localStorage.setItem(UPLOADS, JSON.stringify(list)); } catch { toast.error("Browser storage is full — remove some old uploads"); }
  };
  const addImageUrl = async (url: string, role?: string) => {
    const img = await FabricImage.fromURL(url);
    const target = role === "signature" ? 420 : role === "logo" ? 300 : Math.min(900, W * 0.4);
    if (img.width > img.height) img.scaleToWidth(target); else img.scaleToHeight(target);
    const pos = role === "logo" ? { left: W / 2, top: 230 } : role === "signature" ? { left: W / 2, top: H - 420 } : { left: W / 2, top: H / 2 };
    img.set({ ...pos, originX: "center", originY: "center", strokeWidth: 0 });
    addObj(img, role ?? "image");
  };
  const uploadFiles = async (files: File[], addToCanvas: boolean) => {
    const urls = await Promise.all(files.map(async (f) => shrink(await readFile(f))));
    saveUploads([...urls, ...uploads].slice(0, 40));
    if (addToCanvas || files.length === 1) for (const u of urls) await addImageUrl(u);
    toast.success(files.length > 1 ? `${files.length} images uploaded` : "Image added");
  };
  const urlToBackground = async (url: string) => {
    const img = await FabricImage.fromURL(url);
    const s = Math.max(W / img.width, H / img.height);
    img.set({ scaleX: s, scaleY: s, originX: "center", originY: "center", left: W / 2, top: H / 2, selectable: false, evented: false, objectCaching: false });
    const c = fc(); c.backgroundImage = img; c.requestRenderAll(); snapshot();
  };
  const imgToBackground = async () => { if (!(sel instanceof FabricImage)) return; const src = sel.getSrc(); fc().remove(sel); fc().discardActiveObject(); await urlToBackground(src); };
  const setRadius = (pct: number) => {
    if (!sel || !isImage(sel)) return;
    const w = sel.width, h = sel.height; const r = (Math.min(w, h) * pct) / 100;
    (sel as unknown as { clipPath: unknown }).clipPath = pct ? new Rect({ width: w, height: h, rx: r, ry: r, originX: "center", originY: "center", left: 0, top: 0 }) : undefined;
    sel.data = { ...sel.data, radius: pct }; sel.dirty = true; fc().requestRenderAll(); rerender(); snapshot();
  };
  const setCrop = (key: "cropH" | "cropV", pct: number) => {
    if (!sel || !isImage(sel)) return;
    const el = (sel as unknown as FabricImage).getElement() as HTMLImageElement;
    const ow = Number(sel.data?.["ow"] ?? (el.naturalWidth || sel.width)), oh = Number(sel.data?.["oh"] ?? (el.naturalHeight || sel.height));
    const d = { ...sel.data, ow, oh, [key]: pct };
    const ch = Number(d["cropH"] ?? 0) / 100, cv = Number(d["cropV"] ?? 0) / 100;
    sel.set({ cropX: ow * ch, width: ow * (1 - 2 * ch), cropY: oh * cv, height: oh * (1 - 2 * cv) });
    sel.data = d; if (sel.data["radius"]) { const p = Number(sel.data["radius"]); sel.data = d; setRadius(p); }
    sel.setCoords(); sel.dirty = true; fc().requestRenderAll(); rerender(); snapshot();
  };

  // ---------- arrange ----------
  const isLocked = (o: Obj) => !!o.data?.["locked"];
  const toggleLock = (o: Obj) => {
    const l = !isLocked(o);
    o.set({ lockMovementX: l, lockMovementY: l, lockScalingX: l, lockScalingY: l, lockRotation: l, hasControls: !l, editable: !l } as never);
    o.data = { ...o.data, locked: l }; fc().requestRenderAll(); rerender(); snapshot();
  };
  const alignTo = (k: "left" | "hcenter" | "right" | "top" | "vcenter" | "bottom") => {
    if (!sel) return; const b = sel.getBoundingRect(); let dx = 0, dy = 0;
    if (k === "left") dx = 120 - b.left; if (k === "right") dx = W - 120 - (b.left + b.width); if (k === "hcenter") dx = W / 2 - (b.left + b.width / 2);
    if (k === "top") dy = 120 - b.top; if (k === "bottom") dy = H - 120 - (b.top + b.height); if (k === "vcenter") dy = H / 2 - (b.top + b.height / 2);
    sel.set({ left: sel.left + dx, top: sel.top + dy }); sel.setCoords(); fc().requestRenderAll(); rerender(); snapshot();
  };
  const groupSel = () => {
    const c = fc(); const a = c.getActiveObject(); if (!(a instanceof ActiveSelection)) return;
    const objs = a.getObjects(); c.discardActiveObject(); c.remove(...objs);
    const g = new Group(objs); c.add(g); c.setActiveObject(g); c.requestRenderAll(); snapshot();
  };
  const ungroupSel = () => {
    const c = fc(); const g = c.getActiveObject(); if (!(g instanceof Group) || g instanceof ActiveSelection) return;
    const objs = g.removeAll(); c.remove(g); c.add(...objs);
    c.setActiveObject(new ActiveSelection(objs, { canvas: c })); c.requestRenderAll(); snapshot();
  };
  const labelOf = (o: Obj) => {
    const r = o.data?.["role"] as string | undefined;
    if (o instanceof Textbox) return `${r ? r + ": " : "Text: "}${o.text.slice(0, 28)}`;
    if (o instanceof FabricImage) return r === "seal" ? "Seal" : r === "qr" ? "QR code" : r === "signature" ? "Signature image" : r === "logo" ? "Logo" : "Image";
    if (o instanceof Group) return "Group";
    return (o.type || "shape").replace(/^\w/, (x) => x.toUpperCase());
  };
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(fc().toObject(["data"]))], { type: "application/json" });
    download(URL.createObjectURL(blob), `${slug(currentName())}.certificate.json`);
  };

  const isText = sel instanceof Textbox;
  const isImg = !!sel && isImage(sel) && sel.data?.["role"] !== "seal";
  const groups = Array.from(new Set(TEMPLATE_LIST.map((t) => t.group)));
  const catGroups = Array.from(new Set(CATEGORIES.map((c) => c.group)));
  const ts = sel as unknown as Textbox;

  return (
    <div className="flex h-screen flex-col bg-background text-foreground" style={{ fontFamily: "Manrope, sans-serif" }}>
      <header className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
        <div className="mr-4">
          <p className="text-[10px] uppercase tracking-[0.3em] text-primary">Synapse</p>
          <h1 className="text-lg font-bold leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Certificate Studio</h1>
        </div>
        <Button size="icon" variant="ghost" onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)"><Undo2 className="size-4" /></Button>
        <Button size="icon" variant="ghost" onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)"><Redo2 className="size-4" /></Button>
        <div className="mx-2 flex items-center gap-1">
          <Button size="icon" variant="ghost" onClick={() => setZoomF((z) => Math.max(0.4, z - 0.15))}><ZoomOut className="size-4" /></Button>
          <span className="w-12 text-center text-xs text-muted-foreground">{Math.round(zoomF * 100)}%</span>
          <Button size="icon" variant="ghost" onClick={() => setZoomF((z) => Math.min(3, z + 0.15))}><ZoomIn className="size-4" /></Button>
        </div>
        <Button size="icon" variant={grid ? "secondary" : "ghost"} onClick={() => setGrid((g) => !g)} title="Grid"><Grid3x3 className="size-4" /></Button>
        <div className="ml-auto flex flex-wrap gap-2">
          <Button variant="ghost" onClick={exportJson} title="Download design file"><FileJson className="size-4" /> Save file</Button>
          <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md px-3 text-sm font-medium hover:bg-accent" title="Open design file">
            <Upload className="size-4" /> Open
            <input type="file" accept="application/json,.json" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { try { await loadJSON(await f.text()); snapshot(); toast.success("Design opened"); } catch { toast.error("That file isn't a certificate design"); } } e.target.value = ""; }} />
          </label>
          <Button variant="secondary" onClick={() => exportPdf(null)} disabled={!!busy}><FileText className="size-4" /> PDF</Button>
          <Button variant="secondary" onClick={() => download(render("image/jpeg"), `${slug(currentName())}.jpg`)}><Download className="size-4" /> JPG</Button>
          <Button onClick={exportPng}><Download className="size-4" /> PNG</Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* rail */}
        <nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-border p-2 lg:w-20 lg:flex-col lg:border-b-0 lg:border-r">
          {PANELS.map((p) => (
            <button key={p.id} onClick={() => setPanel(p.id)} className={`flex min-w-16 flex-col items-center gap-1 rounded-md px-2 py-2 text-[11px] transition ${panel === p.id ? "bg-accent text-primary" : "text-muted-foreground hover:bg-accent"}`}>
              <p.icon className="size-5" />{p.label}
            </button>
          ))}
        </nav>

        {/* panel */}
        <aside className="max-h-72 shrink-0 overflow-y-auto border-b border-border p-4 lg:max-h-none lg:w-80 lg:border-b-0 lg:border-r">
          {panel === "templates" && (
            <div className="space-y-4">
              <div className="relative"><Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" /><Input className="pl-8" placeholder={`Search ${TEMPLATE_LIST.length} templates`} value={tplQuery} onChange={(e) => setTplQuery(e.target.value)} /></div>
              <div className="flex flex-wrap gap-1.5">
                {["All", ...groups].map((g) => (
                  <button key={g} onClick={() => setTplGroup(g)} className={`rounded-full border px-2.5 py-0.5 text-[11px] ${tplGroup === g ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-accent"}`}>{g}</button>
                ))}
              </div>
              {groups.filter((g) => tplGroup === "All" || tplGroup === g).map((g) => {
                const list = TEMPLATE_LIST.filter((t) => t.group === g && t.name.toLowerCase().includes(tplQuery.toLowerCase()));
                if (!list.length) return null;
                return (
                  <div key={g}>
                    <p className="mb-2 text-[11px] uppercase tracking-widest text-muted-foreground">{g}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {list.map((t) => (
                        <TemplateCard key={t.id} id={t.id} name={t.name} accent={t.accent} cat={cat} active={templateId === t.id}
                          onPick={() => { setTemplateId(t.id); setAccent(t.accent); build(t.id, t.accent, cat, true); }} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {panel === "uploads" && (
            <div className="space-y-4">
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border p-6 text-center hover:border-primary hover:bg-accent">
                <CloudUpload className="size-8 text-primary" />
                <span className="text-sm font-semibold">Upload from your computer</span>
                <span className="text-[11px] text-muted-foreground">PNG, JPG, SVG, WebP · or drag onto the certificate</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { const fs = Array.from(e.target.files ?? []); if (fs.length) uploadFiles(fs, false); e.target.value = ""; }} />
              </label>
              {uploads.length === 0 ? <p className="text-center text-xs text-muted-foreground">Your uploads will appear here. Click one to add it.</p> : (
                <div className="grid grid-cols-2 gap-2">
                  {uploads.map((u, i) => (
                    <div key={i} className="group relative overflow-hidden rounded-md border border-border bg-muted">
                      <button onClick={() => addImageUrl(u)} className="block aspect-square w-full"><img src={u} alt={`Upload ${i + 1}`} className="size-full object-contain p-1" /></button>
                      <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-background/90 p-1 opacity-0 transition group-hover:opacity-100">
                        <button onClick={() => addImageUrl(u, "logo")} className="flex-1 rounded px-1 text-[10px] hover:bg-accent">Logo</button>
                        <button onClick={() => addImageUrl(u, "signature")} className="flex-1 rounded px-1 text-[10px] hover:bg-accent">Sign</button>
                        <button onClick={() => urlToBackground(u)} className="flex-1 rounded px-1 text-[10px] hover:bg-accent">BG</button>
                      </div>
                      <button onClick={() => saveUploads(uploads.filter((_, j) => j !== i))} className="absolute right-1 top-1 rounded bg-destructive p-1 text-destructive-foreground opacity-0 group-hover:opacity-100"><Trash2 className="size-3" /></button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-[11px] leading-relaxed text-muted-foreground">Drag the corner handles to resize. Select an image to crop, round corners, flip, add a border or shadow.</p>
            </div>
          )}

          {panel === "layers" && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Top of the list is in front. Click to select.</p>
              {fcRef.current && [...fc().getObjects()].reverse().map((o, i) => {
                const ob = o as Obj; const active = fc().getActiveObjects().includes(o);
                return (
                  <div key={i} className={`flex items-center gap-1 rounded-md border px-2 py-1.5 text-xs ${active ? "border-primary bg-accent" : "border-border"}`}>
                    <button className="min-w-0 flex-1 truncate text-left" onClick={() => { if (!o.visible || isLocked(ob)) return; fc().setActiveObject(o); fc().requestRenderAll(); setSel(ob); }}>{labelOf(ob)}</button>
                    <button title="Forward" onClick={() => { fc().bringObjectForward(o); fc().requestRenderAll(); snapshot(); rerender(); }}><ArrowUp className="size-3.5" /></button>
                    <button title="Backward" onClick={() => { fc().sendObjectBackwards(o); fc().requestRenderAll(); snapshot(); rerender(); }}><ArrowDown className="size-3.5" /></button>
                    <button title="Show / hide" onClick={() => { o.set("visible", !o.visible); fc().discardActiveObject(); fc().requestRenderAll(); snapshot(); rerender(); }}>{o.visible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5 text-muted-foreground" />}</button>
                    <button title="Lock" onClick={() => toggleLock(ob)}>{isLocked(ob) ? <Lock className="size-3.5 text-primary" /> : <Unlock className="size-3.5 text-muted-foreground" />}</button>
                  </div>
                );
              })}
            </div>
          )}

          {panel === "types" && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">Changes the title, wording and seal on your certificate.</p>
              {catGroups.map((g) => (
                <div key={g}>
                  <p className="mb-1.5 text-[11px] uppercase tracking-widest text-muted-foreground">{g}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.filter((c) => c.group === g).map((c) => (
                      <button key={c.id} onClick={() => pickType(c)} className={`rounded-full border px-3 py-1 text-xs ${catId === c.id ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-accent"}`}>{c.label}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {panel === "elements" && (
            <div className="space-y-5">
              <Section title="Text styles">
                <Tile icon={Type} label="Heading" onClick={() => text("Add a heading", 90, "Playfair Display", "800")} />
                <Tile icon={Type} label="Subheading" onClick={() => text("Add a subheading", 56, "Montserrat", "600")} />
                <Tile icon={Type} label="Body text" onClick={() => text("Add some text", 42, "Manrope")} />
                <Tile icon={PenLine} label="Script" onClick={() => text("Elegant Script", 110, "Pinyon Script")} />
                <Tile icon={PenLine} label="Signature" onClick={() => text("Your Name", 80, "Great Vibes")} />
                <Tile icon={Type} label="{name} tag" onClick={() => text("{name}", 60, "Montserrat", "700")} />
              </Section>
              <Section title="Shapes">
                <Tile icon={Minus} label="Line" onClick={() => addObj(new Line([W / 2 - 300, H / 2, W / 2 + 300, H / 2], { stroke: accent, strokeWidth: 5 }))} />
                <Tile icon={Square} label="Box" onClick={() => addObj(new Rect({ left: W / 2, top: H / 2, originX: "center", originY: "center", width: 500, height: 300, fill: "", stroke: accent, strokeWidth: 6, rx: 12, ry: 12 }))} />
                <Tile icon={Square} label="Filled" onClick={() => addObj(new Rect({ left: W / 2, top: H / 2, originX: "center", originY: "center", width: 500, height: 300, fill: accent }))} />
                <Tile icon={CircleIcon} label="Circle" onClick={() => addObj(new Circle({ left: W / 2, top: H / 2, originX: "center", originY: "center", radius: 150, fill: accent }))} />
                <Tile icon={TriIcon} label="Triangle" onClick={() => addObj(new Triangle({ left: W / 2, top: H / 2, originX: "center", originY: "center", width: 300, height: 260, fill: accent }))} />
                <Tile icon={Star} label="Star" onClick={() => addObj(new Polygon(starPts(160), { left: W / 2, top: H / 2, originX: "center", originY: "center", fill: accent }))} />
                <Tile icon={ArrowRight} label="Arrow" onClick={() => addObj(new Path("M 0 40 L 300 40 L 300 0 L 400 70 L 300 140 L 300 100 L 0 100 Z", { left: W / 2, top: H / 2, originX: "center", originY: "center", fill: accent }))} />
                <Tile icon={Square} label="Frame" onClick={() => addObj(new Rect({ left: W / 2, top: H / 2, originX: "center", originY: "center", width: W - 260, height: H - 260, fill: "", stroke: accent, strokeWidth: 10 }))} />
                <Tile icon={Minus} label="Divider" onClick={() => addObj(new Line([W / 2 - 400, H / 2, W / 2 + 400, H / 2], { stroke: accent, strokeWidth: 3, strokeDashArray: [18, 12] }))} />
                <Tile icon={Ribbon} label="Ribbon" onClick={addRibbon} />
                <Tile icon={Star} label="Seal" onClick={addSeal} />
              </Section>
              <Section title="Icons">
                {["🏆", "🥇", "🥈", "🥉", "🏅", "⭐", "🎓", "🎖️", "🌿", "🎉", "💡", "🚀"].map((e) => (
                  <button key={e} onClick={() => addObj(new Textbox(e, { left: W / 2, top: H / 2, originX: "center", originY: "center", width: 260, textAlign: "center", fontSize: 200 }))} className="flex aspect-square items-center justify-center rounded-md border border-border text-3xl hover:bg-accent">{e}</button>
                ))}
              </Section>
              <Section title="Images & codes">
                <UploadTile icon={ImageIcon} label="Logo / image" onFile={(f) => uploadFiles([f], true)} />
                <UploadTile icon={PenLine} label="Signature image" onFile={(f) => addImage(f, "signature")} />
                <Tile icon={QrCode} label="QR code" onClick={addQR} />
              </Section>
              <p className="text-[11px] leading-relaxed text-muted-foreground">Tip: double-click text to type on the certificate. Delete removes, Ctrl+D duplicates, Ctrl+G groups, Shift+click selects many, arrow keys nudge.</p>
            </div>
          )}

          {panel === "background" && (
            <div className="space-y-5">
              <div>
                <Label className="mb-2 block">Template color</Label>
                <div className="flex items-center gap-2">
                  <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="size-9 cursor-pointer rounded bg-transparent" />
                  <Button size="sm" variant="secondary" onClick={() => { setBackground(fc(), templateId, accent); (fc() as unknown as { data: unknown }).data = { templateId, accent }; fc().requestRenderAll(); snapshot(); }}>Apply to background</Button>
                </div>
              </div>
              <BgPicker onSolid={(c) => setBg("solid", c)} onGradient={(a, b) => setBg("gradient", a, b)} />
              <div>
                <Label className="mb-2 block">Your own image</Label>
                <UploadTile icon={Upload} label="Upload background" onFile={bgImage} />
              </div>
              <Button variant="ghost" size="sm" onClick={() => { setBackground(fc(), templateId, accent); fc().requestRenderAll(); snapshot(); }}>Restore template background</Button>
            </div>
          )}

          {panel === "bulk" && (
            <div className="space-y-3">
              <Label>Names — one per line (or paste CSV: name, team…)</Label>
              <Textarea rows={10} value={recipients} onChange={(e) => setRecipients(e.target.value)} placeholder={"Aarav Sharma\nDiya Patel, Team Nova\nKabir Singh"} />
              <p className="text-xs text-muted-foreground">{names.length} certificates. The name, any {"{name}"} tag and the certificate ID change for each person.</p>
              <div className="grid grid-cols-2 gap-2">
                <Button disabled={!names.length || !!busy} onClick={() => exportPdf(names)}><FileText className="size-4" />{busy === "pdf" ? "Working…" : "One PDF"}</Button>
                <Button variant="secondary" disabled={!names.length || !!busy} onClick={exportZip}><Images className="size-4" />{busy === "zip" ? "Working…" : "ZIP"}</Button>
              </div>
            </div>
          )}

          {panel === "saved" && (
            <div className="space-y-4">
              <div className="flex gap-2"><Input placeholder="Design name" value={saveName} onChange={(e) => setSaveName(e.target.value)} /><Button onClick={saveMine}><Save className="size-4" /></Button></div>
              <p className="text-[11px] text-muted-foreground">Saved in this browser only.</p>
              <div className="grid grid-cols-2 gap-2">
                {mine.map((m, i) => (
                  <div key={i} className="group relative overflow-hidden rounded-md border border-border">
                    <button onClick={async () => { await loadJSON(m.json); snapshot(); }} className="block w-full text-left">
                      <img src={m.thumb} alt={m.name} className="block w-full" /><p className="truncate px-2 py-1 text-xs">{m.name}</p>
                    </button>
                    <button onClick={() => { const n = mine.filter((_, j) => j !== i); setMine(n); localStorage.setItem(MINE, JSON.stringify(n)); }} className="absolute right-1 top-1 rounded bg-destructive p-1 text-destructive-foreground opacity-0 group-hover:opacity-100"><Trash2 className="size-3" /></button>
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="sm" onClick={() => build(templateId, accent, cat, false)}>Reset to template</Button>
            </div>
          )}
        </aside>

        {/* canvas */}
        <main ref={wrapRef} className="relative min-h-0 flex-1 overflow-auto bg-muted/40 p-4"
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); const fs = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/")); if (fs.length) uploadFiles(fs, true); }}>
          <div className="relative mx-auto w-fit shadow-2xl ring-1 ring-border">
            <canvas ref={elRef} />
            {grid && <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "linear-gradient(to right, color-mix(in oklab, var(--primary) 30%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--primary) 30%, transparent) 1px, transparent 1px)", backgroundSize: `${100 * zoom}px ${100 * zoom}px` }} />}
          </div>
          {dragging && <div className="pointer-events-none absolute inset-4 flex items-center justify-center rounded-xl border-4 border-dashed border-primary bg-background/70 text-lg font-semibold">Drop images to add them</div>}
          <p className="mt-3 text-center text-xs text-muted-foreground">A4 landscape · 2480 × 1754 px · drag images here from your computer · Shift+click to select many</p>
        </main>

        {/* properties */}
        <aside className="max-h-80 shrink-0 overflow-y-auto border-t border-border p-4 lg:max-h-none lg:w-72 lg:border-l lg:border-t-0">
          {!sel ? (
            <p className="text-sm text-muted-foreground">Select something on the certificate to edit its style.</p>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" title="Bring forward" onClick={() => layer("up")}><ArrowUp className="size-4" /></Button>
                <Button size="icon" variant="ghost" title="Send backward" onClick={() => layer("down")}><ArrowDown className="size-4" /></Button>
                <Button size="icon" variant="ghost" title="Duplicate" onClick={() => duplicate(sel)}><Copy className="size-4" /></Button>
                <Button size="icon" variant="ghost" title="Delete" onClick={removeSel}><Trash2 className="size-4" /></Button>
              </div>
              {isText && (
                <>
                  <div><Label className="mb-1.5 block">Text</Label><Textarea rows={2} value={ts.text} onChange={(e) => update({ text: e.target.value })} /></div>
                  <div>
                    <Label className="mb-1.5 block">Font</Label>
                    <select value={ts.fontFamily} onChange={(e) => update({ fontFamily: e.target.value })} className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
                      {FONTS.map((f) => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
                    </select>
                  </div>
                  <Prop label={`Size ${Math.round(ts.fontSize)}`}><Slider min={12} max={300} value={[ts.fontSize]} onValueChange={([v]) => update({ fontSize: v })} /></Prop>
                  <Prop label={`Letter spacing ${ts.charSpacing}`}><Slider min={-50} max={800} step={10} value={[ts.charSpacing]} onValueChange={([v]) => update({ charSpacing: v })} /></Prop>
                  <div className="flex flex-wrap gap-1">
                    <Toggle on={String(ts.fontWeight) >= "600" || ts.fontWeight === "bold"} onClick={() => update({ fontWeight: Number(ts.fontWeight) >= 600 || ts.fontWeight === "bold" ? "400" : "700" })}><Bold className="size-4" /></Toggle>
                    <Toggle on={ts.fontStyle === "italic"} onClick={() => update({ fontStyle: ts.fontStyle === "italic" ? "normal" : "italic" })}><Italic className="size-4" /></Toggle>
                    <Toggle on={ts.textAlign === "left"} onClick={() => update({ textAlign: "left" })}><AlignLeft className="size-4" /></Toggle>
                    <Toggle on={ts.textAlign === "center"} onClick={() => update({ textAlign: "center" })}><AlignCenter className="size-4" /></Toggle>
                    <Toggle on={ts.textAlign === "right"} onClick={() => update({ textAlign: "right" })}><AlignRight className="size-4" /></Toggle>
                    <Toggle on={ts.text === ts.text.toUpperCase()} onClick={() => update({ text: ts.text === ts.text.toUpperCase() ? ts.text.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : ts.text.toUpperCase() })}><span className="text-xs font-bold">Aa</span></Toggle>
                  </div>
                  <ColorProp label="Color" value={String(ts.fill)} onChange={(v) => update({ fill: v })} />
                </>
              )}
              {sel.data?.["role"] === "seal" && (
                <>
                  <div><Label className="mb-1.5 block">Seal text</Label><Input value={String(sel.data["label"] ?? "")} onChange={(e) => updateSeal({ label: e.target.value })} /></div>
                  <ColorProp label="Seal color" value={String(sel.data["color"])} onChange={(v) => updateSeal({ color: v })} />
                </>
              )}
              {isText && (
                <div className="space-y-3 rounded-md border border-border p-3">
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Text effects</p>
                  <div className="flex flex-wrap gap-1">
                    <Button size="sm" variant="secondary" onClick={() => update({ shadow: null, stroke: null, strokeWidth: 0 })}>None</Button>
                    <Button size="sm" variant="secondary" onClick={() => update({ shadow: new Shadow({ color: "rgba(0,0,0,0.35)", blur: 18, offsetX: 6, offsetY: 6 }) })}>Shadow</Button>
                    <Button size="sm" variant="secondary" onClick={() => update({ shadow: new Shadow({ color: String(ts.fill), blur: 40 }) })}>Glow</Button>
                    <Button size="sm" variant="secondary" onClick={() => update({ stroke: accent, strokeWidth: 3, paintFirst: "stroke" })}>Outline</Button>
                    <Button size="sm" variant="secondary" onClick={() => update({ fill: new Gradient({ type: "linear", gradientUnits: "percentage", coords: { x1: 0, y1: 0, x2: 1, y2: 0 }, colorStops: [{ offset: 0, color: accent }, { offset: 1, color: "#ec4899" }] }) })}>Gradient</Button>
                  </div>
                  <Prop label={`Line height ${ts.lineHeight.toFixed(2)}`}><Slider min={0.7} max={2.5} step={0.05} value={[ts.lineHeight]} onValueChange={([v]) => update({ lineHeight: v })} /></Prop>
                  {!!ts.stroke && <ColorProp label="Outline color" value={String(ts.stroke)} onChange={(v) => update({ stroke: v })} />}
                </div>
              )}
              {isImg && (
                <div className="space-y-3 rounded-md border border-border p-3">
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Image</p>
                  <div className="flex flex-wrap gap-1">
                    <Button size="sm" variant="secondary" onClick={() => update({ flipX: !sel.flipX })}><FlipHorizontal2 className="size-4" /> Flip</Button>
                    <Button size="sm" variant="secondary" onClick={() => update({ flipY: !sel.flipY })}><FlipVertical2 className="size-4" /> Flip</Button>
                    <Button size="sm" variant="secondary" onClick={imgToBackground}>Use as background</Button>
                  </div>
                  <Prop label={`Rounded corners ${Number(sel.data?.["radius"] ?? 0)}`}><Slider min={0} max={50} value={[Number(sel.data?.["radius"] ?? 0)]} onValueChange={([v]) => setRadius(v!)} /></Prop>
                  <Prop label={`Crop left/right ${Number(sel.data?.["cropH"] ?? 0)}%`}><Slider min={0} max={45} value={[Number(sel.data?.["cropH"] ?? 0)]} onValueChange={([v]) => setCrop("cropH", v!)} /></Prop>
                  <Prop label={`Crop top/bottom ${Number(sel.data?.["cropV"] ?? 0)}%`}><Slider min={0} max={45} value={[Number(sel.data?.["cropV"] ?? 0)]} onValueChange={([v]) => setCrop("cropV", v!)} /></Prop>
                  <Prop label={`Border ${sel.strokeWidth}`}><Slider min={0} max={40} value={[sel.strokeWidth]} onValueChange={([v]) => update({ strokeWidth: v, stroke: sel.stroke || accent })} /></Prop>
                  {sel.strokeWidth > 0 && <ColorProp label="Border color" value={String(sel.stroke || accent)} onChange={(v) => update({ stroke: v })} />}
                </div>
              )}
              {!isText && (sel instanceof Rect || sel instanceof Circle || sel instanceof Polygon || sel instanceof Triangle || sel instanceof Path) && (
                <ColorProp label="Fill" value={typeof sel.fill === "string" && sel.fill ? sel.fill : "#ffffff"} onChange={(v) => update({ fill: v })} />
              )}
              {!isText && (sel instanceof Rect || sel instanceof Circle || sel instanceof Line || sel instanceof Polygon || sel instanceof Triangle || sel instanceof Path) && (
                <>
                  <ColorProp label="Border / line color" value={String(sel.stroke || "#000000")} onChange={(v) => update({ stroke: v })} />
                  <Prop label={`Border width ${sel.strokeWidth}`}><Slider min={0} max={40} value={[sel.strokeWidth]} onValueChange={([v]) => update({ strokeWidth: v })} /></Prop>
                </>
              )}
              {!isText && (
                <div className="flex flex-wrap gap-1">
                  <Button size="sm" variant="secondary" onClick={() => update({ shadow: sel.shadow ? null : new Shadow({ color: "rgba(0,0,0,0.35)", blur: 30, offsetX: 8, offsetY: 10 }) })}>{sel.shadow ? "Remove shadow" : "Add shadow"}</Button>
                </div>
              )}
              <Prop label={`Opacity ${Math.round((sel.opacity ?? 1) * 100)}%`}><Slider min={0} max={1} step={0.05} value={[sel.opacity ?? 1]} onValueChange={([v]) => update({ opacity: v })} /></Prop>
              <Prop label={`Rotate ${Math.round(sel.angle)}°`}><Slider min={-180} max={180} value={[sel.angle]} onValueChange={([v]) => update({ angle: v })} /></Prop>
              <div>
                <Label className="mb-1.5 block">Position on page</Label>
                <div className="grid grid-cols-3 gap-1">
                  {(["left", "hcenter", "right", "top", "vcenter", "bottom"] as const).map((k) => (
                    <Button key={k} size="sm" variant="outline" onClick={() => alignTo(k)} className="text-[11px]">{{ left: "Left", hcenter: "Center", right: "Right", top: "Top", vcenter: "Middle", bottom: "Bottom" }[k]}</Button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                <Button size="sm" variant="outline" onClick={() => toggleLock(sel)}>{isLocked(sel) ? <><Unlock className="size-4" /> Unlock</> : <><Lock className="size-4" /> Lock</>}</Button>
                {sel instanceof ActiveSelection && <Button size="sm" variant="outline" onClick={groupSel}><GroupIcon className="size-4" /> Group</Button>}
                {sel instanceof Group && !(sel instanceof ActiveSelection) && <Button size="sm" variant="outline" onClick={ungroupSel}><Ungroup className="size-4" /> Ungroup</Button>}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><p className="mb-2 text-[11px] uppercase tracking-widest text-muted-foreground">{title}</p><div className="grid grid-cols-3 gap-2">{children}</div></div>;
}
function Tile({ icon: I, label, onClick }: { icon: React.ComponentType<{ className?: string }>; label: string; onClick: () => void }) {
  return <button onClick={onClick} className="flex flex-col items-center gap-1 rounded-md border border-border p-2 text-[11px] hover:bg-accent"><I className="size-5 text-primary" />{label}</button>;
}
function UploadTile({ icon: I, label, onFile }: { icon: React.ComponentType<{ className?: string }>; label: string; onFile: (f: File) => void }) {
  return (
    <label className="flex cursor-pointer flex-col items-center gap-1 rounded-md border border-dashed border-border p-2 text-center text-[11px] hover:bg-accent">
      <I className="size-5 text-primary" />{label}
      <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
    </label>
  );
}
function Prop({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><Label className="mb-2 block text-xs">{label}</Label>{children}</div>;
}
function Toggle({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className={`flex size-9 items-center justify-center rounded-md border ${on ? "border-primary bg-accent text-primary" : "border-border"}`}>{children}</button>;
}
function ColorProp({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const hex = /^#[0-9a-f]{6}$/i.test(value) ? value : "#000000";
  return (
    <div><Label className="mb-1.5 block text-xs">{label}</Label>
      <div className="flex items-center gap-2"><input type="color" value={hex} onChange={(e) => onChange(e.target.value)} className="size-9 cursor-pointer rounded bg-transparent" /><Input value={value} onChange={(e) => onChange(e.target.value)} className="h-9" /></div>
    </div>
  );
}
function BgPicker({ onSolid, onGradient }: { onSolid: (c: string) => void; onGradient: (a: string, b: string) => void }) {
  const [a, setA] = useState("#fdf6e3"); const [b, setB] = useState("#f0c987");
  const solids = ["#ffffff", "#fbf7ee", "#f4f2ee", "#0f172a", "#0d0d0f", "#06140f", "#fff1f2", "#eef2ff"];
  const grads: [string, string][] = [["#fdf6e3", "#f0c987"], ["#e0e7ff", "#fbcfe8"], ["#0f172a", "#312e81"], ["#ecfeff", "#a7f3d0"], ["#fff7ed", "#fecdd3"], ["#111827", "#78350f"]];
  return (
    <div className="space-y-4">
      <div><Label className="mb-2 block">Solid</Label><div className="flex flex-wrap gap-2">{solids.map((s) => <button key={s} onClick={() => onSolid(s)} className="size-8 rounded border border-border" style={{ background: s }} />)}</div></div>
      <div><Label className="mb-2 block">Gradient</Label>
        <div className="flex flex-wrap gap-2">{grads.map(([x, y]) => <button key={x + y} onClick={() => onGradient(x, y)} className="size-8 rounded border border-border" style={{ background: `linear-gradient(135deg, ${x}, ${y})` }} />)}</div>
        <div className="mt-2 flex items-center gap-2"><input type="color" value={a} onChange={(e) => setA(e.target.value)} className="size-8" /><input type="color" value={b} onChange={(e) => setB(e.target.value)} className="size-8" /><Button size="sm" variant="secondary" onClick={() => onGradient(a, b)}>Apply</Button></div>
      </div>
    </div>
  );
}
