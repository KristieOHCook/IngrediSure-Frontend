import React from 'react';
import InstallPrompt from './components/InstallPrompt';
import AccessibilityWidget from './components/AccessibilityWidget';
import LegalDisclaimers from './components/LegalDisclaimers';
import { AccessibilityProvider } from './AccessibilityContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ForgotPassword from './components/ForgotPassword';
import HealthProfile from './components/HealthProfile';
import GroceryScanner from './components/GroceryScanner';
import RestaurantFinder from './components/RestaurantFinder';
import AdminDashboard from './components/AdminDashboard';
import Feedback from './components/Feedback';
import BarcodeScanner from './components/BarcodeScanner';
import SavedList from './components/SavedList';
import RecipeSuggestions from './components/RecipeSuggestions';
import GroceryListManager from './components/GroceryListManager';
import MealPlanner from './components/MealPlanner';
import MealPrepServices from './components/MealPrepServices';
import NutritionTracker from './components/NutritionTracker';
import FamilyHub from './components/FamilyHub';
import MyProfile from './components/MyProfile';

function App() {
  return (
    <AccessibilityProvider>
    <Router>
      <InstallPrompt />
      <AccessibilityWidget />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<HealthProfile />} />
        <Route path="/my-profile" element={<MyProfile />} />
        <Route path="/grocery" element={<GroceryScanner />} />
        <Route path="/restaurant" element={<RestaurantFinder />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/legal" element={<LegalDisclaimers />} />
        <Route path="/barcode" element={<BarcodeScanner />} />
        <Route path="/saved" element={<SavedList />} />
        <Route path="/recipes" element={<RecipeSuggestions />} />
        <Route path="/grocery-lists" element={<GroceryListManager />} />
        <Route path="/meal-planner" element={<MealPlanner />} />
        <Route path="/meal-prep" element={<MealPrepServices />} />
        <Route path="/nutrition" element={<NutritionTracker />} />
        <Route path="/family" element={<FamilyHub />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  </AccessibilityProvider>
  );
}

export default App;