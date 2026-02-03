#!/usr/bin/env python3
"""Interactive Barsoom novel explorer using Shesha."""

import argparse
import os
import sys
import time
from pathlib import Path

from shesha import Shesha
from shesha.config import SheshaConfig
from shesha.rlm.trace import StepType

# Support both running as script and importing as module
if __name__ == "__main__":
    from script_utils import (
        ThinkingSpinner,
        format_history_prefix,
        format_progress,
        format_stats,
        format_thought_time,
        install_urllib3_cleanup_hook,
        is_exit_command,
        should_warn_history_size,
    )
else:
    from .script_utils import (
        ThinkingSpinner,
        format_history_prefix,
        format_progress,
        format_stats,
        format_thought_time,
        install_urllib3_cleanup_hook,
        is_exit_command,
        should_warn_history_size,
    )

BOOKS = {
    "barsoom-1.txt": "A Princess of Mars",
    "barsoom-2.txt": "The Gods of Mars",
    "barsoom-3.txt": "The Warlord of Mars",
    "barsoom-4.txt": "Thuvia, Maid of Mars",
    "barsoom-5.txt": "The Chessmen of Mars",
    "barsoom-6.txt": "The Master Mind of Mars",
    "barsoom-7.txt": "A Fighting Man of Mars",
}


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description="Explore the Barsoom novels using Shesha RLM")
    parser.add_argument(
        "--setup",
        action="store_true",
        help="Force re-upload of novels (even if project exists)",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Show execution stats after each answer",
    )
    parser.add_argument(
        "--prompt",
        type=str,
        help="Run a single query and exit (non-interactive mode)",
    )
    return parser.parse_args(argv)


STORAGE_PATH = "./barsoom_data"
PROJECT_NAME = "barsoom"


def get_datasets_dir() -> Path:
    """Get the path to the barsoom test datasets directory."""
    return Path(__file__).parent.parent / "test-datasets" / "barsoom"


def setup_project(shesha: Shesha) -> None:
    """Set up the barsoom project by uploading novels."""
    print("Setting up Barsoom project...")
    project = shesha.create_project(PROJECT_NAME)
    datasets_dir = get_datasets_dir()

    for filename, title in BOOKS.items():
        filepath = datasets_dir / filename
        print(f"Uploading: {title} ({filename})")
        project.upload(filepath)

    print(f"Setup complete! {len(BOOKS)} novels loaded.")


def main() -> None:
    """Main entry point."""
    install_urllib3_cleanup_hook()
    args = parse_args()

    # Check for API key
    if not os.environ.get("SHESHA_API_KEY"):
        print("Error: SHESHA_API_KEY environment variable not set.")
        print()
        print("Environment variables:")
        print("  SHESHA_API_KEY   (required) API key for your LLM provider")
        print("  SHESHA_MODEL     (optional) Model name, e.g.:")
        print("                   - claude-sonnet-4-20250514 (default, Anthropic)")
        print("                   - gpt-4o (OpenAI)")
        print("                   - gemini/gemini-1.5-pro (Google)")
        print()
        print("The provider is auto-detected from the model name via LiteLLM.")
        sys.exit(1)

    # Initialize Shesha with config from environment
    config = SheshaConfig.load(storage_path=STORAGE_PATH)
    shesha = Shesha(config=config)

    # Check if project exists
    project_exists = PROJECT_NAME in shesha.list_projects()

    # Setup if needed
    if args.setup or not project_exists:
        setup_project(shesha)

    # Get the project
    try:
        project = shesha.get_project(PROJECT_NAME)
    except ValueError as e:
        print(f"Error: {e}")
        sys.exit(1)

    # Non-interactive mode with --prompt
    if args.prompt:
        try:
            spinner = ThinkingSpinner()
            spinner.start()
            query_start_time = time.time()

            def on_progress(step_type: StepType, iteration: int, content: str) -> None:
                if args.verbose:
                    spinner.stop()
                    elapsed = time.time() - query_start_time
                    print(format_progress(step_type, iteration, content, elapsed_seconds=elapsed))
                    spinner.start()

            result = project.query(args.prompt, on_progress=on_progress)
            spinner.stop()

            elapsed = time.time() - query_start_time
            print(format_thought_time(elapsed))
            print(result.answer)
            print()

            if args.verbose:
                print(format_stats(result.execution_time, result.token_usage, result.trace))
                print()

        except Exception as e:
            spinner.stop()
            print(f"Error: {e}")
            sys.exit(1)
        return

    print()
    print('Ask questions about the Barsoom series. Type "quit" or "exit" to leave.')
    print()

    # Conversation history for follow-up questions
    history: list[tuple[str, str]] = []

    # Interactive loop
    while True:
        try:
            user_input = input("> ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nGoodbye!")
            break

        if not user_input:
            continue

        if is_exit_command(user_input):
            print("Goodbye!")
            break

        # Check if history is getting large
        if should_warn_history_size(history):
            print(f"Warning: Conversation history is large ({len(history)} exchanges).")
            try:
                clear = input("Clear history? (y/n): ").strip().lower()
                if clear == "y":
                    history.clear()
                    print("History cleared.")
            except (EOFError, KeyboardInterrupt):
                pass  # User cancelled, continue with existing history

        try:
            spinner = ThinkingSpinner()
            spinner.start()
            query_start_time = time.time()

            # Progress callback for verbose mode
            def on_progress(step_type: StepType, iteration: int, content: str) -> None:
                if args.verbose:
                    spinner.stop()
                    elapsed = time.time() - query_start_time
                    print(format_progress(step_type, iteration, content, elapsed_seconds=elapsed))
                    spinner.start()

            # Prepend conversation history for context
            prefix = format_history_prefix(history)
            full_question = f"{prefix}{user_input}" if prefix else user_input
            result = project.query(full_question, on_progress=on_progress)
            spinner.stop()

            elapsed = time.time() - query_start_time
            print(format_thought_time(elapsed))
            print(result.answer)
            print()

            # Store exchange in history
            history.append((user_input, result.answer))

            if args.verbose:
                print(format_stats(result.execution_time, result.token_usage, result.trace))
                print()

        except Exception as e:
            spinner.stop()
            print(f"Error: {e}")
            print('Try again or type "quit" to exit.')
            print()


if __name__ == "__main__":
    main()
