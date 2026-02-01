# Shesha

**Recursive Language Models for Document Querying**

Shesha implements [Recursive Language Models (RLMs)](https://arxiv.org/abs/2512.24601) - a technique for querying document collections by having an LLM write Python code to explore them in a sandboxed REPL.

## Quick Start

```python
from shesha import Shesha

# Initialize
shesha = Shesha(model="claude-sonnet-4-20250514")

# Create a project and upload documents
project = shesha.create_project("research")
project.upload("papers/", recursive=True)
project.upload("notes.md")

# Query
result = project.query("What are the main findings?")
print(result.answer)

# Inspect the trace
for step in result.trace.steps:
    print(f"[{step.type.value}] {step.content[:100]}...")
```

## Installation

```bash
pip install shesha

# Build the sandbox container
docker build -t shesha-sandbox -f src/shesha/sandbox/Dockerfile src/shesha/sandbox/
```

## How It Works

1. Documents are loaded into a sandboxed Python REPL as the `context` variable
2. The LLM generates Python code to explore and analyze them
3. Code executes in a Docker container, output is returned to the LLM
4. The LLM iterates until calling `FINAL("answer")`

For large documents, the LLM can use `llm_query(instruction, content)` to delegate analysis to a sub-LLM.

## Configuration

```python
shesha = Shesha(
    model="claude-sonnet-4-20250514",  # Any LiteLLM model
    storage_path="./data",              # Where to store projects
    pool_size=3,                        # Warm container count
)
```

Or via environment variables: `SHESHA_MODEL`, `SHESHA_API_KEY`, `SHESHA_STORAGE_PATH`, etc.

## Supported Formats

- Text: `.txt`, `.md`, `.csv`
- Code: `.py`, `.js`, `.ts`, `.go`, `.rs`, `.java`, `.c`, `.cpp`, `.h`, `.hpp`
- Documents: `.pdf`, `.docx`, `.html`

## Security

See [SECURITY.md](SECURITY.md) for details on:
- Prompt injection defenses
- Docker sandbox configuration
- Network isolation

## License

MIT
