from __future__ import annotations

import pytest

from voice.intents.models import FollowUpType, IntentType
from voice.intents.parser import parse

# --- Every example phrase from the Step 2 spec ---

_SPEC_EXAMPLES = [
    ("Should I pit?", IntentType.STRATEGY),
    ("How are my tyres?", IntentType.TYRE),
    ("Fuel?", IntentType.FUEL),
    ("Battery?", IntentType.ERS),
    ("Do I have DRS?", IntentType.DRS),
    ("Gap ahead?", IntentType.TELEMETRY),
    ("Weather?", IntentType.WEATHER),
    ("Damage?", IntentType.DAMAGE),
    ("How was Turn 4?", IntentType.COACHING),
    ("How many laps left?", IntentType.SESSION),
]


@pytest.mark.parametrize(("text", "expected"), _SPEC_EXAMPLES)
def test_parses_every_spec_example_correctly(text, expected):
    assert parse(text).intent_type == expected


def test_unrecognized_question_is_unknown():
    result = parse("What is the meaning of life?")
    assert result.intent_type == IntentType.UNKNOWN
    assert result.follow_up is None


def test_why_is_a_follow_up_not_a_topic_intent():
    result = parse("Why?")
    assert result.follow_up == FollowUpType.WHY


def test_when_is_a_follow_up_not_a_topic_intent():
    result = parse("When?")
    assert result.follow_up == FollowUpType.WHEN
    result2 = parse("When then?")
    assert result2.follow_up == FollowUpType.WHEN


def test_why_buried_in_a_longer_question_is_not_treated_as_a_follow_up():
    # "why" appearing deep in an otherwise normal question is a new
    # question, not a request to explain the previous answer.
    result = parse("Why is my tyre wear so high on this compound choice today")
    assert result.follow_up is None
    assert result.intent_type == IntentType.TYRE


def test_parsing_is_case_insensitive():
    assert parse("SHOULD I PIT?").intent_type == IntentType.STRATEGY
    assert parse("fuel").intent_type == IntentType.FUEL


def test_plural_forms_are_recognized_without_separate_keywords():
    # "tyre" should match "tyres", "lap" style matching should still
    # find "gap"/"sector" etc regardless of surrounding words.
    assert parse("What are my tyres doing").intent_type == IntentType.TYRE
    assert parse("Any tyre issues").intent_type == IntentType.TYRE


def test_empty_and_whitespace_only_text_is_unknown():
    assert parse("").intent_type == IntentType.UNKNOWN
    assert parse("   ").intent_type == IntentType.UNKNOWN


def test_gap_ahead_and_gap_behind_both_route_to_telemetry():
    assert parse("Gap ahead?").intent_type == IntentType.TELEMETRY
    assert parse("Gap behind?").intent_type == IntentType.TELEMETRY


def test_strategy_keywords_take_priority_over_other_topics_in_the_same_question():
    # "pit" is checked first, deliberately - see parser.py's
    # _INTENT_CHECK_ORDER comment on why strategy questions route first.
    result = parse("Should I pit for fresh tyres")
    assert result.intent_type == IntentType.STRATEGY


def test_original_raw_text_is_preserved_verbatim():
    result = parse("  Gap Ahead?  ")
    assert result.raw_text == "  Gap Ahead?  "
