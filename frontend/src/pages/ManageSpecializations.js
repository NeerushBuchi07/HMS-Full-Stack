import React, { useEffect, useState } from 'react';
import api from '../services/api';

const ManageSpecializations = () => {
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');

  const fetchItems = async () => {
    try { const res = await api.get('/specializations'); setItems(res.data.data.specializations); } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchItems(); }, []);

  const add = async () => { try { await api.post('/specializations', { name }); setName(''); fetchItems(); } catch (err) { console.error(err); alert('Error adding'); } };
  const del = async (id) => { if (!confirm('Delete?')) return; try { await api.delete(`/specializations/${id}`); fetchItems(); } catch (err) { console.error(err); alert('Error deleting'); } };

  return (
    <div className="container admin-dashboard">
      <h2>Specializations</h2>
      <div className="card-compact">
        <div className="form-group"><label>New Specialization</label><input className="form-control" value={name} onChange={e=>setName(e.target.value)} /><button className="btn" onClick={add}>Add</button></div>
        <ul>
          {items.map(i => <li key={i._id}>{i.name} <button className="action-btn delete" onClick={()=>del(i._id)}>Delete</button></li>)}
        </ul>
      </div>
    </div>
  );
};

export default ManageSpecializations;
