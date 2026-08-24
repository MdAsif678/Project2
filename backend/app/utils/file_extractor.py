import os
import shutil
import zipfile
import tempfile
from pathlib import Path
from typing import Generator, Tuple

SUPPORTED_EXTENSIONS = {
    ".py", ".js", ".jsx", ".ts", ".tsx", ".java", ".go", ".c", ".cpp", ".h",
    ".hpp", ".cs", ".rs", ".php", ".rb", ".json", ".yaml", ".yml", ".properties",
    ".conf", ".config", ".env", ".toml", ".gradle", ".xml"
}

IGNORED_DIRECTORIES = {
    "node_modules", ".git", ".github", "__pycache__", ".venv", "venv", "env",
    "dist", "build", "target", ".idea", ".vscode", "coverage", ".next", ".nuxt",
    ".pytest_cache", "bin", "obj"
}

def is_safe_path(base_dir: Path, path: Path) -> bool:
    """Ensure path does not escape base directory (Zip Slip mitigation)."""
    try:
        resolved = path.resolve()
        base_resolved = base_dir.resolve()
        return str(resolved).startswith(str(base_resolved))
    except Exception:
        return False

def extract_zip_safely(zip_bytes: bytes, max_files: int = 1000, max_size_mb: int = 50) -> Tuple[Path, list[str]]:
    """Safely extracts a zip file into a temporary directory."""
    temp_dir = Path(tempfile.mkdtemp(prefix="aegis_q_scan_"))
    extracted_files: list[str] = []
    total_size = 0
    max_bytes = max_size_mb * 1024 * 1024

    zip_path = temp_dir / "uploaded_archive.zip"
    with open(zip_path, "wb") as f:
        f.write(zip_bytes)

    with zipfile.ZipFile(zip_path, "r") as zf:
        file_list = zf.infolist()
        if len(file_list) > max_files:
            raise ValueError(f"ZIP contains too many files ({len(file_list)} > limit of {max_files}).")

        for member in file_list:
            # Check for directory traversal
            target_path = temp_dir / "extracted" / member.filename
            if not is_safe_path(temp_dir / "extracted", target_path):
                continue

            if member.file_size > 10 * 1024 * 1024:  # Single file max 10MB
                continue

            total_size += member.file_size
            if total_size > max_bytes:
                raise ValueError(f"Uncompressed archive exceeds size limit of {max_size_mb}MB.")

            if not member.is_dir():
                target_path.parent.mkdir(parents=True, exist_ok=True)
                with zf.open(member) as src, open(target_path, "wb") as dst:
                    shutil.copyfileobj(src, dst)
                extracted_files.append(str(target_path))

    # Remove the uploaded archive to save space
    if zip_path.exists():
        zip_path.unlink()

    return temp_dir / "extracted", extracted_files

def traverse_source_files(root_dir: Path) -> Generator[Tuple[Path, str], None, None]:
    """Traverses a directory yielding (file_path, relative_path) for supported source code files."""
    for root, dirs, files in os.walk(root_dir):
        # Prune ignored directories
        dirs[:] = [d for d in dirs if d not in IGNORED_DIRECTORIES and not d.startswith(".")]

        for file in files:
            file_path = Path(root) / file
            if file_path.suffix.lower() in SUPPORTED_EXTENSIONS:
                try:
                    rel_path = file_path.relative_to(root_dir).as_posix()
                    yield file_path, rel_path
                except Exception:
                    continue
