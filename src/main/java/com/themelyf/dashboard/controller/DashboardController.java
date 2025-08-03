package com.themelyf.dashboard.controller;

import com.themelyf.dashboard.model.DashboardItem;
import com.themelyf.dashboard.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;
import java.util.Optional;

@Controller
@RequestMapping("/")
public class DashboardController {
    
    @Autowired
    private DashboardService dashboardService;
    
    @GetMapping
    public String dashboard(Model model,
                          @RequestParam(required = false) String search,
                          @RequestParam(required = false) String category,
                          @RequestParam(required = false) String status) {
        
        List<DashboardItem> items;
        
        if (search != null && !search.trim().isEmpty()) {
            items = dashboardService.searchItems(search);
        } else if (category != null && !category.trim().isEmpty()) {
            items = dashboardService.getItemsByCategory(category);
        } else if (status != null && !status.trim().isEmpty()) {
            items = dashboardService.getItemsByStatus(status);
        } else {
            items = dashboardService.getAllItems();
        }
        
        model.addAttribute("items", items);
        model.addAttribute("categories", dashboardService.getAllCategories());
        model.addAttribute("statuses", dashboardService.getAllStatuses());
        model.addAttribute("totalCount", dashboardService.getTotalCount());
        model.addAttribute("currentSearch", search);
        model.addAttribute("currentCategory", category);
        model.addAttribute("currentStatus", status);
        model.addAttribute("newItem", new DashboardItem());
        model.addAttribute("content", "dashboard-new");
        
        return "dashboard-new";
    }
    
    @GetMapping("/item/{id}")
    public String viewItem(@PathVariable Long id, Model model) {
        Optional<DashboardItem> item = dashboardService.getItemById(id);
        if (item.isPresent()) {
            model.addAttribute("item", item.get());
            return "item-detail";
        }
        return "redirect:/";
    }
    
    @GetMapping("/item/{id}/edit")
    public String editItemForm(@PathVariable Long id, Model model) {
        Optional<DashboardItem> item = dashboardService.getItemById(id);
        if (item.isPresent()) {
            model.addAttribute("item", item.get());
            model.addAttribute("categories", dashboardService.getAllCategories());
            model.addAttribute("statuses", dashboardService.getAllStatuses());
            return "item-edit";
        }
        return "redirect:/";
    }
    
    @PostMapping("/item/save")
    public String saveItem(@ModelAttribute DashboardItem item, RedirectAttributes redirectAttributes) {
        try {
            dashboardService.saveItem(item);
            redirectAttributes.addFlashAttribute("successMessage", "Item saved successfully!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Error saving item: " + e.getMessage());
        }
        return "redirect:/";
    }
    
    @PostMapping("/item/{id}/delete")
    public String deleteItem(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            dashboardService.deleteItem(id);
            redirectAttributes.addFlashAttribute("successMessage", "Item deleted successfully!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Error deleting item: " + e.getMessage());
        }
        return "redirect:/";
    }
    
    @GetMapping("/api/search")
    @ResponseBody
    public List<DashboardItem> searchApi(@RequestParam String q) {
        return dashboardService.searchItems(q);
    }
    
    @GetMapping("/components")
    public String componentsDemo(Model model) {
        model.addAttribute("demoItem", new DashboardItem("Demo Item", "This is a demo item", "Demo", "Active"));
        model.addAttribute("content", "components-enhanced");
        return "components-enhanced";
    }
    
    @GetMapping("/forms")
    public String formsDemo(Model model) {
        model.addAttribute("content", "form-examples");
        return "form-examples";
    }
}