const API = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export default API;

export const ENDPOINTS = {
  // Auth
  login: `${API}/auth/login`,
  register: `${API}/auth/register`,

  // Conditions
  conditions: `${API}/conditions`,
  conditionsByUser: (userId) => `${API}/conditions/user/${userId}`,
  conditionById: (id) => `${API}/conditions/${id}`,

  // Avoidances
  avoidances: `${API}/avoidances`,
  avoidancesByUser: (userId) => `${API}/avoidances/user/${userId}`,
  avoidanceById: (id) => `${API}/avoidances/${id}`,

  // Medications
  medications: `${API}/medications`,
  medicationsByUser: (userId) => `${API}/medications/user/${userId}`,
  medicationById: (id) => `${API}/medications/${id}`,

  // Saved Items
  savedItems: `${API}/saved-items`,
  savedItemsByUser: (userId) => `${API}/saved-items/user/${userId}`,
  savedItemById: (id) => `${API}/saved-items/${id}`,

  // Users
  users: `${API}/users`,
  userById: (id) => `${API}/users/${id}`,

  // Feedback
  feedback: `${API}/feedback`,

  // Family
  familyMembers: `${API}/family-members`,
  familyMembersByUser: (userId) => `${API}/family-members/user/${userId}`,
  familyMemberById: (id) => `${API}/family-members/${id}`,

  // Grocery Lists
  groceryLists: `${API}/grocery-lists`,
  groceryListsByUser: (userId) => `${API}/grocery-lists/user/${userId}`,
  groceryListById: (id) => `${API}/grocery-lists/${id}`,

  // Nutrition
  nutritionLogs: `${API}/nutrition-logs`,
  nutritionLogsByUser: (userId) => `${API}/nutrition-logs/user/${userId}`,
};