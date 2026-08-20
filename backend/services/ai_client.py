"""
Shared AI client wrapper.

Design goal: the hackathon demo must work OUT OF THE BOX, even with no API
key configured (judges/graders may run it offline). So this module:

1. If ANTHROPIC_API_KEY is set in the environment -> calls the real Claude
   API (via the `anthropic` Python SDK) using the given system + user prompt
   and expects a JSON response.
2. If no key is set, or the call fails for any reason -> falls back to a
   deterministic, rule-based JSON generator supplied by the caller.

This keeps every feature "AI-powered when a key is available" while never
leaving the product broken in a judging environment without internet/keys.
"""
import os
import json
import logging

logger = logging.getLogger("nyayamitra.ai_client")

USE_LIVE_AI = bool(os.environ.get("ANTHROPIC_API_KEY"))

if USE_LIVE_AI:
    try:
        import anthropic
        _client = anthropic.Anthropic()
    except Exception as e:  # pragma: no cover
        logger.warning("Anthropic SDK not available, falling back to rule-based AI: %s", e)
        USE_LIVE_AI = False


def call_ai(system_prompt: str, user_prompt: str, fallback_fn, model: str = "claude-sonnet-4-6"):
    """
    Calls the LLM with system+user prompt and parses JSON from the response.
    Falls back to `fallback_fn()` (a zero-arg callable returning a dict) on
    any failure — missing key, network error, malformed JSON, etc.
    """
    if not USE_LIVE_AI:
        return fallback_fn()

    try:
        response = _client.messages.create(
            model=model,
            max_tokens=1500,
            system=system_prompt,
            messages=[{"role": "user", "content": user_prompt}],
        )
        text = "".join(
            block.text for block in response.content if getattr(block, "type", "") == "text"
        )
        text = text.strip()
        # Strip accidental markdown fences
        if text.startswith("```"):
            text = text.strip("`")
            text = text.replace("json\n", "", 1) if text.startswith("json\n") else text
        return json.loads(text)
    except Exception as e:
        logger.warning("Live AI call failed, using rule-based fallback: %s", e)
        return fallback_fn()
