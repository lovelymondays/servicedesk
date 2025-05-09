package models

import (
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/lib/pq"
	"gorm.io/gorm"
)

// Task represents a support task in the system
type Task struct {
	ID          uint           `json:"id" gorm:"primaryKey;autoIncrement:true"`
	Title       string         `json:"title" binding:"required"`
	Description string         `json:"description"`
	Content     string         `json:"content" gorm:"type:text"`
	Type        string         `json:"type" binding:"required"`
	Category    string         `json:"category" gorm:"index"`
	Status      string         `json:"status" gorm:"default:'pending'"`
	Rating      float64        `json:"rating" gorm:"default:0"`
	Keywords    pq.StringArray `json:"keywords" gorm:"type:text[]"`
	UserID      uint           `json:"user_id"`
	User        User           `json:"user" gorm:"foreignKey:UserID"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}

// TaskRequest is used for creating/updating tasks
type TaskRequest struct {
	Title       string   `json:"title" binding:"required"`
	Description string   `json:"description"`
	Content     string   `json:"content" binding:"required"`
	Type        string   `json:"type" binding:"required"`
	Category    string   `json:"category" binding:"required"`
	Keywords    []string `json:"keywords"`
}

// Constants for task types and statuses
const (
	TaskTypeQA    = "Q&A"
	TaskTypeIssue = "Issue"
)

var (
	ValidTaskTypes = []string{TaskTypeQA, TaskTypeIssue}
	ValidStatuses  = []string{"pending", "approved", "rejected"}
)

// GetTasks retrieves tasks based on filters
func GetTasks(category string, userID uint) ([]Task, error) {
	var tasks []Task
	query := DB.Preload("User")

	if category != "" {
		query = query.Where("category = ?", category)
	}
	if userID != 0 {
		query = query.Where("user_id = ?", userID)
	}

	err := query.Find(&tasks).Error
	return tasks, err
}

// GetTaskByID retrieves a single task by ID
func GetTaskByID(id uint) (*Task, error) {
	var task Task
	err := DB.Preload("User").First(&task, id).Error
	return &task, err
}

// CreateTask creates a new task
func CreateTask(req TaskRequest, userID uint) (*Task, error) {
	task := Task{
		Title:       req.Title,
		Description: req.Description,
		Content:     req.Content,
		Type:        req.Type,
		Category:    req.Category,
		Keywords:    req.Keywords,
		Status:      "pending",
		UserID:      userID,
	}

	if !task.ValidateType() {
		return nil, ErrInvalidType
	}

	err := DB.Create(&task).Error
	return &task, err
}

// UpdateTask updates an existing task
func UpdateTask(id uint, req TaskRequest) (*Task, error) {
	var task Task
	err := DB.First(&task, id).Error
	if err != nil {
		return nil, err
	}

	if !ValidateTaskType(req.Type) {
		return nil, ErrInvalidType
	}

	// Convert []string to pq.StringArray
	keywords := pq.StringArray(req.Keywords)

	// Update using struct with explicit field mapping
	updates := Task{
		Title:       req.Title,
		Description: req.Description,
		Content:     req.Content,
		Type:        req.Type,
		Category:    req.Category,
		Keywords:    keywords,
	}

	err = DB.Model(&task).Updates(updates).Error
	if err != nil {
		return nil, err
	}

	// Fetch the updated task to return
	err = DB.Preload("User").First(&task, id).Error
	return &task, err
}

// ValidateTaskType checks if the task type is valid
func ValidateTaskType(taskType string) bool {
	for _, validType := range ValidTaskTypes {
		if taskType == validType {
			return true
		}
	}
	return false
}

// DeleteTask deletes a task by ID
func DeleteTask(id uint) error {
	return DB.Delete(&Task{}, id).Error
}

// ValidateType checks if the task type is valid
func (t *Task) ValidateType() bool {
	for _, validType := range ValidTaskTypes {
		if t.Type == validType {
			return true
		}
	}
	return false
}

// Custom errors
var (
	ErrInvalidType = gorm.ErrInvalidField
)

// UpdateSeedFile updates the seed file with current tasks
func UpdateSeedFile() error {
	var tasks []Task
	if err := DB.Find(&tasks).Error; err != nil {
		return err
	}

	// Generate SQL statements
	var sql strings.Builder
	sql.WriteString("-- Auto-generated seed file\n")
	sql.WriteString("-- Last updated: " + time.Now().Format("2006-01-02 15:04:05") + "\n\n")
	sql.WriteString("-- Clear existing tasks\n")
	sql.WriteString("DELETE FROM tasks;\n\n")
	sql.WriteString("-- Reset tasks id sequence\n")
	sql.WriteString("ALTER SEQUENCE tasks_id_seq RESTART WITH 1;\n\n")
	sql.WriteString("-- Insert current tasks\n")

	// Group tasks by category
	categories := make(map[string][]Task)
	for _, task := range tasks {
		categories[task.Category] = append(categories[task.Category], task)
	}

	// Generate INSERT statements for each category
	for category, categoryTasks := range categories {
		sql.WriteString(fmt.Sprintf("\n-- %s Tasks\n", strings.Title(category)))
		for _, task := range categoryTasks {
			// Convert keywords array to PostgreSQL array literal
			keywordsStr := "NULL"
			if len(task.Keywords) > 0 {
				keywordsStr = fmt.Sprintf("ARRAY[%s]::text[]",
					strings.Join(quoteStrings(task.Keywords), ","))
			}

			sql.WriteString(fmt.Sprintf(`INSERT INTO tasks (title, description, content, type, category, status, rating, keywords, user_id, created_at, updated_at)
VALUES 
('%s', '%s', '%s', '%s', '%s', '%s', %f, %s, %d, NOW(), NOW());
`,
				escapeString(task.Title),
				escapeString(task.Description),
				escapeString(task.Content),
				escapeString(task.Type),
				escapeString(task.Category),
				escapeString(task.Status),
				task.Rating,
				keywordsStr,
				task.UserID,
			))
		}
	}

	// Write to seed file
	return os.WriteFile("scripts/seed_data.sql", []byte(sql.String()), 0644)
}

// quoteStrings wraps each string in single quotes and escapes existing quotes
func quoteStrings(strs []string) []string {
	quoted := make([]string, len(strs))
	for i, s := range strs {
		quoted[i] = fmt.Sprintf("'%s'", escapeString(s))
	}
	return quoted
}

// escapeString escapes single quotes in SQL strings
func escapeString(s string) string {
	return strings.ReplaceAll(s, "'", "''")
}

// Hooks to automatically update seed file
func (t *Task) AfterCreate(tx *gorm.DB) error {
	return UpdateSeedFile()
}

func (t *Task) AfterUpdate(tx *gorm.DB) error {
	return UpdateSeedFile()
}

func (t *Task) AfterDelete(tx *gorm.DB) error {
	return UpdateSeedFile()
}