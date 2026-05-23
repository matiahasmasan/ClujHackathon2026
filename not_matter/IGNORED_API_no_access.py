import requests

# --- ÎNLOCUIEȘTE ACESTE VALORI CU DATELE TALE ---
API_KEY = "sk_43f34e15a0d83c8eba2f0cb440afab2cc705e6a61303b451"
VOICE_ID = "urzoE6aZYmSRdFQ6215h"
# -----------------------------------------------

def testeaza_vocea_elevenlabs():
    # Verificăm rapid dacă ai înlocuit variabilele
    if "AICI" in API_KEY or "AICI" in VOICE_ID:
        print("⚠️ Nu uita să pui API_KEY și VOICE_ID reale sus în cod!")
        return

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"

    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": API_KEY
    }

    # Textul și setările pentru test
    payload = {
        "text": "Bună ziua, bunico, te iubesc.",
        "model_id": "eleven_multilingual_v2", # Obligatoriu pentru limba română
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75
        }
    }

    print("Se comunică cu serverele ElevenLabs... Așteaptă un moment.")

    # Facem request-ul către API
    response = requests.post(url, json=payload, headers=headers)

    # Verificăm dacă a funcționat
    if response.status_code == 200:
        nume_fisier = "test_checkin.mp3"
        # Salvăm fișierul audio pe disk
        with open(nume_fisier, "wb") as f:
            for chunk in response.iter_content(chunk_size=1024):
                if chunk:
                    f.write(chunk)
        print(f"✅ Gata! Fișierul audio a fost salvat cu succes sub numele: {nume_fisier}")
    else:
        print(f"❌ Eroare la generare (Cod: {response.status_code})")
        print("Detalii eroare:", response.json())

if __name__ == "__main__":
    testeaza_vocea_elevenlabs()