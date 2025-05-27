package migrations

import (
	"log"
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// ValidCategories contains all valid task categories
var ValidCategories = []string{
	"user-guidance",
	"password-reset",
	"incident-solving",
	"request-solving",
	"faq",
	"sla-monitoring",
}

// hashPassword creates a bcrypt hash of the password
func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}

// RunMigrations runs all database migrations in order
func RunMigrations(db *gorm.DB) error {
	log.Println("Running database migrations...")

	// Run migrations in order
	migrations := []struct {
		Name string
		Fn   func(*gorm.DB) error
	}{
		{"Create Users Table", CreateUsersTable},
		{"Create Tasks Table", CreateTasksTable},
	}

	for _, migration := range migrations {
		log.Printf("Running migration: %s", migration.Name)
		if err := migration.Fn(db); err != nil {
			log.Printf("Error running migration %s: %v", migration.Name, err)
			return err
		}
		log.Printf("Successfully completed migration: %s", migration.Name)
	}

	log.Println("All migrations completed successfully")
	return nil
}

// SeedDatabase seeds the database with initial data
func SeedDatabase(db *gorm.DB) error {
	log.Println("Checking if database needs seeding...")

	var userCount int64
	if err := db.Model(&User{}).Count(&userCount).Error; err != nil {
		return err
	}

	if userCount == 0 {
		log.Println("Seeding database with initial data...")

		// Hash passwords
		adminPassword, err := hashPassword("admin123")
		if err != nil {
			return err
		}

		userPassword, err := hashPassword("user123")
		if err != nil {
			return err
		}

		// Create users with correct passwords
		users := []User{
			{
				Email:    "admin@supportdesk.com",
				Password: adminPassword,
				Role:     "admin",
			},
			{
				Email:    "john.doe@company.com",
				Password: userPassword, // Changed to user123
				Role:     "user",
			},
			{
				Email:    "sarah.smith@company.com",
				Password: userPassword, // Changed to user123
				Role:     "user",
			},
			{
				Email:    "tech.support@company.com",
				Password: adminPassword,
				Role:     "admin",
			},
			{
				Email:    "help.desk@company.com",
				Password: adminPassword,
				Role:     "admin",
			},
		}

		for _, user := range users {
			if err := db.Create(&user).Error; err != nil {
				return err
			}
		}

		// Get admin user for creating tasks
		var admin User
		if err := db.Where("email = ?", "admin@supportdesk.com").First(&admin).Error; err != nil {
			return err
		}

		// Create tasks for each category
		tasks := []Task{
			// User Guidance Tasks
			{
				Title:       "Getting Started with the Support System",
				Description: "Complete guide for new users on how to use the support desk system",
				Content:     "Welcome to our support desk system! This comprehensive guide will walk you through all the essential features...",
				Type:        "Q&A",
				Category:    "user-guidance",
				Status:      "approved",
				Keywords:    []string{"getting started", "guide", "introduction", "basics"},
				UserID:      admin.ID,
				Rating:      4.5,
			},
			{
				Title:       "How to Submit a Support Ticket",
				Description: "Step-by-step guide on creating and managing support tickets",
				Content:     "Learn how to effectively submit support tickets to get the help you need quickly...",
				Type:        "Q&A",
				Category:    "user-guidance",
				Status:      "approved",
				Keywords:    []string{"tickets", "support", "help", "request"},
				UserID:      admin.ID,
				Rating:      4.8,
			},
			{
				Title:       "Understanding Priority Levels",
				Description: "Explanation of different ticket priority levels and their meanings",
				Content:     "Our support system uses different priority levels to ensure critical issues are handled promptly...",
				Type:        "Q&A",
				Category:    "user-guidance",
				Status:      "approved",
				Keywords:    []string{"priority", "urgent", "normal", "low"},
				UserID:      admin.ID,
				Rating:      4.2,
			},
			{
				Title:       "Using Advanced Search Features",
				Description: "Guide to using advanced search functionality",
				Content:     "Make the most of our powerful search features to find solutions quickly...",
				Type:        "Q&A",
				Category:    "user-guidance",
				Status:      "approved",
				Keywords:    []string{"search", "filter", "advanced", "find"},
				UserID:      admin.ID,
				Rating:      4.0,
			},
			{
				Title:       "Customizing Your Support Portal",
				Description: "Learn how to personalize your support desk experience",
				Content:     "Customize your dashboard, notification settings, and preferences to work more efficiently...",
				Type:        "Q&A",
				Category:    "user-guidance",
				Status:      "approved",
				Keywords:    []string{"customize", "settings", "preferences", "profile"},
				UserID:      admin.ID,
				Rating:      4.3,
			},

			// Password Reset Tasks
			{
				Title:       "Standard Password Reset Process",
				Description: "Official procedure for resetting your password",
				Content:     "Follow these steps to safely reset your password and regain access to your account...",
				Type:        "Q&A",
				Category:    "password-reset",
				Status:      "approved",
				Keywords:    []string{"password", "reset", "security", "access"},
				UserID:      admin.ID,
				Rating:      4.7,
			},
			{
				Title:       "Two-Factor Authentication Setup",
				Description: "Guide to enabling and using 2FA",
				Content:     "Enhance your account security by setting up two-factor authentication...",
				Type:        "Q&A",
				Category:    "password-reset",
				Status:      "approved",
				Keywords:    []string{"2FA", "security", "authentication", "protection"},
				UserID:      admin.ID,
				Rating:      4.6,
			},
			{
				Title:       "Account Recovery Options",
				Description: "Different methods for account recovery",
				Content:     "Learn about various ways to recover your account if you lose access...",
				Type:        "Q&A",
				Category:    "password-reset",
				Status:      "approved",
				Keywords:    []string{"recovery", "access", "security", "account"},
				UserID:      admin.ID,
				Rating:      4.4,
			},
			{
				Title:       "Password Security Best Practices",
				Description: "Guidelines for creating and maintaining secure passwords",
				Content:     "Follow these best practices to create strong passwords and keep your account secure...",
				Type:        "Q&A",
				Category:    "password-reset",
				Status:      "approved",
				Keywords:    []string{"security", "password", "best practices", "protection"},
				UserID:      admin.ID,
				Rating:      4.9,
			},
			{
				Title:       "Emergency Password Reset Protocol",
				Description: "Procedure for urgent password reset situations",
				Content:     "When you need immediate access, follow this emergency protocol...",
				Type:        "Q&A",
				Category:    "password-reset",
				Status:      "approved",
				Keywords:    []string{"emergency", "urgent", "reset", "immediate"},
				UserID:      admin.ID,
				Rating:      4.5,
			},

			// Incident Solving Tasks
			{
				Title:       "Network Connectivity Issues",
				Description: "Troubleshooting guide for network problems",
				Content:     "Follow this comprehensive guide to diagnose and resolve network connectivity issues...",
				Type:        "Issue",
				Category:    "incident-solving",
				Status:      "approved",
				Keywords:    []string{"network", "connectivity", "internet", "troubleshooting"},
				UserID:      admin.ID,
				Rating:      4.6,
			},
			{
				Title:       "Application Error Resolution",
				Description: "Steps to resolve common application errors",
				Content:     "Learn how to identify and fix common application errors and crashes...",
				Type:        "Issue",
				Category:    "incident-solving",
				Status:      "approved",
				Keywords:    []string{"error", "application", "crash", "fix"},
				UserID:      admin.ID,
				Rating:      4.3,
			},
			{
				Title:       "System Performance Optimization",
				Description: "Guide to improving system performance",
				Content:     "Follow these steps to optimize your system's performance and speed...",
				Type:        "Issue",
				Category:    "incident-solving",
				Status:      "approved",
				Keywords:    []string{"performance", "optimization", "speed", "system"},
				UserID:      admin.ID,
				Rating:      4.7,
			},
			{
				Title:       "Data Recovery Procedures",
				Description: "Steps for recovering lost or corrupted data",
				Content:     "Learn how to recover lost data and prevent future data loss...",
				Type:        "Issue",
				Category:    "incident-solving",
				Status:      "approved",
				Keywords:    []string{"data", "recovery", "backup", "restore"},
				UserID:      admin.ID,
				Rating:      4.8,
			},
			{
				Title:       "Security Incident Response",
				Description: "Protocol for handling security incidents",
				Content:     "Follow this protocol when dealing with security breaches or incidents...",
				Type:        "Issue",
				Category:    "incident-solving",
				Status:      "approved",
				Keywords:    []string{"security", "incident", "breach", "response"},
				UserID:      admin.ID,
				Rating:      4.9,
			},

			// Request Solving Tasks
			{
				Title:       "Software Installation Request",
				Description: "Process for requesting new software installation",
				Content:     "Learn how to submit and track software installation requests...",
				Type:        "Q&A",
				Category:    "request-solving",
				Status:      "approved",
				Keywords:    []string{"software", "installation", "request", "new"},
				UserID:      admin.ID,
				Rating:      4.4,
			},
			{
				Title:       "Hardware Upgrade Process",
				Description: "Guidelines for requesting hardware upgrades",
				Content:     "Follow this process to request and receive hardware upgrades...",
				Type:        "Q&A",
				Category:    "request-solving",
				Status:      "approved",
				Keywords:    []string{"hardware", "upgrade", "request", "equipment"},
				UserID:      admin.ID,
				Rating:      4.5,
			},
			{
				Title:       "Access Permission Requests",
				Description: "How to request additional system access",
				Content:     "Learn the proper procedure for requesting new system access permissions...",
				Type:        "Q&A",
				Category:    "request-solving",
				Status:      "approved",
				Keywords:    []string{"access", "permissions", "request", "security"},
				UserID:      admin.ID,
				Rating:      4.6,
			},
			{
				Title:       "Training Session Requests",
				Description: "Process for requesting training sessions",
				Content:     "Submit and manage requests for training sessions and workshops...",
				Type:        "Q&A",
				Category:    "request-solving",
				Status:      "approved",
				Keywords:    []string{"training", "learning", "workshop", "request"},
				UserID:      admin.ID,
				Rating:      4.3,
			},
			{
				Title:       "Resource Allocation Requests",
				Description: "Guidelines for requesting additional resources",
				Content:     "Follow these steps to request additional system or project resources...",
				Type:        "Q&A",
				Category:    "request-solving",
				Status:      "approved",
				Keywords:    []string{"resources", "allocation", "request", "project"},
				UserID:      admin.ID,
				Rating:      4.7,
			},

			// FAQ Tasks
			{
				Title:       "Common Login Issues",
				Description: "Frequently asked questions about login problems",
				Content:     "Find answers to the most common login-related questions and issues...",
				Type:        "Q&A",
				Category:    "faq",
				Status:      "approved",
				Keywords:    []string{"login", "access", "password", "common"},
				UserID:      admin.ID,
				Rating:      4.5,
			},
			{
				Title:       "System Requirements",
				Description: "FAQ about system requirements and compatibility",
				Content:     "Learn about the minimum system requirements and compatibility information...",
				Type:        "Q&A",
				Category:    "faq",
				Status:      "approved",
				Keywords:    []string{"requirements", "compatibility", "system", "specs"},
				UserID:      admin.ID,
				Rating:      4.4,
			},
			{
				Title:       "Data Backup FAQ",
				Description: "Common questions about data backup",
				Content:     "Find answers to frequently asked questions about data backup and recovery...",
				Type:        "Q&A",
				Category:    "faq",
				Status:      "approved",
				Keywords:    []string{"backup", "data", "recovery", "storage"},
				UserID:      admin.ID,
				Rating:      4.6,
			},
			{
				Title:       "Security Policy FAQ",
				Description: "Frequently asked questions about security policies",
				Content:     "Understanding our security policies and procedures...",
				Type:        "Q&A",
				Category:    "faq",
				Status:      "approved",
				Keywords:    []string{"security", "policy", "guidelines", "rules"},
				UserID:      admin.ID,
				Rating:      4.8,
			},
			{
				Title:       "Software Updates FAQ",
				Description: "Common questions about software updates",
				Content:     "Learn about our software update process and schedule...",
				Type:        "Q&A",
				Category:    "faq",
				Status:      "approved",
				Keywords:    []string{"updates", "software", "maintenance", "schedule"},
				UserID:      admin.ID,
				Rating:      4.3,
			},

			// SLA Monitoring Tasks
			{
				Title:       "Response Time Standards",
				Description: "Overview of SLA response time requirements",
				Content:     "Understanding our service level agreement response time standards...",
				Type:        "Q&A",
				Category:    "sla-monitoring",
				Status:      "approved",
				Keywords:    []string{"SLA", "response", "time", "standards"},
				UserID:      admin.ID,
				Rating:      4.7,
			},
			{
				Title:       "Priority Level Metrics",
				Description: "SLA metrics for different priority levels",
				Content:     "Detailed breakdown of SLA metrics for each priority level...",
				Type:        "Q&A",
				Category:    "sla-monitoring",
				Status:      "approved",
				Keywords:    []string{"priority", "metrics", "SLA", "performance"},
				UserID:      admin.ID,
				Rating:      4.5,
			},
			{
				Title:       "Service Availability Reports",
				Description: "Guide to understanding service availability reports",
				Content:     "Learn how to interpret and use service availability reports...",
				Type:        "Q&A",
				Category:    "sla-monitoring",
				Status:      "approved",
				Keywords:    []string{"availability", "reports", "uptime", "monitoring"},
				UserID:      admin.ID,
				Rating:      4.6,
			},
			{
				Title:       "Performance Monitoring Tools",
				Description: "Overview of SLA monitoring tools",
				Content:     "Guide to using our SLA performance monitoring tools...",
				Type:        "Q&A",
				Category:    "sla-monitoring",
				Status:      "approved",
				Keywords:    []string{"monitoring", "tools", "performance", "tracking"},
				UserID:      admin.ID,
				Rating:      4.4,
			},
			{
				Title:       "SLA Compliance Reporting",
				Description: "Understanding SLA compliance reports",
				Content:     "Learn how to generate and interpret SLA compliance reports...",
				Type:        "Q&A",
				Category:    "sla-monitoring",
				Status:      "approved",
				Keywords:    []string{"compliance", "reporting", "SLA", "metrics"},
				UserID:      admin.ID,
				Rating:      4.8,
			},
		}

		// Create tasks with different timestamps
		baseTime := time.Now().Add(-30 * 24 * time.Hour) // Start from 30 days ago
		for i, task := range tasks {
			task.CreatedAt = baseTime.Add(time.Duration(i) * 12 * time.Hour)
			task.UpdatedAt = task.CreatedAt
			if err := db.Create(&task).Error; err != nil {
				log.Printf("Warning: Failed to create task '%s': %v", task.Title, err)
			}
		}

		log.Println("Database seeding completed successfully")
	} else {
		log.Println("Database already contains data, skipping seeding")
	}

	return nil
}