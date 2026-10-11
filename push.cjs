const GATEWAY = "https://connector-gateway.lovable.dev/github";
const HEADERS = {
  Accept: "application/vnd.github+json",
  "Content-Type": "application/json",
  Authorization: `Bearer ${process.env.LOVABLE_API_KEY}`,
  "X-Connection-Api-Key": process.env.GITHUB_API_KEY,
};
const REPO = "Cxen77/SYNAPSE";
const BRANCH = "certificate-studio";

async function api(method, path, body) {
  const res = await fetch(`${GATEWAY}${path}`, {
    method,
    headers: HEADERS,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`GitHub ${method} ${path} -> ${res.status}: ${text.slice(0, 500)}`);
  return text ? JSON.parse(text) : null;
}

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

const fs = require("fs");
const root = "/tmp/studio-push";
const files = walk(root).filter((f) => !f.endsWith("tsconfig.tsbuildinfo"));

(async () => {
  const repo = await api("GET", `/repos/${REPO}`);
  const def = repo.default_branch;
  console.log("default branch:", def);

  let baseCommit;
  try {
    const ref = await api("GET", `/repos/${REPO}/git/ref/heads/${BRANCH}`);
    baseCommit = ref.object.sha;
    console.log("branch exists, updating at", baseCommit);
  } catch {
    const ref = await api("GET", `/repos/${REPO}/git/ref/heads/${def}`);
    baseCommit = ref.object.sha;
    console.log("new branch from", def, "at", baseCommit);
  }
  const commit = await api("GET", `/repos/${REPO}/git/commits/${baseCommit}`);
  const baseTree = commit.tree.sha;

  const tree = [];
  for (const abs of files) {
    const path = abs.slice(root.length + 1);
    const buf = fs.readFileSync(abs);
    if (buf.some((b) => b === 0)) {
      const blob = await api("POST", `/repos/${REPO}/git/blobs`, {
        content: buf.toString("base64"),
        encoding: "base64",
      });
      tree.push({ path, mode: "100644", type: "blob", sha: blob.sha });
    } else {
      tree.push({ path, mode: "100644", type: "blob", content: buf.toString("utf8") });
    }
  }
  console.log("tree entries:", tree.length);

  const newTree = await api("POST", `/repos/${REPO}/git/trees`, { base_tree: baseTree, tree });
  const newCommit = await api("POST", `/repos/${REPO}/git/commits`, {
    message: "Certificate Studio: Canva-style certificate editor (TanStack Start + Fabric.js)",
    tree: newTree.sha,
    parents: [baseCommit],
  });
  try {
    await api("POST", `/repos/${REPO}/git/refs`, {
      ref: `refs/heads/${BRANCH}`,
      sha: newCommit.sha,
    });
  } catch {
    // branch existed — fast-forward it
    await api("PATCH", `/repos/${REPO}/git/refs/heads/${BRANCH}`, { sha: newCommit.sha, force: true });
  }
  console.log("pushed commit", newCommit.sha);
  console.log(`https://github.com/${REPO}/tree/${BRANCH}`);
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
