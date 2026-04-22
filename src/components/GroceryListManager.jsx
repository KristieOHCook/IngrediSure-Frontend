import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Toast from './Toast';
import LoadingScreen from './LoadingScreen';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
const BG = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=90';

export default function GroceryListManager() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [parsedItems, setParsedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newListName, setNewListName] = useState('');
  const [newItem, setNewItem] = useState('');
  const [showNewList, setShowNewList] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { navigate('/'); return; }
    const parsed = JSON.parse(stored);
    if (!parsed?.token) { navigate('/'); return; }
    setUser(parsed);
    loadLists(parsed);
  }, [navigate]);

  const headers = (u) => ({ Authorization: `Bearer ${u.token}` });

  const loadLists = async (u) => {
    try {
      const res = await axios.get(
        `${API}/grocery-lists/user/${u.userId}`,
        { headers: headers(u) }
      );
      setLists(res.data || []);
    } catch (err) {
      console.error('Load error:', err);
    }
    setLoading(false);
  };

  const parseItems = (itemsStr) => {
    if (!itemsStr) return [];
    try {
      return JSON.parse(itemsStr);
    } catch {
      return itemsStr.split('\n').filter(Boolean).map((item, i) => ({
        id: i, name: item, checked: false, measure: ''
      }));
    }
  };

  const selectList = (list) => {
    setSelectedList(list);
    setParsedItems(parseItems(list.items));
  };

  const toggleItem = async (itemId) => {
    const updated = parsedItems.map(item =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    setParsedItems(updated);
    await saveItems(selectedList.id, updated);
  };

  const addItem = async () => {
    if (!newItem.trim()) return;
    const updated = [...parsedItems, {
      id: Date.now(),
      name: newItem.trim(),
      checked: false,
      measure: '',
    }];
    setParsedItems(updated);
    await saveItems(selectedList.id, updated);
    setNewItem('');
  };

  const removeItem = async (itemId) => {
    const updated = parsedItems.filter(item => item.id !== itemId);
    setParsedItems(updated);
    await saveItems(selectedList.id, updated);
  };

  const saveItems = async (listId, items) => {
    try {
      await axios.put(
        `${API}/grocery-lists/${listId}`,
        { items: JSON.stringify(items) },
        { headers: headers(user) }
      );
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const createNewList = async () => {
    if (!newListName.trim()) return;
    if (lists.some(l => l.listName.toLowerCase() === newListName.trim().toLowerCase())) {
      showToast('A list with this name already exists', 'error');
      return;
    }
    try {
      const res = await axios.post(`${API}/grocery-lists`, {
        listName: newListName.trim(),
        recipeName: '',
        items: JSON.stringify([]),
      }, { headers: headers(user) });
      setLists(prev => [res.data, ...prev]);
      setNewListName('');
      setShowNewList(false);
      showToast('List created! ✓', 'success');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Create error:', err);
    }
  };

  const deleteList = async (listId) => {
    try {
      await axios.delete(
        `${API}/grocery-lists/${listId}`,
        { headers: headers(user) }
      );
      setLists(prev => prev.filter(l => l.id !== listId));
      if (selectedList?.id === listId) {
        setSelectedList(null);
        setParsedItems([]);
      }
      showToast('List updated! ✓', 'success');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const renameList = async (listId, newName) => {
    try {
      await axios.put(
        `${API}/grocery-lists/${listId}`,
        { listName: newName },
        { headers: headers(user) }
      );
      setLists(prev => prev.map(l =>
        l.id === listId ? { ...l, listName: newName } : l
      ));
      if (selectedList?.id === listId) {
        setSelectedList(prev => ({ ...prev, listName: newName }));
      }
    } catch (err) {
      console.error('Rename error:', err);
    }
  };

  const checkedCount = parsedItems.filter(i => i.checked).length;

  const sectionStyle = {
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '4px', padding: '24px 28px',
    marginBottom: '16px',
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '4px', color: '#ffffff',
    fontFamily: 'Georgia, serif', fontSize: '14px',
    outline: 'none', boxSizing: 'border-box',
  };

  if (loading) return <LoadingScreen bg={BG} />;

  return (
    <div className="page-enter" style={{ minHeight: '100vh', fontFamily: 'Georgia, serif', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: `url(${BG})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'linear-gradient(135deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.65) 100%)' }} />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px', marginBottom: '6px' }}>INGREDISURE</div>
            <h1 style={{ margin: 0, fontSize: '36px', fontWeight: '400', color: '#ffffff', letterSpacing: '1px' }}>My Grocery Lists</h1>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => navigate('/recipes')}
              style={{ background: 'transparent', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.3)', padding: '10px 20px', borderRadius: '2px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '1px' }}
            >
              + FROM RECIPE
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.5)', padding: '10px 24px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '2px', fontWeight: '600' }}
            >
              ← DASHBOARD
            </button>
            <button
              onClick={() => navigate('/my-profile')}
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.5)', padding: '10px 24px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '2px', fontWeight: '600' }}
            >
              MY PROFILE
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div style={{ background: 'rgba(93,187,99,0.2)', border: '1px solid rgba(93,187,99,0.4)', borderRadius: '4px', padding: '12px 20px', marginBottom: '20px', color: '#7dd97f', fontSize: '13px', letterSpacing: '1px' }}>
            {message}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px' }}>

          {/* Left — List sidebar */}
          <div>
            {/* New list button */}
            {!showNewList ? (
              <button
                onClick={() => setShowNewList(true)}
                style={{ width: '100%', padding: '14px', background: 'rgba(232,196,154,0.15)', border: '1px solid rgba(232,196,154,0.4)', borderRadius: '4px', color: '#e8c49a', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '2px', marginBottom: '16px' }}
              >
                + NEW LIST
              </button>
            ) : (
              <div style={{ ...sectionStyle, marginBottom: '16px' }}>
                <input
                  type="text"
                  placeholder="List name..."
                  value={newListName}
                  onChange={e => setNewListName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && createNewList()}
                  style={{ ...inputStyle, marginBottom: '10px' }}
                  autoFocus
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={createNewList} style={{ flex: 1, padding: '10px', background: 'rgba(93,187,99,0.2)', border: '1px solid rgba(93,187,99,0.4)', borderRadius: '2px', color: '#7dd97f', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '11px', letterSpacing: '1px' }}>
                    CREATE
                  </button>
                  <button onClick={() => setShowNewList(false)} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '2px', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '11px' }}>
                    CANCEL
                  </button>
                </div>
              </div>
            )}

            {/* Lists */}
            {lists.length === 0 ? (
              <div style={{ ...sectionStyle, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', fontSize: '13px' }}>
                No lists yet. Create one or save from a recipe.
              </div>
            ) : (
              lists.map(list => (
                <div
                  key={list.id}
                  style={{
                    padding: '16px 18px',
                    background: selectedList?.id === list.id ? 'rgba(232,196,154,0.15)' : 'rgba(255,255,255,0.05)',
                    border: selectedList?.id === list.id ? '1px solid rgba(232,196,154,0.4)' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginBottom: '8px',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => selectList(list)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: selectedList?.id === list.id ? '#e8c49a' : '#ffffff', fontSize: '14px', marginBottom: '4px' }}>
                        {list.listName}
                      </div>
                      {list.recipeName && (
                        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', fontStyle: 'italic' }}>
                          {list.recipeName}
                        </div>
                      )}
                      <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', marginTop: '4px' }}>
                        {parseItems(list.items).length} items
                      </div>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); deleteList(list.id); }}
                      style={{ background: 'none', border: 'none', color: 'rgba(255,107,107,0.5)', cursor: 'pointer', fontSize: '16px', padding: '0 0 0 8px' }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right — List detail */}
          <div>
            {!selectedList ? (
              <div style={{ ...sectionStyle, textAlign: 'center', padding: '60px 32px', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>
                Select a list to view and edit it
              </div>
            ) : (
              <div style={sectionStyle}>
                {/* List header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <input
                      defaultValue={selectedList.listName}
                      onBlur={e => renameList(selectedList.id, e.target.value)}
                      style={{ background: 'transparent', border: 'none', color: '#ffffff', fontSize: '20px', fontFamily: 'Georgia, serif', outline: 'none', padding: 0, width: '100%' }}
                    />
                    {selectedList.recipeName && (
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontStyle: 'italic', marginTop: '4px' }}>
                        From: {selectedList.recipeName}
                      </div>
                    )}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', letterSpacing: '1px' }}>
                    {checkedCount}/{parsedItems.length} checked
                  </div>
                </div>

                {/* Progress bar */}
                {parsedItems.length > 0 && (
                  <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '2px', height: '4px', marginBottom: '20px' }}>
                    <div style={{ width: `${(checkedCount / parsedItems.length) * 100}%`, background: '#7dd97f', height: '100%', borderRadius: '2px', transition: 'width 0.3s' }} />
                  </div>
                )}

                {/* Add item */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  <input
                    type="text"
                    placeholder="Add an item..."
                    value={newItem}
                    onChange={e => setNewItem(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addItem()}
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <button
                    onClick={addItem}
                    style={{ padding: '12px 20px', background: 'rgba(93,187,99,0.2)', border: '1px solid rgba(93,187,99,0.4)', borderRadius: '4px', color: '#7dd97f', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '1px', whiteSpace: 'nowrap' }}
                  >
                    ADD
                  </button>
                </div>

                {/* Items */}
                {parsedItems.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', fontSize: '13px' }}>
                    No items yet. Add some above or save from a recipe.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {parsedItems.map(item => (
                      <div
                        key={item.id}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: item.checked ? 'rgba(93,187,99,0.08)' : 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px', transition: 'all 0.2s' }}
                      >
                        {/* Checkbox */}
                        <div
                          onClick={() => toggleItem(item.id)}
                          style={{ width: '20px', height: '20px', borderRadius: '2px', border: `1.5px solid ${item.checked ? '#7dd97f' : 'rgba(255,255,255,0.3)'}`, background: item.checked ? 'rgba(93,187,99,0.3)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, fontSize: '12px', color: '#7dd97f', transition: 'all 0.2s' }}
                        >
                          {item.checked ? '✓' : ''}
                        </div>

                        {/* Item name */}
                        <div style={{ flex: 1 }}>
                          <span style={{ color: item.checked ? 'rgba(255,255,255,0.3)' : '#ffffff', fontSize: '14px', textDecoration: item.checked ? 'line-through' : 'none', transition: 'all 0.2s' }}>
                            {item.name}
                          </span>
                          {item.measure && (
                            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginLeft: '8px', fontStyle: 'italic' }}>
                              {item.measure}
                            </span>
                          )}
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeItem(item.id)}
                          style={{ background: 'none', border: 'none', color: 'rgba(255,107,107,0.4)', cursor: 'pointer', fontSize: '18px', padding: 0, lineHeight: 1 }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Clear checked */}
                {checkedCount > 0 && (
                  <button
                    onClick={async () => {
                      const updated = parsedItems.filter(i => !i.checked);
                      setParsedItems(updated);
                      await saveItems(selectedList.id, updated);
                    }}
                    style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '11px', letterSpacing: '2px', marginTop: '16px' }}
                  >
                    REMOVE {checkedCount} CHECKED ITEM{checkedCount > 1 ? 'S' : ''}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}