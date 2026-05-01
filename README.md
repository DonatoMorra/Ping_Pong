# 🏆 BEERPONG CHAMPIONS - Beer Pong Tournament Manager

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen)
![Java](https://img.shields.io/badge/Java-21-orange)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)

**BEERPONG CHAMPIONS** è un'applicazione web moderna e robusta progettata per la gestione completa di tornei di Beer Pong. Dalla creazione delle squadre alla generazione automatica dei round fino alla proclamazione del campione, questo strumento semplifica ogni aspetto dell'organizzazione.

---

## 🚀 Funzionalità Principali

- **⚔️ Gestione Squadre**: Crea squadre personalizzate e assegna giocatori (massimo 2 per team).
- **📊 Struttura a Gironi**: Supporta fino a 4 gironi distinti per una fase a gruppi organizzata.
- **🎲 Generazione Automatica Match**: Algoritmo intelligente per generare round di partite casuali all'interno dei gironi.
- **🍺 Registro Partite**: Interfaccia intuitiva per inserire i punteggi in tempo reale.
- **🏆 Classifica Dinamica**: Tabella dei leader aggiornata istantaneamente con punti, vittorie e statistiche.
- **⚡ Progression Tournament**: Sistema fluido per passare dai gironi alle fasi finali (Semifinali e Finalissima).
- **🗑️ Reset Totale**: Funzione di pulizia rapida per iniziare un nuovo torneo in pochi secondi.

---

## 🛠️ Tech Stack

### Backend
- **Java 21**: Utilizzo delle ultime feature del linguaggio.
- **Spring Boot 3/4**: Framework core per l'architettura RESTful.
- **Spring Data JPA**: Per la persistenza dei dati su database relazionale.
- **MySQL**: Database affidabile per la memorizzazione di squadre, giocatori e match.
- **Lombok**: Per ridurre il codice boilerplate.

### Frontend
- **HTML5 & Vanilla JS**: Logica frontend reattiva e veloce.
- **Bootstrap 5**: Design responsivo e moderno con componenti premium.
- **CSS3 Custom**: Styling avanzato con effetti di glassmorphism e micro-animazioni.

### DevOps
- **Docker & Docker Compose**: Containerizzazione completa per un deployment immediato in qualsiasi ambiente.

---

## 📦 Installazione e Avvio

### Requisiti
- [Docker](https://www.docker.com/) e Docker Compose installati.
- In alternativa: Java 21+ e MySQL 8.

### Avvio rapido con Docker (Consigliato)

1. Clona la repository:
   ```bash
   git clone https://github.com/DonatoMorra/Beer_Pong.git
   cd Beer_Pong
   ```

2. Configura le variabili d'ambiente (opzionale):
   Assicurati che il file `.env` contenga le credenziali corrette per il database.

3. Avvia i container:
   ```bash
   docker-compose up --build
   ```

4. Accedi all'applicazione:
   Apri il browser su `http://localhost:8080`

---

## 📖 Come Utilizzare

1. **Creazione**: Vai nella tab "Squadre" e aggiungi i partecipanti. Ogni squadra può avere fino a 2 giocatori.
2. **Gironi**: Assegna le squadre a uno dei 4 gironi disponibili.
3. **Round**: Clicca su "GENERA ROUND 1" per creare i primi scontri.
4. **Risultati**: Nella tab "Partite", seleziona lo scontro e inserisci i punti. Clicca su "REGISTRA MATCH".
5. **Classifica**: Monitora l'andamento del torneo nella tab "Classifica".
6. **Fase Finale**: Una volta conclusi i gironi, genera le fasi finali fino alla 🏆 **FINALISSIMA**.

---

## 🤝 Contributi

I contributi sono sempre benvenuti! Se hai suggerimenti per nuove funzionalità o bug da segnalare, apri una *Issue* o invia una *Pull Request*.

---

## 👤 Autore

- **Donato Morra** - [GitHub](https://github.com/DonatoMorra)

---

> Progetto realizzato per rendere ogni torneo di Beer Pong un evento leggendario! 🍻🏓
