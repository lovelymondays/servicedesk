package main

import (
	"log"
	"os"
	"os/exec"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"

	"supportdesk/config"
	"supportdesk/controllers"
	"supportdesk/middleware"
	"supportdesk/models"
)

func main() {
	// Initialize database
	config.InitDB()

	// Initialize default users
	if err := models.InitializeDefaultUsers(); err != nil {
		log.Printf("Warning: Failed to initialize default users: %v", err)
	} else {
		log.Println("Default users initialized successfully")
	}

	// Create Gin router
	r := gin.Default()

	// Configure CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
	}))

	// Public routes
	r.POST("/api/auth/login", controllers.Login)
	r.POST("/api/auth/register", controllers.Register)

	// Protected routes
	api := r.Group("/api")
	api.Use(middleware.AuthMiddleware())
	{
		// User routes
		api.GET("/user", controllers.GetCurrentUser)
		api.GET("/users", middleware.AdminOnly(), controllers.GetUsers)

		// Category routes
		api.GET("/categories", controllers.GetCategories)
		api.POST("/categories", middleware.AdminOnly(), controllers.CreateCategory)
		api.DELETE("/categories/:id", middleware.AdminOnly(), controllers.DeleteCategory)

		// Dashboard routes
		dashboard := api.Group("/dashboard")
		{
			// Read-only routes for all authenticated users
			dashboard.GET("/user-guidance", controllers.GetTasks)
			dashboard.GET("/user-guidance/:id", controllers.GetTask)
			dashboard.GET("/password-reset", controllers.GetTasks)
			dashboard.GET("/password-reset/:id", controllers.GetTask)
			dashboard.GET("/incident-solving", controllers.GetTasks)
			dashboard.GET("/incident-solving/:id", controllers.GetTask)
			dashboard.GET("/request-solving", controllers.GetTasks)
			dashboard.GET("/request-solving/:id", controllers.GetTask)
			dashboard.GET("/faq", controllers.GetTasks)
			dashboard.GET("/faq/:id", controllers.GetTask)
			dashboard.GET("/sla-monitoring", controllers.GetTasks)
			dashboard.GET("/sla-monitoring/:id", controllers.GetTask)

			// Admin-only routes for content management
			admin := dashboard.Group("")
			admin.Use(middleware.AdminOnly())
			{
				// User Guidance
				admin.POST("/user-guidance", controllers.CreateTask)
				admin.PUT("/user-guidance/:id", controllers.UpdateTask)
				admin.DELETE("/user-guidance/:id", controllers.DeleteTask)

				// Password Reset
				admin.POST("/password-reset", controllers.CreateTask)
				admin.PUT("/password-reset/:id", controllers.UpdateTask)
				admin.DELETE("/password-reset/:id", controllers.DeleteTask)

				// Incident Solving
				admin.POST("/incident-solving", controllers.CreateTask)
				admin.PUT("/incident-solving/:id", controllers.UpdateTask)
				admin.DELETE("/incident-solving/:id", controllers.DeleteTask)

				// Request Solving
				admin.POST("/request-solving", controllers.CreateTask)
				admin.PUT("/request-solving/:id", controllers.UpdateTask)
				admin.DELETE("/request-solving/:id", controllers.DeleteTask)

				// FAQ
				admin.POST("/faq", controllers.CreateTask)
				admin.PUT("/faq/:id", controllers.UpdateTask)
				admin.DELETE("/faq/:id", controllers.DeleteTask)

				// SLA Monitoring
				admin.POST("/sla-monitoring", controllers.CreateTask)
				admin.PUT("/sla-monitoring/:id", controllers.UpdateTask)
				admin.DELETE("/sla-monitoring/:id", controllers.DeleteTask)
			}
		}
	}

	// Get port from environment variable or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Start server
	log.Printf("Server running on port %s\n", port)
	if err := r.Run(":" + port); err != nil {
		// If port is in use, try to force kill the process using it
		if err.Error() == "listen tcp :8080: bind: address already in use" {
			log.Println("Port 8080 is in use. Attempting to kill the process...")
			if err := exec.Command("sudo", "fuser", "-k", "8080/tcp").Run(); err != nil {
				log.Fatal("Failed to kill process:", err)
			}
			// Try starting the server again
			if err := r.Run(":" + port); err != nil {
				log.Fatal("Failed to start server:", err)
			}
		} else {
			log.Fatal("Failed to start server:", err)
		}
	}
}