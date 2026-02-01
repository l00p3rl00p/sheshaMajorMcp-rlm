"""Tests for storage base classes."""

from shesha.storage.base import ParsedDocument


def test_parsed_document_creation():
    """ParsedDocument stores document metadata and content."""
    doc = ParsedDocument(
        name="test.txt",
        content="Hello world",
        format="txt",
        metadata={"encoding": "utf-8"},
        char_count=11,
        parse_warnings=[],
    )
    assert doc.name == "test.txt"
    assert doc.content == "Hello world"
    assert doc.char_count == 11
