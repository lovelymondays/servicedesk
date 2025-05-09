package controllers

import (
	"net/http"
	"supportdesk/models"

	"github.com/gin-gonic/gin"
)

// GetCategories returns all categories
func GetCategories(c *gin.Context) {
	categories := models.GetCategories()
	c.JSON(http.StatusOK, categories)
}

// CreateCategory creates a new category
func CreateCategory(c *gin.Context) {
	var input struct {
		ID    string `json:"id" binding:"required"`
		Title string `json:"title" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Add the new category
	models.AddCategory(input.ID)

	c.JSON(http.StatusCreated, models.Category{
		ID:    input.ID,
		Title: input.Title,
	})
}

// DeleteCategory removes a category
func DeleteCategory(c *gin.Context) {
	categoryID := c.Param("id")

	if !models.RemoveCategory(categoryID) {
		c.JSON(http.StatusNotFound, gin.H{"error": "Category not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Category deleted successfully"})
} 