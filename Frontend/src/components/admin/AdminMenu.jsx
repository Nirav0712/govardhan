import React, { useState, useEffect } from "react";
import { Search, PlusCircle, X, Edit, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { useAppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

const Adminmenu = () => {
  const navigate = useNavigate();
  const {
    getMenuItems,
    getCategories,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
  } = useAppContext();

  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
  });
  const [file, setFile] = useState(null);
  const [previewImg, setPreviewImg] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Check admin authentication
  useEffect(() => {
    const adminToken = localStorage.getItem('govardhanthal_admin_authenticated');
    const adminUser = localStorage.getItem('govardhanthal_admin_user');
    
    if (!adminToken || !adminUser) {
      toast.error('Please login as admin to access this page');
      navigate('/admin/login');
      return;
    }
  }, [navigate]);

  // Default Categories
  const defaultCats = [
    "Welcome Drinks",
    "Milk Shake",
    "Raita",
    "Rice",
    "Thali",
    "Gujarati Sabzi",
    "Punjabi Sabzi",
    "South Indian",
    "Chinese",
    "Snacks",
    "Desserts",
  ];

  // Fetch Menu
  const fetchMenu = async () => {
    try {
      const result = await getMenuItems();
      if (result.success) {
        setMenuItems(result.data || []);
      } else {
        toast.error(result.message || "Failed to fetch menu");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch menu");
    }
  };

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const result = await getCategories();
      if (result.success) {
        const merged = [...new Set([...defaultCats, ...result.categories])];
        setCategories(merged);
      } else {
        setCategories(defaultCats);
      }
    } catch (err) {
      console.error(err);
      setCategories(defaultCats);
      toast.error("Failed to fetch categories, showing defaults");
    }
  };

  useEffect(() => {
    fetchMenu();
    fetchCategories();
  }, []);

  // Add/Edit
  const handleAddOrEditItem = async () => {
    if (!newItem.name || !newItem.price || !newItem.category) {
      toast.error("All fields required");
      return;
    }

    try {
      let result;
      if (editingItemId) {
        result = await updateMenuItem(editingItemId, newItem, file);
      } else {
        if (!file) {
          toast.error("Image required for new item");
          return;
        }
        result = await addMenuItem(newItem, file);
      }

      if (result.success) {
        toast.success(editingItemId ? "Item updated" : "Item added");
        fetchMenu();
        setIsModalOpen(false);
        setNewItem({ name: "", description: "", price: "", category: "" });
        setFile(null);
        setPreviewImg(null);
        setEditingItemId(null);
      } else {
        toast.error(result.message || "Server error");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      const result = await deleteMenuItem(id);
      if (result.success) {
        toast.success("Item deleted");
        fetchMenu();
      } else {
        toast.error(result.message || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  // Edit
  const handleEdit = (item) => {
    setEditingItemId(item._id);
    setNewItem({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
    });
    setPreviewImg(item.image || null); // ✅ Cloudinary URL
    setFile(null);
    setIsModalOpen(true);
  };

  // File Upload
  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.startsWith('image/')) {
        toast.error('Please select an image file');
        e.target.value = '';
        return;
      }
      
      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        e.target.value = '';
        return;
      }
      
      setFile(selectedFile);
      setPreviewImg(URL.createObjectURL(selectedFile));
      toast.success('Image selected successfully');
    }
  };

  const filteredItems = menuItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Menu Management</h1>
          <p className="text-gray-600">Manage restaurant menu items</p>
        </div>
        <button
          onClick={() => {
            setEditingItemId(null);
            setNewItem({ name: "", description: "", price: "", category: "" });
            setFile(null);
            setPreviewImg(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 rounded-lg bg-orange-600 text-white flex items-center gap-2 hover:bg-orange-700 transition-colors"
        >
          <PlusCircle className="h-5 w-5" /> Add Item
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4 relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search menu items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
        />
      </div>

      {/* Menu Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div key={item._id} className="bg-white rounded-xl shadow-sm">
            <img
              src={
                item.image
                  ? item.image // ✅ Cloudinary URL directly
                  : "https://via.placeholder.com/300x200?text=No+Image"
              }
              alt={item.name}
              className="h-40 w-full object-cover rounded-t-lg"
              onError={(e) =>
                (e.target.src =
                  "https://via.placeholder.com/300x200?text=No+Image")
              }
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold">{item.name}</h3>
              <p className="text-sm text-gray-600">{item.description}</p>
              <p className="text-sm text-gray-500">{item.category}</p>
              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-bold text-orange-600">
                  ${Number(item.price).toFixed(2)}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="px-3 py-1 text-sm border rounded-lg flex items-center gap-1 hover:bg-gray-100"
                  >
                    <Edit className="h-4 w-4" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="px-3 py-1 text-sm border rounded-lg flex items-center gap-1 hover:bg-red-50 text-red-600"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-11/12 max-w-md p-6 relative">
            <button
              className="absolute top-4 right-4"
              onClick={() => setIsModalOpen(false)}
            >
              <X className="h-6 w-6 text-gray-600 hover:text-gray-800" />
            </button>
            <h2 className="text-xl font-bold mb-4">
              {editingItemId ? "Edit Item" : "Add Item"}
            </h2>
            <div className="space-y-3">
              <select
                value={newItem.category}
                onChange={(e) =>
                  setNewItem({ ...newItem, category: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Select Category</option>
                {categories.map((cat, i) => (
                  <option key={i} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Name"
                value={newItem.name}
                onChange={(e) =>
                  setNewItem({ ...newItem, name: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Description"
                value={newItem.description}
                onChange={(e) =>
                  setNewItem({ ...newItem, description: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg"
              />
              <input
                type="number"
                placeholder="Price (in USD)"
                value={newItem.price}
                onChange={(e) =>
                  setNewItem({ ...newItem, price: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg"
              />

              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Upload Image</label>
                
                {/* File Input Section */}
                <div className="flex items-center gap-3">
                  <input 
                    type="file" 
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                    id="image-upload"
                  />
                  <label 
                    htmlFor="image-upload"
                    className="px-4 py-2 bg-orange-100 text-orange-700 border border-orange-300 rounded-lg cursor-pointer hover:bg-orange-200 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Choose File
                  </label>
                  
                  {/* Selected File Display */}
                  <div className="flex-1 min-w-0">
                    {file ? (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm font-medium text-green-700 truncate" title={file.name}>
                            {file.name}
                          </span>
                          <button
                            onClick={() => {
                              setFile(null);
                              setPreviewImg(null);
                              document.getElementById('image-upload').value = '';
                            }}
                            className="text-red-500 hover:text-red-700 ml-auto flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="text-xs text-green-600 ml-6">
                          {file.type} • {(file.size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <span className="text-sm text-gray-500">No file chosen</span>
                        </div>
                        <div className="text-xs text-gray-400 ml-6 mt-1">
                          Click "Choose File" to select an image
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* File Preview Section */}
                {previewImg && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Image Preview</label>
                    <div className="relative">
                      <img
                        src={previewImg}
                        alt="preview"
                        className="w-full h-32 object-cover border border-gray-200 rounded-lg"
                      />
                      <button
                        onClick={() => {
                          setFile(null);
                          setPreviewImg(null);
                          document.getElementById('image-upload').value = '';
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        title="Remove image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleAddOrEditItem}
                className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                {editingItemId ? "Update Item" : "Add Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Adminmenu;
