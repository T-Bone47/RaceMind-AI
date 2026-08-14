"""Ollie's intelligence layer: recognizes what a driver asked, routes
it to the existing backend module that actually knows the answer,
and turns that answer into short, natural engineer speech.

Nothing in this package calculates strategy, tyre wear, fuel, or ERS -
every handler in intents/handlers/ calls an existing module in
engineer/, strategy/, or services/ and only reshapes the result into
speech. See intents/router.py for the top-level entry point.
"""
