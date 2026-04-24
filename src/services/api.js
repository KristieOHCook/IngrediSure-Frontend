// ============================================================
// INGREDISURE — Centralized API Service
// services/api.js — Single Source of Truth for All Endpoints
//
// HIGHLIGHT: This file solves a critical maintainability problem
//
// BEFORE: API URLs were hardcoded in 12+ different component files
//   - http://localhost:8080/api/conditions in Dashboard.jsx
//   - http://localhost:8080/api/conditions in MyProfile.jsx
//   - http://localhost:8080/api/conditions in HealthProfile.jsx
//   - If the URL changed we had to find and fix it everywhere
//   - Missing even one would cause silent bugs in production
//
// AFTER: Every URL defined exactly once in this file
//   - Change the base URL here and it updates everywhere instantly
//   - New endpoints added in one place — immediately available to all
//   - No risk of typos creating inconsistent URLs across components
//
// PRINCIPLE: Single Responsibility — one file owns all API config
// This is how professional production APIs are managed at scale
// ============================================================

// ============================================================
// HIGHLIGHT: API base URL comes from environment variable
// In development: http://localhost:8080/api
// In production on AWS: the environment variable overrides this
// This is how the same codebase works in both environments
// No code changes needed when deploying — just change the env var
// ============================================================
const API = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export default API;

// ============================================================
// HIGHLIGHT: ENDPOINTS object — every backend route in one place
// Functions accept parameters for dynamic routes like user IDs
// Arrow functions generate the correct URL at call time
//
// Usage example in any component:
//   import { ENDPOINTS } from '../services/api';
//   axios.get(ENDPOINTS.conditionsByUser(userId))
//   axios.delete(ENDPOINTS.conditionById(id))
//
// Before this file existed every component had to build
// these URLs manually — error prone and hard to maintain
// ============================================================
export const ENDPOINTS = {

  // -------------------------------------------------------
  // HIGHLIGHT: Authentication endpoints
  // POST to login returns a JWT token used for all other calls
  // POST to register creates a new user account
  // -------------------------------------------------------
  login: `${API}/auth/login`,
  register: `${API}/auth/register`,

  // -------------------------------------------------------
  // HIGHLIGHT: Conditions endpoints
  // conditionsByUser() generates user-specific URL dynamically
  // conditionById() generates item-specific URL for delete operations
  // -------------------------------------------------------
  conditions: `${API}/conditions`,
  conditionsByUser: (userId) => `${API}/conditions/user/${userId}`,
  conditionById: (id) => `${API}/conditions/${id}`,

  // -------------------------------------------------------
  // HIGHLIGHT: Avoidances endpoints
  // Same pattern as conditions — consistent API design
  // Avoidances are applied across ALL scanners automatically
  // -------------------------------------------------------
  avoidances: `${API}/avoidances`,
  avoidancesByUser: (userId) => `${API}/avoidances/user/${userId}`,
  avoidanceById: (id) => `${API}/avoidances/${id}`,

  // -------------------------------------------------------
  // HIGHLIGHT: Medications endpoints
  // Medications are cross-referenced against food interactions
  // in constants/medications.js — no additional API call needed
  // -------------------------------------------------------
  medications: `${API}/medications`,
  medicationsByUser: (userId) => `${API}/medications/user/${userId}`,
  medicationById: (id) => `${API}/medications/${id}`,

  // -------------------------------------------------------
  // HIGHLIGHT: Saved Items endpoints
  // One endpoint handles ALL scan types — Grocery, Restaurant,
  // Recipe and Barcode — differentiated by the itemSource field
  // This keeps the API simple while supporting multiple scan types
  // -------------------------------------------------------
  savedItems: `${API}/saved-items`,
  savedItemsByUser: (userId) => `${API}/saved-items/user/${userId}`,
  savedItemById: (id) => `${API}/saved-items/${id}`,

  // -------------------------------------------------------
  // HIGHLIGHT: User management endpoints
  // Used by the Admin Dashboard to manage all registered users
  // Admin-only access enforced by JWT role checking in the backend
  // -------------------------------------------------------
  users: `${API}/users`,
  userById: (id) => `${API}/users/${id}`,

  // -------------------------------------------------------
  // HIGHLIGHT: Feedback endpoints
  // Survey responses stored here — viewable only by admins
  // Used to populate the Analytics dashboard feedback sentiment
  // -------------------------------------------------------
  feedback: `${API}/feedback`,

  // -------------------------------------------------------
  // HIGHLIGHT: Family Hub endpoints
  // Each family member has their own health profile
  // Safety checks run against each member's specific conditions
  // -------------------------------------------------------
  familyMembers: `${API}/family-members`,
  familyMembersByUser: (userId) => `${API}/family-members/user/${userId}`,
  familyMemberById: (id) => `${API}/family-members/${id}`,

  // -------------------------------------------------------
  // HIGHLIGHT: Grocery List endpoints
  // Lists can be populated from Recipe Suggestions and Meal Planner
  // Demonstrates cross-feature data flow in the application
  // -------------------------------------------------------
  groceryLists: `${API}/grocery-lists`,
  groceryListsByUser: (userId) => `${API}/grocery-lists/user/${userId}`,
  groceryListById: (id) => `${API}/grocery-lists/${id}`,

  // -------------------------------------------------------
  // HIGHLIGHT: Nutrition Log endpoints
  // Daily meal logging tracked against personal calorie goals
  // Macros calculated — protein, carbs, fat, sodium, fiber
  // -------------------------------------------------------
  nutritionLogs: `${API}/nutrition-logs`,
  nutritionLogsByUser: (userId) => `${API}/nutrition-logs/user/${userId}`,
};