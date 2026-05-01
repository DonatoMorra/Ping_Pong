package com.example.Gioco.a.squadre.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.Gioco.a.squadre.Model.Squadra;

@Repository
public interface SquadreRepository extends JpaRepository<Squadra, Long> {

}
