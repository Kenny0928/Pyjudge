#!/usr/bin/env python3
"""整理 Selenium 封存的 Google Sites 題庫並稽核 SkillLab 匯入紀錄。"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent.parent
DEFAULT_SOURCE_DIR = ROOT.parent.parent / "selenium" / "output" / "normalized"
DEFAULT_REGISTRY = ROOT / "for_AI" / "google-sites題庫匯入" / "imports.json"
DEFAULT_CATALOG = ROOT / "for_AI" / "google-sites題庫匯入" / "catalog.json"
HASH_FIELDS = (
    "source_id",
    "title",
    "source_url",
    "categories",
    "statement_text",
    "candidate_test_cases",
    "raw_test_cases",
    "raw_source_data",
    "source_judge_semantics",
)


class CatalogError(RuntimeError):
    """代表來源資料或匯入紀錄不符合契約。"""


def read_json(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise CatalogError(f"找不到檔案：{path}") from exc
    except json.JSONDecodeError as exc:
        raise CatalogError(f"JSON 格式錯誤：{path}: {exc}") from exc


def canonical_source_hash(record: dict[str, Any]) -> str:
    """只雜湊影響審題的欄位，避免抓取時間改變造成假警報。"""
    payload = {field: record.get(field) for field in HASH_FIELDS}
    encoded = json.dumps(
        payload, ensure_ascii=False, sort_keys=True, separators=(",", ":")
    ).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def source_sort_key(source_id: str) -> tuple[int, str]:
    match = re.match(r"p(\d+)", source_id)
    return (int(match.group(1)) if match else sys.maxsize, source_id)


def load_sources(source_dir: Path) -> dict[str, dict[str, Any]]:
    if not source_dir.is_dir():
        raise CatalogError(f"找不到 normalized 題庫目錄：{source_dir}")

    sources: dict[str, dict[str, Any]] = {}
    for path in sorted(source_dir.glob("*.json")):
        record = read_json(path)
        if not isinstance(record, dict) or record.get("source") != "google_sites":
            continue
        source_id = record.get("source_id")
        if not isinstance(source_id, str) or not source_id:
            raise CatalogError(f"Google Sites 題目缺少 source_id：{path}")
        if source_id in sources:
            raise CatalogError(f"來源題號重複：{source_id}")
        record["_normalized_path"] = str(path.resolve())
        sources[source_id] = record

    if not sources:
        raise CatalogError(f"目錄內沒有 Google Sites 題目：{source_dir}")
    return sources


def load_registry(path: Path) -> dict[str, dict[str, Any]]:
    data = read_json(path)
    if not isinstance(data, dict) or data.get("schemaVersion") != 1:
        raise CatalogError("imports.json 的 schemaVersion 必須是 1")
    imports = data.get("imports")
    if not isinstance(imports, list):
        raise CatalogError("imports.json 的 imports 必須是陣列")

    by_source: dict[str, dict[str, Any]] = {}
    by_problem: dict[int, str] = {}
    for item in imports:
        if not isinstance(item, dict):
            raise CatalogError("imports.json 的每筆紀錄必須是物件")
        source_id = item.get("sourceId")
        problem_id = item.get("pyjudgeId")
        source_hash = item.get("sourceContentHash")
        if not isinstance(source_id, str) or not source_id:
            raise CatalogError("匯入紀錄缺少 sourceId")
        if not isinstance(problem_id, int):
            raise CatalogError(f"{source_id} 的 pyjudgeId 必須是整數")
        if not isinstance(source_hash, str) or not re.fullmatch(r"[0-9a-f]{64}", source_hash):
            raise CatalogError(f"{source_id} 的 sourceContentHash 必須是 SHA-256")
        if source_id in by_source:
            raise CatalogError(f"匯入來源重複：{source_id}")
        if problem_id in by_problem:
            raise CatalogError(
                f"Pyjudge ID {problem_id} 同時對應 {by_problem[problem_id]} 與 {source_id}"
            )
        by_source[source_id] = item
        by_problem[problem_id] = source_id
    return by_source


def verify_imported_problem(source_id: str, item: dict[str, Any]) -> None:
    problem_id = item["pyjudgeId"]
    path = ROOT / "problems" / f"{problem_id:03d}.json"
    problem = read_json(path)
    source = problem.get("source") if isinstance(problem, dict) else None
    if not isinstance(source, dict):
        raise CatalogError(f"{path} 缺少 source 追溯資料")
    if source.get("site") != "google_sites" or source.get("sourceId") != source_id:
        raise CatalogError(f"{path} 的 Google Sites sourceId 不符合 imports.json")


def build_catalog(
    sources: dict[str, dict[str, Any]], registry: dict[str, dict[str, Any]]
) -> dict[str, Any]:
    entries: list[dict[str, Any]] = []
    counts = {"imported": 0, "source_changed": 0, "unreviewed": 0}

    for source_id in sorted(sources, key=source_sort_key):
        record = sources[source_id]
        current_hash = canonical_source_hash(record)
        imported = registry.get(source_id)
        if imported is None:
            status = "unreviewed"
            pyjudge_id = None
        elif imported["sourceContentHash"] == current_hash:
            status = "imported"
            pyjudge_id = imported["pyjudgeId"]
            verify_imported_problem(source_id, imported)
        else:
            status = "source_changed"
            pyjudge_id = imported["pyjudgeId"]
            verify_imported_problem(source_id, imported)
        counts[status] += 1

        entries.append(
            {
                "sourceId": source_id,
                "title": record.get("title", ""),
                "categories": record.get("categories", []),
                "tags": record.get("raw_source_data", {}).get("tags", []),
                "candidateCaseCount": len(record.get("candidate_test_cases", [])),
                "sourceContentHash": current_hash,
                "status": status,
                "pyjudgeId": pyjudge_id,
            }
        )

    missing = sorted(set(registry) - set(sources), key=source_sort_key)
    if missing:
        raise CatalogError("下列已匯入來源不在最新封存中：" + ", ".join(missing))

    fetched_times = [
        record.get("fetched_at")
        for record in sources.values()
        if isinstance(record.get("fetched_at"), str)
    ]
    return {
        "schemaVersion": 1,
        "source": "google_sites",
        "sourceSnapshotFetchedAt": max(fetched_times, default=None),
        "problemCount": len(entries),
        "statusCounts": counts,
        "problems": entries,
    }


def render_json(data: Any) -> str:
    return json.dumps(data, ensure_ascii=False, indent=2) + "\n"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="產生或檢查 Google Sites 題庫目錄與 Pyjudge 匯入追蹤狀態。"
    )
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--write", action="store_true", help="重新產生 catalog.json")
    mode.add_argument("--check", action="store_true", help="確認 catalog.json 最新且匯入追溯一致")
    parser.add_argument("--source-dir", type=Path, default=DEFAULT_SOURCE_DIR)
    parser.add_argument("--registry", type=Path, default=DEFAULT_REGISTRY)
    parser.add_argument("--catalog", type=Path, default=DEFAULT_CATALOG)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        sources = load_sources(args.source_dir.resolve())
        registry = load_registry(args.registry.resolve())
        catalog = build_catalog(sources, registry)
        expected = render_json(catalog)

        if args.write:
            args.catalog.parent.mkdir(parents=True, exist_ok=True)
            args.catalog.write_text(expected, encoding="utf-8")
            print(
                f"已整理 {catalog['problemCount']} 題："
                f"已匯入 {catalog['statusCounts']['imported']}、"
                f"來源變更 {catalog['statusCounts']['source_changed']}、"
                f"待審 {catalog['statusCounts']['unreviewed']}。"
            )
            return 0

        actual = args.catalog.read_text(encoding="utf-8")
        if actual != expected:
            print("catalog.json 已過期；請先執行 --write 並審閱差異。", file=sys.stderr)
            return 1
        if catalog["statusCounts"]["source_changed"]:
            print("有已匯入題目的來源內容改變，必須重新審題。", file=sys.stderr)
            return 1
        print(
            f"Google Sites 題庫追蹤正常：共 {catalog['problemCount']} 題，"
            f"已匯入 {catalog['statusCounts']['imported']} 題。"
        )
        return 0
    except (CatalogError, OSError) as exc:
        print(f"錯誤：{exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
