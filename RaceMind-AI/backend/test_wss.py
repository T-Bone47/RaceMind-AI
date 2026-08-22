import asyncio
import websockets

async def test():
    try:
        async with websockets.connect(
            'wss://racemind-ai-backend.up.railway.app/ws/telemetry/ingest?agent_id=test-agent',
            additional_headers={
                'X-Agent-Secret': 'dev-agent-secret-change-me',
                'Origin': 'http://localhost:5173'
            }
        ) as ws:
            print('Connected successfully!')
            await ws.send('{"test": true}')
            await asyncio.sleep(1)
    except Exception as e:
        print(f'Error: {e}')

asyncio.run(test())
