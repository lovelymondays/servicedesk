package models

// ValidCategories contains all valid task categories
var ValidCategories = []string{
	"user-guidance",
	"password-reset",
	"incident-solving",
	"request-solving",
	"faq",
	"sla-monitoring",
}

// Category represents a category in the system
type Category struct {
	ID    string `json:"id"`
	Title string `json:"title"`
}

// GetCategories returns all categories with their titles
func GetCategories() []Category {
	categories := []Category{
		{ID: "user-guidance", Title: "User Guidance"},
		{ID: "password-reset", Title: "Password Reset"},
		{ID: "incident-solving", Title: "Incident Solving"},
		{ID: "request-solving", Title: "Request Solving"},
		{ID: "faq", Title: "FAQ"},
		{ID: "sla-monitoring", Title: "SLA Monitoring"},
	}
	return categories
}

// AddCategory adds a new category to the valid categories list
func AddCategory(id string) {
	ValidCategories = append(ValidCategories, id)
}

// RemoveCategory removes a category from the valid categories list
func RemoveCategory(id string) bool {
	for i, cat := range ValidCategories {
		if cat == id {
			ValidCategories = append(ValidCategories[:i], ValidCategories[i+1:]...)
			return true
		}
	}
	return false
}

// IsValidCategory checks if a category is valid
func IsValidCategory(category string) bool {
	for _, cat := range ValidCategories {
		if cat == category {
			return true
		}
	}
	return false
} 