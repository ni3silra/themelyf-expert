package com.themelyf.dashboard.config;

import com.themelyf.dashboard.model.DashboardItem;
import com.themelyf.dashboard.repository.DashboardItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private DashboardItemRepository repository;

    @Override
    public void run(String... args) throws Exception {
        if (repository.count() == 0) {
            List<DashboardItem> sampleItems = Arrays.asList(
                new DashboardItem(
                    "Welcome to Themelyf Dashboard",
                    "This is your main dashboard where you can manage all your items efficiently. " +
                    "Use the search functionality to find specific items, or filter by category and status.",
                    "Welcome",
                    "Active"
                ),
                new DashboardItem(
                    "Project Alpha Development",
                    "Major development project focusing on new user interface components and improved performance. " +
                    "Includes research, design, development, and testing phases.",
                    "Project",
                    "Active"
                ),
                new DashboardItem(
                    "Database Migration Task",
                    "Migrate existing data from legacy system to new database structure. " +
                    "Requires careful planning and testing to ensure data integrity.",
                    "Task",
                    "Pending"
                ),
                new DashboardItem(
                    "Security Audit Report",
                    "Comprehensive security audit of all system components. " +
                    "Review authentication, authorization, data encryption, and network security.",
                    "Security",
                    "Completed"
                ),
                new DashboardItem(
                    "User Documentation Update",
                    "Update user manuals and help documentation to reflect recent feature changes. " +
                    "Include screenshots and step-by-step guides.",
                    "Documentation",
                    "Active"
                ),
                new DashboardItem(
                    "Performance Optimization",
                    "Optimize application performance by implementing caching strategies, " +
                    "database query optimization, and frontend performance improvements.",
                    "Optimization",
                    "Active"
                ),
                new DashboardItem(
                    "Mobile App Beta Testing",
                    "Coordinate beta testing program for new mobile application. " +
                    "Recruit testers, collect feedback, and document issues.",
                    "Testing",
                    "Pending"
                ),
                new DashboardItem(
                    "API Integration Setup",
                    "Set up integration with third-party APIs for enhanced functionality. " +
                    "Includes authentication setup and error handling implementation.",
                    "Integration",
                    "Active"
                ),
                new DashboardItem(
                    "Training Session Planning",
                    "Plan and organize training sessions for new team members. " +
                    "Prepare materials, schedule sessions, and arrange training environments.",
                    "Training",
                    "Draft"
                ),
                new DashboardItem(
                    "Bug Fix: Login Issue",
                    "Fix critical login issue affecting users on older browsers. " +
                    "Problem identified in authentication cookie handling.",
                    "Bug Fix",
                    "Completed"
                ),
                new DashboardItem(
                    "Backup System Verification",
                    "Verify backup systems are working correctly and test restore procedures. " +
                    "Schedule regular verification checks.",
                    "Maintenance",
                    "Active"
                ),
                new DashboardItem(
                    "Feature Request Analysis",
                    "Analyze incoming feature requests from users and prioritize based on impact and effort. " +
                    "Create detailed specifications for approved features.",
                    "Analysis",
                    "Pending"
                ),
                new DashboardItem(
                    "Legacy System Retirement",
                    "Plan and execute retirement of legacy systems no longer in use. " +
                    "Ensure data migration and proper documentation.",
                    "Migration",
                    "Inactive"
                ),
                new DashboardItem(
                    "Code Review Guidelines",
                    "Establish and document code review guidelines for the development team. " +
                    "Include best practices and quality standards.",
                    "Guidelines",
                    "Draft"
                ),
                new DashboardItem(
                    "Customer Feedback Integration",
                    "Implement system for collecting and analyzing customer feedback. " +
                    "Set up automated surveys and feedback collection points.",
                    "Customer Experience",
                    "Active"
                )
            );

            repository.saveAll(sampleItems);
            System.out.println("Sample data initialized with " + sampleItems.size() + " items.");
        }
    }
}