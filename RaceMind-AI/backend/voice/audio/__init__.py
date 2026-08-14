"""Real microphone input and speaker output for the voice pipeline.
Everything here is I/O plumbing around sounddevice/soundfile - the
actual intelligence (what to say, when to say it) stays entirely in
voice/service.py and voice/intents/, which this package doesn't
duplicate.
"""
