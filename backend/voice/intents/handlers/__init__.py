"""One module per intent, each a thin call into an existing backend
module - engineer/'s advisors, strategy/'s calculations, or
services/'s DB-backed services - reshaped into an OllieResponse via
response_builder.build_response(). No handler here computes an
engineering answer itself; every `handle()` is `async def handle(parsed:
ParsedIntent, ctx: HandlerContext) -> OllieResponse`, uniformly, even
though most handlers only need `ctx` - see router.py for why every
handler shares one signature regardless of what it actually uses.
"""
