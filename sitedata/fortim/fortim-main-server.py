import asyncio
import websockets
import threading

HOST = '127.0.0.1'  # Standard loopback interface address (localhost)
PORT = 65432        # Port to listen on (non-privileged ports are > 1023)

connected_clients = set()

async def handle_client(websocket, path):
    connected_clients.add(websocket)
    print(f"[NEW CONNECTION] {websocket.remote_address} connected.")
    try:
        async for message in websocket:
            print(f"[{websocket.remote_address}] {message}")
            for client in connected_clients:
                if client != websocket:
                    await client.send(message) 
    finally:
        connected_clients.remove(websocket)
        print(f"[DISCONNECTED] {websocket.remote_address} disconnected.")

async def main():
    async with websockets.serve(handle_client, HOST, PORT):
        print(f"[LISTENING] Server is listening on {HOST}:{PORT}")
        await asyncio.Future()  # Run forever

if __name__ == "__main__":
    asyncio.run(main())
