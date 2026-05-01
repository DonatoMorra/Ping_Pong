package com.example.Gioco.a.squadre.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.Gioco.a.squadre.Model.Utente;

@Repository
public interface UtenteRepository extends JpaRepository<Utente, Long> {
}
