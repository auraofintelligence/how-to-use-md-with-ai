(function () {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector("#nav-links");
  const toTop = document.querySelector("[data-to-top]");

  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const isOpen = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    links.addEventListener("click", (event) => {
      if (!event.target.closest("a")) return;
      links.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  }

  if (toTop) {
    window.addEventListener("scroll", () => {
      toTop.classList.toggle("is-visible", window.scrollY > 700);
    });
    toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  const form = document.querySelector("[data-ai-md-form]");
  const output = document.querySelector("[data-md-output]");
  if (!form || !output) return;

  const storageKey = "how-to-use-md-with-ai:builder";
  const status = document.querySelector("[data-builder-status]");
  const copyButton = document.querySelector("[data-copy-md]");
  const downloadButton = document.querySelector("[data-download-md]");
  const clearButton = document.querySelector("[data-clear-md]");

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function setStatus(message) {
    if (!status) return;
    status.textContent = message;
    window.clearTimeout(setStatus.timer);
    setStatus.timer = window.setTimeout(() => {
      status.textContent = "Ready.";
    }, 2800);
  }

  function clean(value) {
    return String(value || "").trim();
  }

  function slugify(value) {
    return clean(value)
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "ai-context-starter";
  }

  function yaml(value) {
    const text = clean(value);
    if (!text) return '""';
    if (/^[A-Za-z0-9_.:-]+$/.test(text)) return text;
    return JSON.stringify(text);
  }

  function lines(value) {
    return clean(value)
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  function list(value, fallback) {
    const items = Array.isArray(value) ? value : lines(value);
    if (!items.length) return fallback || "- Left open.";
    return items.map((item) => `- ${item}`).join("\n");
  }

  function paragraph(value, fallback) {
    return clean(value) || fallback || "Left open.";
  }

  function readForm() {
    return Object.fromEntries(new FormData(form).entries());
  }

  function filenameFor(data) {
    const explicit = clean(data.filename);
    if (explicit) return explicit.endsWith(".md") ? explicit : `${explicit}.md`;
    return `${slugify(data.title)}.md`;
  }

  function buildMarkdown(data) {
    const title = paragraph(data.title, "AI Context Starter");
    const filename = filenameFor(data);
    const created = today();

    return [
      "---",
      "schema: ai_context_starter.v0",
      `title: ${yaml(title)}`,
      `file_name: ${yaml(filename)}`,
      `audience: ${yaml(data.audience)}`,
      `visibility: ${yaml(data.visibility || "private")}`,
      `review_status: ${yaml(data.review_status || "needs_human_review")}`,
      `civic_lane: ${yaml(data.lane || "private_profile")}`,
      `scale_layer: ${yaml(data.scale_layer || "L0_private")}`,
      `created: ${yaml(created)}`,
      `updated: ${yaml(created)}`,
      "source_site: how-to-use-md-with-ai",
      "---",
      "",
      `# ${title}`,
      "",
      "## Purpose",
      paragraph(data.purpose),
      "",
      "## Audience Or User",
      paragraph(data.audience),
      "",
      "## Context Notes",
      paragraph(data.context),
      "",
      "## Request For AI",
      paragraph(data.ai_request, "Ask the AI for one specific next action."),
      "",
      "## Privacy And Consent Boundary",
      `**Visibility lane:** ${data.visibility || "private"}`,
      "",
      paragraph(data.private_boundary, "No private boundary recorded yet. Review before sharing."),
      "",
      "## Consent Or Correction Path",
      paragraph(data.consent_path, "No consent or correction path recorded yet."),
      "",
      "## Source Links Or File Names",
      list(data.sources),
      "",
      "## Output Format Wanted",
      paragraph(data.output_format),
      "",
      "## Public Receipts Or Accountability Notes",
      paragraph(data.receipts, "No public receipt trail recorded yet."),
      "",
      "## Civic Scale Notes",
      `**Scale layer:** ${data.scale_layer || "L0_private"}`,
      "",
      "Use this as a routing clue. L0 material stays private by default. L1 material may be shared with a group or project. L2 and wider material needs stronger source trails, review and public correction paths.",
      "",
      "## Review Notes And Open Questions",
      list(data.review_notes),
      "",
      "## Agent Use Notes",
      "- Treat this file as context, not proof.",
      "- Ask before publishing private, trusted-only or uncertain material.",
      "- Check current facts, dates, sources and claims before relying on output.",
      "- Preserve human review and correction notes.",
      ""
    ].join("\n");
  }

  function save() {
    const data = readForm();
    localStorage.setItem(storageKey, JSON.stringify(data));
    output.value = buildMarkdown(data);
  }

  function hydrate() {
    let data = {};
    try {
      data = JSON.parse(localStorage.getItem(storageKey) || "{}");
    } catch (error) {
      data = {};
    }

    Object.entries(data).forEach(([name, value]) => {
      const field = form.elements[name];
      if (field) field.value = value;
    });

    output.value = buildMarkdown(readForm());
  }

  function downloadText(filename, text) {
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  form.addEventListener("input", save);
  form.addEventListener("change", save);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    save();
    setStatus("Markdown updated.");
  });

  copyButton.addEventListener("click", async () => {
    save();
    try {
      await navigator.clipboard.writeText(output.value);
    } catch (error) {
      output.removeAttribute("readonly");
      output.select();
      document.execCommand("copy");
      output.setAttribute("readonly", "readonly");
    }
    setStatus("Markdown copied.");
  });

  downloadButton.addEventListener("click", () => {
    const data = readForm();
    save();
    downloadText(filenameFor(data), output.value);
    setStatus(`${filenameFor(data)} is ready.`);
  });

  clearButton.addEventListener("click", () => {
    localStorage.removeItem(storageKey);
    form.reset();
    output.value = buildMarkdown(readForm());
    setStatus("Answers cleared.");
  });

  hydrate();
})();
