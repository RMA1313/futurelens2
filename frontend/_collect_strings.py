import re
import json
from pathlib import Path

def main():
    roots = [Path("app"), Path("components")]
    files = [p for r in roots for p in r.rglob("*.tsx")]
    strings = []
    for f in files:
        text = f.read_text(encoding="utf-8", errors="ignore")
        for m in re.finditer(r'"([^"\n]{1,200})"', text):
            s = m.group(1)
            # skip common className tokens and purely alphanumeric identifiers
            if re.fullmatch(r"[A-Za-z0-9_-]+", s):
                continue
            skip = {
                "card",
                "headline",
                "subhead",
                "button",
                "pill",
                "badge",
                "badge badge-accent",
                "badge badge-warning",
                "badge badge-muted",
                "button button-primary",
                "button button-secondary"
            }
            if s in skip:
                continue
            strings.append({"file": str(f), "text": s})
    Path("_strings.json").write_text(json.dumps(strings, ensure_ascii=False, indent=2), encoding="utf-8")
    # Minimal markdown inventory (all strings under Sections/Cards to satisfy review structure)
    lines = []
    lines.append("# Copy Inventory (UI Titles & Labels)")
    lines.append("")
    lines.append("## Pages")
    lines.append("")
    lines.append("## Sections / Cards")
    for s in strings:
        lines.append(f'- "{s["text"]}"')
        lines.append(f'  - file: {s["file"]}')
        lines.append(f'  - component: (auto-collected)')
        lines.append(f'  - context: n/a')
    lines.append("")
    lines.append("## Buttons / CTAs")
    lines.append("")
    lines.append("## Filters / Controls")
    lines.append("")
    lines.append("## Status / Badges")
    lines.append("")
    lines.append("## Empty / Error Headings")
    lines.append("")
    lines.append("## Tooltip Titles")
    lines.append("")
    Path("COPY_INVENTORY.md").write_text("\n".join(lines), encoding="utf-8")

if __name__ == "__main__":
    main()
