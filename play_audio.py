import tkinter as tk
from tkinter import messagebox
import pygame
import os

# Inițializăm modulul audio
pygame.mixer.init()

def play_audio(file_name):
    """Funcție care redă un fișier MP3."""
    # Verificăm dacă fișierul există lângă script
    if not os.path.exists(file_name):
        messagebox.showerror("Eroare", f"Nu găsesc fișierul: {file_name}")
        return
    
    # Oprim orice alt sunet care rulează și pornim noul fișier
    pygame.mixer.music.load(file_name)
    pygame.mixer.music.play()

def setup_ui():
    """Configurăm interfața grafică."""
    root = tk.Tk()
    root.title("Vibe - Asistent Familie")
    
    # Facem fereastra mai mare, cu un fundal plăcut
    root.geometry("400x500")
    root.configure(bg="#F0F8FF") # Un albastru foarte deschis, calmant
    
    # Titlu principal
    titlu = tk.Label(root, text="Mesaje de la Nepotul", font=("Arial", 18, "bold"), bg="#F0F8FF")
    titlu.pack(pady=30)
    
    # Configurarea stilului pentru butoane (font mare, vizibil)
    button_font = ("Arial", 14, "bold")
    button_bg = "#4CAF50" # Verde prietenos
    button_fg = "white"
    
    # Buton 1: Pastile Dimineața
    # Când e apăsat, rulează fișierul 'pastile_dimineata.mp3'
    btn_dimineata = tk.Button(root, text="☀️ Bună dimineața (Pastile)", 
                              font=button_font, bg=button_bg, fg=button_fg, 
                              height=2, width=25,
                              command=lambda: play_audio("pastile_dimineata.mp3"))
    btn_dimineata.pack(pady=15)
    
    # Buton 2: Check-in Prânz
    btn_pranz = tk.Button(root, text="🍲 Check-in Prânz", 
                          font=button_font, bg="#2196F3", fg=button_fg, # Albastru
                          height=2, width=25,
                          command=lambda: play_audio("salut_pranz.mp3"))
    btn_pranz.pack(pady=15)
    
    # Buton 3: Somn Ușor
    btn_seara = tk.Button(root, text="🌙 Somn Ușor", 
                          font=button_font, bg="#9C27B0", fg=button_fg, # Mov
                          height=2, width=25,
                          command=lambda: play_audio("somn_usor.mp3"))
    btn_seara.pack(pady=15)

    # Buton de oprire sunet (în caz de nevoie)
    btn_stop = tk.Button(root, text="🛑 Oprește vocea", 
                         font=("Arial", 12), bg="#F44336", fg="white",
                         command=pygame.mixer.music.stop)
    btn_stop.pack(pady=30)

    root.mainloop()

if __name__ == "__main__":
    setup_ui()