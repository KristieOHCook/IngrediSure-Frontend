import React, { useState, useEffect } from 'react';
import axios from 'axios';

function MealList() {
    const [meals, setMeals] = useState([]);

    useEffect(() => {
        // This is the "bridge" to your Java backend on Port 8080
        axios.get('http://localhost:8080/api/menu/safe-meals')
            .then(response => {
                setMeals(response.data);
            })
            .catch(error => {
                console.error("Connection failed! Is IntelliJ running?", error);
            });
    }, []);

    return (
        <div style={{ padding: '40px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
            <h1 style={{ textAlign: 'center', color: '#1a365d' }}>IngrediSure Concierge</h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
                {meals.map(meal => (
                    <div key={meal.id} style={{ 
                        background: 'white', 
                        padding: '20px', 
                        borderRadius: '15px', 
                        width: '300px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                        <h2 style={{ color: '#2d3748' }}>{meal.itemName}</h2>
                        <h4 style={{ color: '#718096' }}>{meal.restaurantName}</h4>
                        <p style={{ color: '#38a169', fontWeight: 'bold' }}>Tip: {meal.modificationTip}</p>
                        <div style={{ marginTop: '10px' }}>
                            <label>Sodium: {meal.sodiumLevel}/10</label>
                            <div style={{ width: '100%', background: '#edf2f7', height: '10px', borderRadius: '5px' }}>
                                <div style={{ 
                                    width: `${meal.sodiumLevel * 10}%`, 
                                    background: '#e53e3e', 
                                    height: '100%',
                                    borderRadius: '5px'
                                }}></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MealList;