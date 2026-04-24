import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import API, { ENDPOINTS } from './services/api';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [conditions, setConditions] = useState([]);
  const [avoidances, setAvoidances] = useState([]);
  const [medications, setMedications] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  const headers = useCallback((u) => ({
    Authorization: `Bearer ${(u || user)?.token}`
  }), [user]);

  const loadAllData = useCallback(async (u) => {
    if (!u?.token || !u?.userId) return;
    try {
      const [condRes, avoRes, medRes, savedRes] = await Promise.all([
        axios.get(ENDPOINTS.conditionsByUser(u.userId), { headers: { Authorization: `Bearer ${u.token}` } }).catch(() => ({ data: [] })),
        axios.get(ENDPOINTS.avoidancesByUser(u.userId), { headers: { Authorization: `Bearer ${u.token}` } }).catch(() => ({ data: [] })),
        axios.get(ENDPOINTS.medicationsByUser(u.userId), { headers: { Authorization: `Bearer ${u.token}` } }).catch(() => ({ data: [] })),
        axios.get(ENDPOINTS.savedItemsByUser(u.userId), { headers: { Authorization: `Bearer ${u.token}` } }).catch(() => ({ data: [] })),
      ]);
      setConditions(condRes.data || []);
      setAvoidances(avoRes.data || []);
      setMedications(medRes.data || []);
      setSavedItems(savedRes.data || []);
      setDataLoaded(true);
    } catch (err) {
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.token) {
          setUser(parsed);
          loadAllData(parsed);
        }
      } catch {}
    } else {
      setLoading(false);
    }
  }, [loadAllData]);

  // CONDITIONS
  const addCondition = useCallback(async (conditionName) => {
    if (!user) return null;
    const duplicate = conditions.find(c =>
      c.conditionName?.toLowerCase().trim() === conditionName.toLowerCase().trim()
    );
    if (duplicate) return { error: 'This condition has already been added.' };
    try {
      const res = await axios.post(ENDPOINTS.conditions,
        { conditionName, userId: user.userId },
        { headers: headers() }
      );
      setConditions(prev => [...prev, res.data]);
      return res.data;
    } catch (err) { return { error: 'Failed to add condition.' }; }
  }, [user, conditions, headers]);

  const removeCondition = useCallback(async (id) => {
    if (!user) return;
    try {
      await axios.delete(ENDPOINTS.conditionById(id), { headers: headers() });
      setConditions(prev => prev.filter(c => c.id !== id));
    } catch (err) { }
  }, [user, headers]);

  // AVOIDANCES
  const addAvoidance = useCallback(async (ingredientName) => {
    if (!user) return null;
    const duplicate = avoidances.find(a =>
      a.ingredientName?.toLowerCase().trim() === ingredientName.toLowerCase().trim()
    );
    if (duplicate) return { error: 'This ingredient is already in your avoidance list.' };
    try {
      const res = await axios.post(ENDPOINTS.avoidances,
        { ingredientName, userId: user.userId },
        { headers: headers() }
      );
      setAvoidances(prev => [...prev, res.data]);
      return res.data;
    } catch (err) { return { error: 'Failed to add avoidance.' }; }
  }, [user, avoidances, headers]);

  const removeAvoidance = useCallback(async (id) => {
    if (!user) return;
    try {
      await axios.delete(ENDPOINTS.avoidanceById(id), { headers: headers() });
      setAvoidances(prev => prev.filter(a => a.id !== id));
    } catch (err) { }
  }, [user, headers]);

  // MEDICATIONS
  const addMedication = useCallback(async (medicationName, dosage, frequency) => {
    if (!user) return null;
    const duplicate = medications.find(m =>
      m.medicationName?.toLowerCase().trim() === medicationName.toLowerCase().trim()
    );
    if (duplicate) return { error: 'This medication has already been added.' };
    try {
      const res = await axios.post(ENDPOINTS.medications,
        { medicationName, dosage, frequency, userId: user.userId },
        { headers: headers() }
      );
      setMedications(prev => [...prev, res.data]);
      return res.data;
    } catch (err) { return { error: 'Failed to add medication.' }; }
  }, [user, medications, headers]);

  const removeMedication = useCallback(async (id) => {
    if (!user) return;
    try {
      await axios.delete(ENDPOINTS.medicationById(id), { headers: headers() });
      setMedications(prev => prev.filter(m => m.id !== id));
    } catch (err) { }
  }, [user, headers]);

  // SAVED ITEMS
  const addSavedItem = useCallback(async (itemData) => {
    if (!user) return null;
    try {
      const res = await axios.post(ENDPOINTS.savedItems, itemData,
        { headers: headers() }
      );
      setSavedItems(prev => [...prev, res.data]);
      return res.data;
    } catch (err) { return { error: 'Failed to save item.' }; }
  }, [user, headers]);

  const removeSavedItem = useCallback(async (id) => {
    if (!user) return;
    try {
      await axios.delete(ENDPOINTS.savedItemById(id), { headers: headers() });
      setSavedItems(prev => prev.filter(s => s.id !== id));
    } catch (err) { }
  }, [user, headers]);

  // LOGIN / LOGOUT
  const login = useCallback((userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setDataLoaded(false);
    loadAllData(userData);
  }, [loadAllData]);

  const logout = useCallback(() => {
    localStorage.clear();
    setUser(null);
    setConditions([]);
    setAvoidances([]);
    setMedications([]);
    setSavedItems([]);
    setDataLoaded(false);
  }, []);

  const value = {
    user, setUser, login, logout,
    conditions, avoidances, medications, savedItems,
    addCondition, removeCondition,
    addAvoidance, removeAvoidance,
    addMedication, removeMedication,
    addSavedItem, removeSavedItem,
    loading, dataLoaded,
    refreshData: () => loadAllData(user),
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
}

export default UserContext;