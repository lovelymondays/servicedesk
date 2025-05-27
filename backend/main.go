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
)

func main() {
	// Initialize database
	config.InitDB()

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

	// Protected routes - all require authentication
	api := r.Group("/api")
	api.Use(middleware.AuthMiddleware())
	{
		// User routes
		api.GET("/user", controllers.GetCurrentUser)

		// Dashboard routes
		dashboard := api.Group("/dashboard")
		{
			// Read-only routes for all authenticated users (approved tasks only)
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

			// Task creation - available to all authenticated users (creates pending tasks)
			dashboard.POST("/user-guidance", controllers.CreateTask)
			dashboard.POST("/password-reset", controllers.CreateTask)
			dashboard.POST("/incident-solving", controllers.CreateTask)
			dashboard.POST("/request-solving", controllers.CreateTask)
			dashboard.POST("/faq", controllers.CreateTask)
			dashboard.POST("/sla-monitoring", controllers.CreateTask)

			// Admin-only routes for task management
			admin := dashboard.Group("")
			admin.Use(middleware.AdminOnly())
			{
				// Task editing and deletion (admin only)
				admin.PUT("/user-guidance/:id", controllers.UpdateTask)
				admin.DELETE("/user-guidance/:id", controllers.DeleteTask)
				admin.PUT("/password-reset/:id", controllers.UpdateTask)
				admin.DELETE("/password-reset/:id", controllers.DeleteTask)
				admin.PUT("/incident-solving/:id", controllers.UpdateTask)
				admin.DELETE("/incident-solving/:id", controllers.DeleteTask)
				admin.PUT("/request-solving/:id", controllers.UpdateTask)
				admin.DELETE("/request-solving/:id", controllers.DeleteTask)
				admin.PUT("/faq/:id", controllers.UpdateTask)
				admin.DELETE("/faq/:id", controllers.DeleteTask)
				admin.PUT("/sla-monitoring/:id", controllers.UpdateTask)
				admin.DELETE("/sla-monitoring/:id", controllers.DeleteTask)

				// Admin approval/rejection routes
				admin.PUT("/user-guidance/:id/approve", controllers.ApproveTask)
				admin.PUT("/user-guidance/:id/reject", controllers.RejectTask)
				admin.PUT("/password-reset/:id/approve", controllers.ApproveTask)
				admin.PUT("/password-reset/:id/reject", controllers.RejectTask)
				admin.PUT("/incident-solving/:id/approve", controllers.ApproveTask)
				admin.PUT("/incident-solving/:id/reject", controllers.RejectTask)
				admin.PUT("/request-solving/:id/approve", controllers.ApproveTask)
				admin.PUT("/request-solving/:id/reject", controllers.RejectTask)
				admin.PUT("/faq/:id/approve", controllers.ApproveTask)
				admin.PUT("/faq/:id/reject", controllers.RejectTask)
				admin.PUT("/sla-monitoring/:id/approve", controllers.ApproveTask)
				admin.PUT("/sla-monitoring/:id/reject", controllers.RejectTask)

				// Admin route to view all tasks (including pending ones)
				admin.GET("/pending-tasks", controllers.GetPendingTasks)
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