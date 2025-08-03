package com.themelyf.dashboard.service;

import com.themelyf.dashboard.model.DashboardItem;
import com.themelyf.dashboard.repository.DashboardItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DashboardService {
    
    @Autowired
    private DashboardItemRepository repository;
    
    @Cacheable("dashboardItems")
    public List<DashboardItem> getAllItems() {
        return repository.findAll();
    }
    
    @Cacheable("dashboardItem")
    public Optional<DashboardItem> getItemById(Long id) {
        return repository.findById(id);
    }
    
    @Cacheable("itemsByCategory")
    public List<DashboardItem> getItemsByCategory(String category) {
        return repository.findByCategory(category);
    }
    
    @Cacheable("itemsByStatus")
    public List<DashboardItem> getItemsByStatus(String status) {
        return repository.findByStatus(status);
    }
    
    @Cacheable("searchResults")
    public List<DashboardItem> searchItems(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return getAllItems();
        }
        return repository.findBySearchTerm(searchTerm.trim());
    }
    
    @Cacheable("categories")
    public List<String> getAllCategories() {
        return repository.findAllCategories();
    }
    
    @Cacheable("statuses")
    public List<String> getAllStatuses() {
        return repository.findAllStatuses();
    }
    
    @CacheEvict(value = {"dashboardItems", "itemsByCategory", "itemsByStatus", "searchResults", "categories", "statuses"}, allEntries = true)
    public DashboardItem saveItem(DashboardItem item) {
        return repository.save(item);
    }
    
    @CacheEvict(value = {"dashboardItems", "itemsByCategory", "itemsByStatus", "searchResults", "categories", "statuses"}, allEntries = true)
    public void deleteItem(Long id) {
        repository.deleteById(id);
    }
    
    public long getTotalCount() {
        return repository.count();
    }
}