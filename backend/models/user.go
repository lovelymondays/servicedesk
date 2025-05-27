package models

import (
	"errors"
	"log"
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// User represents a user in the system
type User struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Email     string    `json:"email" gorm:"uniqueIndex;not null"`
	Password  string    `json:"-" gorm:"not null"` // "-" means this field won't be included in JSON
	Role      string    `json:"role" gorm:"not null;default:'user'"`
	Tasks     []Task    `json:"tasks,omitempty" gorm:"foreignKey:UserID"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// UserLogin is used for login requests
type UserLogin struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// HashPassword creates a bcrypt hash of the password
func HashPassword(password string) (string, error) {
	if password == "" {
		return "", errors.New("password cannot be empty")
	}
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}

// CheckPasswordHash compares a password with a hash
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// SetPassword hashes and sets the user's password
func (u *User) SetPassword(password string) error {
	if password == "" {
		return errors.New("password cannot be empty")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	u.Password = string(hashedPassword)
	return nil
}

// CheckPassword verifies the provided password against the hashed password
func (u *User) CheckPassword(password string) error {
	if password == "" {
		return errors.New("password cannot be empty")
	}
	return bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
}

var ErrUserNotFound = errors.New("user not found")

// GetUserByID retrieves a user by their ID
func GetUserByID(id uint) (*User, error) {
	var user User
	err := DB.First(&user, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound 
		}
		return nil, err
	}
	return &user, nil
}

// GetUserByEmail (you likely have this too, good to be consistent)
func GetUserByEmail(email string) (*User, error) {
	var user User
	err := DB.Where("email = ?", email).First(&user).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound // Use your custom error here too
		}
		return nil, err
	}
	return &user, nil
}


// CreateUser creates a new user in the database
func CreateUser(email, password, role string) (*User, error) {
	// Hash the password before creating the user
	hashedPassword, err := HashPassword(password)
	if err != nil {
		log.Printf("Failed to hash password: %v", err)
		return nil, err
	}

	user := &User{
		Email:    email,
		Password: hashedPassword,
		Role:     role,
	}

	if err := DB.Create(user).Error; err != nil {
		log.Printf("Failed to create user in database: %v", err)
		return nil, err
	}

	return user, nil
}

// BeforeCreate is a GORM hook that runs before creating a new user
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.Role == "" {
		u.Role = "user"
	}
	return nil
}



