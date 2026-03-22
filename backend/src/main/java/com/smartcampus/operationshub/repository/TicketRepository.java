package com.smartcampus.operationshub.repository;

import com.smartcampus.operationshub.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByReportedByEmail(String email);
    List<Ticket> findByAssignedTechnicianEmail(String email);
}
