import asyncio
import pyaudio
from google import genai
from google.genai import types

# --- ÎNLOCUIEȘTE CU CHEIA TA DE LA GOOGLE AI STUDIO ---
API_KEY = "de pus in env"

FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 16000
CHUNK = 512

async def run_voice_agent():
    client = genai.Client(api_key=API_KEY)
    
    # 1. CORELARE EROARE: Am adăugat `text=` în Part.from_text
    config = types.LiveConnectConfig(
        response_modalities=[types.Modality.AUDIO], # Modelul va genera voce, dar de obicei trimite automat și transcrierea
        system_instruction=types.Content(parts=[
            types.Part.from_text(
                text="Ești 'Grijă', un asistent empatic creat de un nepot pentru bunicul său. Ești cald, respectuos și folosești propoziții scurte, ușor de înțeles. Vorbești doar în limba română."
            )
        ])
    )

    p = pyaudio.PyAudio()
    
    mic_stream = p.open(format=FORMAT, channels=CHANNELS, rate=RATE, input=True, frames_per_buffer=CHUNK)
    speaker_stream = p.open(format=FORMAT, channels=CHANNELS, rate=RATE, output=True, frames_per_buffer=CHUNK)

    print("⏳ Se conectează la Gemini... Așteaptă.")

    async with client.aio.live.connect(model="gemini-2.0-flash-exp", config=config) as session:
        print("✅ Conectat! Microfonul este deschis. Poți saluta agentul. (Ctrl+C pentru a opri)\n")

        async def send_to_gemini():
            while True:
                data = mic_stream.read(CHUNK, exception_on_overflow=False)
                await session.send(types.LiveClientRealtimeInput(
                    media_chunks=[types.Blob(data=data, mime_type="audio/pcm")]
                ))
                await asyncio.sleep(0.001)

        async def receive_from_gemini():
            # Această variabilă ne ajută să formatăm frumos textul în consolă
            new_turn = True
            
            async for response in session.receive():
                server_content = response.server_content
                if server_content is not None and server_content.model_turn is not None:
                    
                    if new_turn:
                        print("\n🤖 Grijă: ", end="", flush=True)
                        new_turn = False
                        
                    for part in server_content.model_turn.parts:
                        # 2. AFIȘARE TEXT: Dacă primim bucăți de text (transcriere), le printăm pe ecran continuu
                        if part.text:
                            print(part.text, end="", flush=True)
                            
                        # Dacă primim bucăți de audio, le trimitem direct în boxă
                        if part.inline_data and part.inline_data.data:
                            speaker_stream.write(part.inline_data.data)
                
                # Când Gemini consideră că rândul său s-a terminat, resetăm variabila
                elif server_content is not None and server_content.turn_complete:
                    new_turn = True

        await asyncio.gather(send_to_gemini(), receive_from_gemini())

if __name__ == "__main__":
    try:
        asyncio.run(run_voice_agent())
    except KeyboardInterrupt:
        print("\n\n🛑 Conexiune oprită de utilizator.")