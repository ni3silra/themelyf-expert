package com.themelyf.dashboard.repository;

import com.themelyf.dashboard.model.DashboardItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DashboardItemRepository extends JpaRepository<DashboardItem, Long> {
    
    List<DashboardItem> findByCategory(String category);
    
    List<DashboardItem> findByStatus(String status);
    
    @Query("SELECT d FROM DashboardItem d WHERE " +
           "LOWER(d.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(d.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(d.category) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<DashboardItem> findBySearchTerm(@Param("searchTerm") String searchTerm);
    
    @Query("SELECT DISTINCT d.category FROM DashboardItem d ORDER BY d.category")
    List<String> findAllCategories();
    
    @Query("SELECT DISTINCT d.status FROM DashboardItem d ORDER BY d.status")
    List<String> findAllStatuses();
}