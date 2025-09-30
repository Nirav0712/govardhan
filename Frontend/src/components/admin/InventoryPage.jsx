
import React, { useState, useEffect } from "react";
import { PlusCircle, Trash2, Edit2, Save, X } from "lucide-react";

const InventoryPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState({ 
    name: "", 
    kg: "",
    category: "Vegetables"
  });
  const [editingId, setEditingId] = useState(null);
  const [editItem, setEditItem] = useState({ 
    name: "", 
    kg: "",
    category: "Vegetables"
  });

  // Simulated fetch - replace with your actual API call
  useEffect(() => {
    // Check admin authentication
    const adminToken = localStorage.getItem('govardhanthal_admin_authenticated');
    const adminUser = localStorage.getItem('govardhanthal_admin_user');
    
    if (!adminToken || !adminUser) {
      alert('Please login as admin to access this page');
      // navigate('/admin/login');
      return;
    }
    
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      
      const adminToken = localStorage.getItem('govardhanthal_admin_authenticated');
      const headers = adminToken ? { Authorization: `Bearer ${adminToken}` } : {};

      const res = await fetch('https://www.govardhanthal.com/api/inventory', { headers });
      
      if (!res.ok) {
        throw new Error(`Inventory API failed: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();

      if (data.success) {
        setItems(data.data || []);
      } else {
        console.error('Inventory API error:', data.message);
        setItems([]);
      }
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      alert(`Failed to load inventory data: ${error.message}`);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));
  };


  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditItem((prev) => ({ ...prev, [name]: value }));
  };


  const handleAddItem = async () => {
    if (!newItem.name || !newItem.kg || !newItem.category) {
      alert("Please fill all required fields!");
      return;
    }

    try {
      const adminToken = localStorage.getItem('govardhanthal_admin_authenticated');
      
      // Create FormData for file upload (even though we don't have an image)
      const formData = new FormData();
      formData.append('name', newItem.name);
      formData.append('kg', newItem.kg);
      formData.append('category', newItem.category);
      
      // Create a dummy image file since backend requires it
      const dummyImage = new Blob(['dummy'], { type: 'image/png' });
      formData.append('img', dummyImage, 'dummy.png');

      const res = await fetch('https://www.govardhanthal.com/api/inventory', {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${adminToken}` 
        },
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        alert("Item added successfully!");
        setItems(prev => [...prev, data.data]);
        setNewItem({ name: "", kg: "", category: "Vegetables" });
      } else {
        alert(data.message || "Failed to add item");
        if (data.errors) {
          console.error('Validation errors:', data.errors);
        }
      }
    } catch (error) {
      console.error('Error adding item:', error);
      alert("Failed to add item");
    }
  };

  const handleUpdateItem = async (id) => {
    if (!editItem.name || !editItem.kg) {
      alert("Please fill all required fields!");
      return;
    }

    try {
      const adminToken = localStorage.getItem('govardhanthal_admin_authenticated');
      const res = await fetch(`https://www.govardhanthal.com/api/inventory/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}` 
        },
        body: JSON.stringify({
          name: editItem.name,
          kg: parseFloat(editItem.kg)
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Item updated successfully!");
        setItems(prev => prev.map(item => 
          item._id === id ? { ...item, name: editItem.name, kg: parseFloat(editItem.kg), category: editItem.category } : item
        ));
        setEditingId(null);
        setEditItem({ name: "", kg: "", category: "Vegetables" });
      } else {
        alert(data.message || "Failed to update item");
      }
    } catch (error) {
      console.error('Error updating item:', error);
      alert("Failed to update item");
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) {
      return;
    }

    try {
      const adminToken = localStorage.getItem('govardhanthal_admin_authenticated');
      const res = await fetch(`https://www.govardhanthal.com/api/inventory/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      const data = await res.json();

      if (data.success) {
        alert("Item deleted successfully!");
        setItems(prev => prev.filter(item => item._id !== id));
      } else {
        alert(data.message || "Failed to delete item");
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert("Failed to delete item");
    }
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setEditItem({ name: item.name, kg: item.kg.toString(), category: item.category || "Vegetables" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditItem({ name: "", kg: "", category: "Vegetables" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Inventory Management</h1>
        </div>

        {/* Add New Item Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Add New Item</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <input
              type="text"
              name="name"
              placeholder="Item Name"
              value={newItem.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            
            <select
              name="category"
              value={newItem.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="Vegetables">Vegetables</option>
              <option value="Spices">Spices</option>
              <option value="Grains">Grains</option>
              <option value="Dairy">Dairy</option>
              <option value="Meat">Meat</option>
              <option value="Beverages">Beverages</option>
              <option value="Other">Other</option>
            </select>

            <input
              type="number"
              name="kg"
              placeholder="KG Available"
              value={newItem.kg}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleAddItem}
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors"
          >
            <PlusCircle className="w-5 h-5" />
            Add Item
          </button>
        </div>

        {/* Inventory Items Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Inventory Items</h2>
          
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No items added yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Item Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">KG Available</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item._id} className="border-b border-gray-100 hover:bg-gray-50">
                      {editingId === item._id ? (
                        <>
                          <td className="py-4 px-4">
                            <input
                              type="text"
                              name="name"
                              value={editItem.name}
                              onChange={handleEditChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                          </td>
                          <td className="py-4 px-4">
                            <select
                              name="category"
                              value={editItem.category}
                              onChange={handleEditChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                              <option value="Vegetables">Vegetables</option>
                              <option value="Spices">Spices</option>
                              <option value="Grains">Grains</option>
                              <option value="Dairy">Dairy</option>
                              <option value="Meat">Meat</option>
                              <option value="Beverages">Beverages</option>
                              <option value="Other">Other</option>
                            </select>
                          </td>
                          <td className="py-4 px-4">
                            <input
                              type="number"
                              name="kg"
                              value={editItem.kg}
                              onChange={handleEditChange}
                              className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleUpdateItem(item._id)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Save"
                              >
                                <Save className="w-5 h-5" />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Cancel"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-4 px-4 font-medium text-gray-900">{item.name}</td>
                          <td className="py-4 px-4 text-gray-700">
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                              {item.category || 'Vegetables'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-700">{item.kg} kg</td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => startEdit(item)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item._id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;