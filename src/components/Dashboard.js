import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SPOONACULAR_KEY = '3a1f1fbc2b194b5d89399cb97fbb303d';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('pantry');
  const [newIngredient, setNewIngredient] = useState('');
  const [customCondition, setCustomCondition] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [productResult, setProductResult] = useState(null);
  const [zipCode, setZipCode] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    // Safety: If no user in storage, kick back to login immediately
    if (!savedUser || !savedUser.username || savedUser.username === 'new') {
      localStorage.clear();
      navigate('/');
    } else {
      fetchUserData(savedUser.username);
    }
  }, [navigate]);

  const fetchUserData = async (username) => {
    try {
      const res = await axios.get(`http://localhost:8080/api/users/${username}`);
      setUser(res.data);
      if (username === 'admin') {
        const adminRes = await axios.get('http://localhost:8080/api/users/admin/all');
        setAllUsers(adminRes.data || []);
      }
    } catch (e) { 
      console.error("Sync error", e);
      // If backend says user doesn't exist, go to login
      navigate('/');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate('/');
  };

  // --- ACTIONS ---
  const handleAddCondition = async (cond) => {
    const val = cond || customCondition;
    // Safety Gate: Ensure user.username exists and isn't "new"
    if (!val || !user?.username || user.username === 'new') return;
    try {
      const res = await axios.post(`http://localhost:8080/api/users/${user.username}/conditions`, val, { headers: { 'Content-Type': 'text/plain' } });
      setUser(res.data);
      setCustomCondition('');
    } catch (e) { console.error(e); }
  };

  const handleManualAddIngredient = async () => {
    // Safety Gate: Check username before firing request
    if (!newIngredient || !user?.username || user.username === 'new') {
      console.error("User not fully loaded yet.");
      return;
    }
    try {
      const res = await axios.post(`http://localhost:8080/api/users/${user.username}/ingredients`, newIngredient, { headers: { 'Content-Type': 'text/plain' } });
      setUser(res.data);
      setNewIngredient('');
    } catch (e) { console.error(e); }
  };

  // --- PANTRY SEARCH ---
  const handleProductSearch = async () => {
    if (!productSearch) return;
    setAnalyzing(true);
    setProductResult(null);
    try {
      const res = await axios.get(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(productSearch)}&json=1`);
      if (res.data.products?.length > 0) {
        const p = res.data.products[0];
        const ingredients = (p.ingredients_text || "").toLowerCase();
        const redFlags = user.avoidIngredients.filter(ing => ingredients.includes(ing.toLowerCase().trim()));
        setProductResult({ name: p.product_name, redFlags: redFlags });
      }
    } catch (e) { console.error(e); }
    setAnalyzing(false);
  };

  // --- DINING SEARCH ---
  const handleRestaurantSearch = async () => {
    if (!zipCode) return;
    try {
      const res = await axios.get(`http://localhost:8080/api/users/restaurants/${zipCode}`);
      setRestaurants(res.data.businesses || []);
    } catch (e) { console.error(e); }
  };

  const analyzeRestaurant = async (restaurant) => {
    setAnalyzing(true);
    setSelectedMenu(null);
    try {
      let res = await axios.get(`https://api.spoonacular.com/food/menuItems/search?query=${encodeURIComponent(restaurant.name)}&apiKey=${SPOONACULAR_KEY}&number=5`);
      if (!res.data.menuItems || res.data.menuItems.length === 0) {
        const cuisine = restaurant.categories?.[0]?.title || "Food";
        res = await axios.get(`https://api.spoonacular.com/food/menuItems/search?query=${encodeURIComponent(cuisine)}&apiKey=${SPOONACULAR_KEY}&number=5`);
      }
      const analyzed = res.data.menuItems.map(item => {
        const content = item.title.toLowerCase();
        const flags = user.avoidIngredients.filter(i => content.includes(i.toLowerCase().trim()));
        return { name: item.title, isSafe: flags.length === 0, flags: flags };
      });
      setSelectedMenu({ name: restaurant.name, items: analyzed });
    } catch (e) { console.error(e); }
    setAnalyzing(false);
  };

  const saveToPantry = async (name) => {
    if (!user?.username) return;
    const res = await axios.post(`http://localhost:8080/api/users/${user.username}/pantry`, name, { headers: { 'Content-Type': 'text/plain' } });
    setUser(res.data);
  };

  if (loading || !user) return <div style={{textAlign:'center', marginTop:'100px', fontFamily:'Quicksand'}}>Initializing Secure Connection... 🔒</div>;

  return (
    <div style={{ backgroundColor: '#fcfaf9', minHeight: '100vh', fontFamily: "'Quicksand', sans-serif", padding: '20px' }}>
      
      {/* HEADER */}
      <nav style={{ maxWidth: '1200px', margin: '0 auto 40px auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '20px 50px', borderRadius: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          <img src="/logo.jpg" alt="Logo" style={{ height: '90px', borderRadius: '15px' }} />
          <div>
            <h2 style={{ color: '#a5a58d', margin: 0, fontWeight: 800, fontSize: '32px' }}>Ingredi<span style={{color: '#cb997e', fontWeight: 300 }}>Sure</span></h2>
            <p style={{ margin: 0, color: '#b7b7a4', fontSize: '14px' }}>Authenticated: <strong>{user.username}</strong></p>
          </div>
        </div>
        <button onClick={handleLogout} className="hover-btn" style={{ background: '#fdf3e7', color: '#cb997e', border: 'none', padding: '12px 30px', borderRadius: '25px', fontWeight: 'bold', cursor: 'pointer' }}>Logout</button>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '30px' }}>
        
        {/* SIDEBAR */}
        <div style={{ gridColumn: 'span 4' }}>
          <div className="card" style={{ background: 'white', padding: '30px', borderRadius: '40px', boxShadow: '0 15px 35px rgba(0,0,0,0.02)', marginBottom: '30px' }}>
            <h4 style={{ color: '#cb997e', marginTop: 0 }}>🏥 Health Profile</h4>
            <select onChange={(e) => { if(e.target.value) handleAddCondition(e.target.value); e.target.value=""; }} style={{ width: '100%', padding: '12px', borderRadius: '15px', border: '1px solid #eee', marginBottom: '10px' }}>
              <option value="">+ Quick Add...</option>
              <option value="Hypertension">Hypertension</option>
              <option value="Diabetes (Type 2)">Diabetes (Type 2)</option>
              <option value="Celiac Disease">Celiac Disease</option>
            </select>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
              <input value={customCondition} onChange={(e) => setCustomCondition(e.target.value)} placeholder="Type custom..." style={{ flex: 1, padding: '10px', borderRadius: '12px', border: '1px solid #eee' }} />
              <button onClick={() => handleAddCondition()} style={{ background: '#cb997e', color: 'white', border: 'none', borderRadius: '10px', padding: '0 15px', fontWeight: 'bold', cursor: 'pointer' }}>Add</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {user.healthConditions?.map((c, i) => (
                <div key={i} className="tooltip" style={{ background: '#cb997e', color: 'white', padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', cursor: 'help' }}>
                  {c}<span className="tooltiptext">Scanning for {c} red flags...</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ background: 'white', padding: '30px', borderRadius: '40px', boxShadow: '0 15px 35px rgba(0,0,0,0.02)', marginBottom: '30px' }}>
            <h4 style={{ color: '#a5a58d', marginTop: 0 }}>🚫 Avoidance List</h4>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
              <input value={newIngredient} onChange={(e) => setNewIngredient(e.target.value)} placeholder="Manual add..." style={{ flex: 1, padding: '10px', borderRadius: '12px', border: '1px solid #eee' }} />
              <button onClick={handleManualAddIngredient} style={{ background: '#a5a58d', color: 'white', border: 'none', borderRadius: '10px', padding: '0 15px', fontWeight: 'bold', cursor: 'pointer' }}>+</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {user.avoidIngredients?.map((ing, i) => <span key={i} style={{ background: '#f0f2ed', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>{ing}</span>)}
            </div>
          </div>

          <div className="card" style={{ background: 'white', padding: '30px', borderRadius: '40px', boxShadow: '0 15px 35px rgba(0,0,0,0.02)' }}>
            <h4 style={{ color: '#cb997e', marginTop: 0 }}>🥫 Safe Pantry</h4>
            {user.safePantry?.map((item, i) => <div key={i} style={{ padding: '12px', borderBottom: '1px solid #f9f9f9', fontSize: '13px', fontWeight: 600 }}>✨ {item}</div>)}
          </div>
        </div>

        {/* MAIN PANEL */}
        <div style={{ gridColumn: 'span 8', background: 'white', padding: '45px', borderRadius: '50px', boxShadow: '0 20px 50px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', gap: '40px', marginBottom: '40px', borderBottom: '2px solid #fcfaf9', paddingBottom: '15px' }}>
            <button onClick={() => {setActiveTab('pantry'); setProductResult(null);}} style={{ background: 'none', border: 'none', fontSize: '20px', fontWeight: activeTab === 'pantry' ? '800' : '400', color: activeTab === 'pantry' ? '#cb997e' : '#ccc', cursor: 'pointer' }}>Grocery Intel</button>
            <button onClick={() => {setActiveTab('dining'); setSelectedMenu(null);}} style={{ background: 'none', border: 'none', fontSize: '20px', fontWeight: activeTab === 'dining' ? '800' : '400', color: activeTab === 'dining' ? '#cb997e' : '#ccc', cursor: 'pointer' }}>Dining Safety</button>
            {user.username === 'admin' && <button onClick={() => setActiveTab('admin')} style={{ background: 'none', border: 'none', fontSize: '20px', fontWeight: activeTab === 'admin' ? '800' : '400', color: activeTab === 'admin' ? '#cb997e' : '#ccc', cursor: 'pointer' }}>Admin View</button>}
          </div>

          {activeTab === 'pantry' ? (
            <div>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
                <input value={productSearch} onChange={(e) => setProductSearch(e.target.value)} style={{ flex: 1, padding: '20px', borderRadius: '25px', border: '1px solid #eee' }} placeholder="Scan Product (e.g. Nutella)..." />
                <button onClick={handleProductSearch} style={{ background: '#cb997e', color: 'white', border: 'none', padding: '0 40px', borderRadius: '25px', fontWeight: 'bold', cursor:'pointer' }}>Analyze</button>
              </div>
              {analyzing && <p style={{textAlign:'center', color:'#cb997e'}}>Processing... 🔍</p>}
              {productResult && (
                <div style={{ padding: '30px', borderRadius: '35px', background: productResult.redFlags.length > 0 ? '#fff5f5' : '#f0fff4', border: '1px solid #eee' }}>
                  <h4 style={{ margin: 0 }}>{productResult.name}</h4>
                  {productResult.redFlags.length > 0 ? (
                    <p style={{ color: '#e53e3e', fontWeight: 'bold', marginTop: '15px' }}>⚠️ Flagged Ingredients: {productResult.redFlags.join(", ")}</p>
                  ) : (
                    <div>
                      <p style={{ color: '#2f855a', fontWeight: 'bold', marginTop: '15px' }}>✅ Safe for your profile!</p>
                      <button onClick={() => saveToPantry(productResult.name)} style={{ background: '#2f855a', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '15px', fontWeight: 'bold', cursor:'pointer' }}>Add to Safe Pantry</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : activeTab === 'dining' ? (
            <div>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
                <input value={zipCode} onChange={(e) => setZipCode(e.target.value)} placeholder="Zip Code..." style={{ flex: 1, padding: '20px', borderRadius: '25px', border: '1px solid #eee' }} />
                <button onClick={handleRestaurantSearch} style={{ padding: '20px 40px', borderRadius: '25px', background: '#a5a58d', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Search</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                {restaurants.map(r => (
                  <div key={r.id} onClick={() => analyzeRestaurant(r)} className="res-card" style={{ padding: '25px', borderRadius: '30px', border: '1px solid #f9f9f9', background: '#fcfaf9', cursor: 'pointer' }}>
                    <h4 style={{ margin: 0 }}>{r.name}</h4>
                    <p style={{ fontSize: '12px', color: '#b7b7a4' }}>{r.location?.address1}</p>
                  </div>
                ))}
              </div>
              {selectedMenu && (
                <div style={{ marginTop:'40px', padding:'35px', background:'#fff', borderRadius:'35px', border:'2px solid #fdf3e7' }}>
                  <h3 style={{marginTop:0, color:'#cb997e'}}>{selectedMenu.name} Analysis</h3>
                  {selectedMenu.items.map((item, idx) => (
                    <div key={idx} style={{ display:'flex', justifyContent:'space-between', alignItems: 'center', padding:'15px 0', borderBottom:'1px solid #eee' }}>
                      <span style={{fontWeight:600}}>{item.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{color: item.isSafe ? '#2f855a' : '#e53e3e', fontWeight:'bold'}}>{item.isSafe ? '✅ SAFE' : `⚠️ ${item.flags.join(", ")}`}</span>
                        {item.isSafe && <button onClick={() => saveToPantry(item.name)} style={{ background: '#2f855a', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '12px', cursor: 'pointer' }}>+ Pantry</button>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <h3>Admin View</h3>
              {allUsers.map((u, i) => <div key={i} style={{padding:'10px', borderBottom:'1px solid #eee'}}>{u.username} - Active</div>)}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .hover-btn:hover { opacity: 0.8; transform: translateY(-1px); transition: 0.2s; }
        .res-card:hover { border-color: #cb997e !important; box-shadow: 0 10px 20px rgba(0,0,0,0.05); transition: 0.3s; }
        .tooltip { position: relative; }
        .tooltip .tooltiptext {
          visibility: hidden; width: 140px; background-color: #555; color: #fff; text-align: center;
          border-radius: 6px; padding: 5px; position: absolute; z-index: 1; bottom: 125%; left: 50%;
          margin-left: -70px; opacity: 0; transition: opacity 0.3s; font-size: 10px;
        }
        .tooltip:hover .tooltiptext { visibility: visible; opacity: 1; }
      `}</style>
    </div>
  );
}

export default Dashboard;