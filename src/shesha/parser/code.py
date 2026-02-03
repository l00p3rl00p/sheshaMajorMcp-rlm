"""Code file parser for source code files."""

from pathlib import Path

from shesha.models import ParsedDocument

# Map extensions to language names
EXTENSION_TO_LANGUAGE = {
    ".py": "python",
    ".js": "javascript",
    ".ts": "typescript",
    ".tsx": "typescript",
    ".jsx": "javascript",
    ".java": "java",
    ".c": "c",
    ".cpp": "cpp",
    ".h": "c",
    ".hpp": "cpp",
    ".go": "go",
    ".rs": "rust",
    ".rb": "ruby",
    ".php": "php",
    ".swift": "swift",
    ".kt": "kotlin",
    ".scala": "scala",
    ".cs": "csharp",
    ".sh": "bash",
    ".bash": "bash",
    ".zsh": "zsh",
    ".sql": "sql",
    ".r": "r",
    ".R": "r",
}


class CodeParser:
    """Parser for source code files."""

    def can_parse(self, path: Path, mime_type: str | None = None) -> bool:
        """Check if this parser can handle the given file."""
        return path.suffix.lower() in EXTENSION_TO_LANGUAGE

    def parse(
        self,
        path: Path,
        include_line_numbers: bool = False,
        file_path: str | None = None,
    ) -> ParsedDocument:
        """Parse a code file and return a ParsedDocument.

        Args:
            path: Path to the file to parse.
            include_line_numbers: If True, format with line numbers and file header.
            file_path: Path to show in the file header (defaults to path.name).
        """
        content = path.read_text(encoding="utf-8")
        ext = path.suffix.lower()
        language = EXTENSION_TO_LANGUAGE.get(ext, "unknown")

        if include_line_numbers:
            display_path = file_path or path.name
            content = self._format_with_line_numbers(content, display_path)

        return ParsedDocument(
            name=path.name,
            content=content,
            format=ext.lstrip("."),
            metadata={"language": language, "encoding": "utf-8"},
            char_count=len(content),
            parse_warnings=[],
        )

    def _format_with_line_numbers(self, content: str, file_path: str) -> str:
        """Format content with file header and line numbers."""
        lines = content.split("\n")
        total_lines = len(lines)
        # Calculate padding width (at least 1 digit)
        width = len(str(total_lines)) if total_lines > 0 else 1

        formatted_lines = [f"=== FILE: {file_path} ==="]
        for i, line in enumerate(lines, start=1):
            formatted_lines.append(f"{i:>{width}}| {line}")

        return "\n".join(formatted_lines)
