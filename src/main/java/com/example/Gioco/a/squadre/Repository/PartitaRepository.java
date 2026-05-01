package com.example.Gioco.a.squadre.Repository;

import com.example.Gioco.a.squadre.Model.Partita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PartitaRepository extends JpaRepository<Partita, Long> {
    List<Partita> findByGirone(int girone);
}
