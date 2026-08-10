import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, Upload, Calendar, ChevronDown, ChevronUp, PlusCircle, Trash, CheckCircle, Loader2, AlertCircle, Eye, EyeOff, Utensils, Home } from 'lucide-react';
import { deleteTrip, updateTrip, addTrip, uploadCompressedImage, subscribeToTrips, subscribeToCategories } from '../../firebase';

const isSaturday = (dateStr) => {
  if (!dateStr) return false;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return false;
  const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  return dateObj.getDay() === 6;
};

const AdminTrips = () => {
  const [trips, setTrips] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [newDateInput, setNewDateInput] = useState('');
  const [newTimeInput, setNewTimeInput] = useState('');
  const [newLocationInput, setNewLocationInput] = useState('');
  const [newCityInput, setNewCityInput] = useState('Chhatrapati Sambhajinagar');
  const [newCityCustom, setNewCityCustom] = useState('');
  const [newPriceInput, setNewPriceInput] = useState('');
  const [genCityInput, setGenCityInput] = useState('Chhatrapati Sambhajinagar');
  const [genCityCustom, setGenCityCustom] = useState('');
  const [genPriceInput, setGenPriceInput] = useState('');
  const [selectedDays, setSelectedDays] = useState([6, 0]); // Saturday & Sunday by default
  const [recurrenceWeeks, setRecurrenceWeeks] = useState(8); // 8 weeks (2 months) by default
  const [expandedSections, setExpandedSections] = useState(['basic']);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubTrips = subscribeToTrips((data) => {
      setTrips(data);
    });

    const unsubCategories = subscribeToCategories((data) => {
      setCategories(data);
      setLoading(false);
    });

    return () => {
      unsubTrips();
      unsubCategories();
    };
  }, []);

  const filteredTrips = trips.filter(t => {
    const matchesSearch = t.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const isHidden = t.status === 'hidden' || t.status === 'inactive' || t.hidden;
    const matchesVisibility = visibilityFilter === 'all' || 
      (visibilityFilter === 'visible' && !isHidden) || 
      (visibilityFilter === 'hidden' && isHidden);
    return matchesSearch && matchesVisibility;
  });

  const handleToggleVisibility = async (trip) => {
    const isCurrentlyHidden = trip.status === 'hidden' || trip.status === 'inactive' || trip.hidden;
    const newStatus = isCurrentlyHidden ? 'active' : 'hidden';
    try {
      await updateTrip(trip.id, { 
        status: newStatus,
        hidden: !isCurrentlyHidden
      });
    } catch (err) {
      setError('Failed to update trip visibility');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this trip?')) {
      try {
        await deleteTrip(id);
      } catch (err) {
        setError('Failed to delete trip');
      }
    }
  };

  const handleEdit = (trip) => {
    const deepCopy = JSON.parse(JSON.stringify(trip));
    if (!deepCopy.categoryId && (deepCopy.categoryName || deepCopy.category)) {
      const matchName = (deepCopy.categoryName || deepCopy.category).toLowerCase();
      const matchedCat = categories.find(c => (c.name || c.title || '').toLowerCase() === matchName);
      if (matchedCat) {
        deepCopy.categoryId = matchedCat.id;
      }
    }
    deepCopy.highlights = (deepCopy.highlights || []).join(', ');
    deepCopy.inclusions = (deepCopy.inclusions || []).join(', ');
    deepCopy.exclusions = (deepCopy.exclusions || []).join(', ');
    deepCopy.thingsToCarry = (deepCopy.thingsToCarry || []).join(', ');
    deepCopy.cancellationPolicy = (deepCopy.cancellationPolicy || []).join(', ');
    deepCopy.rules = (deepCopy.rules || []).join(', ');
    setEditingTrip(deepCopy);
    setNewDateInput('');
    setNewTimeInput('');
    setNewLocationInput('');
    setShowModal(true);
    setError(null);
  };

  const handleAddNew = () => {
    const firstCategory = categories[0] || {};
    const newTrip = {
      title: '',
      location: '',
      categoryId: firstCategory.id || '',
      categoryName: firstCategory.name || firstCategory.title || '',
      category: firstCategory.name || firstCategory.title || '',
      price: 0,
      nights: 0,
      days: 0,
      rating: 0,
      difficulty: 'Moderate',
      maxGroupSize: 15,
      minAge: 18,
      maxAltitude: '0m',
      status: 'active',
      featured: false,
      upcoming: false,
      images: [],
      description: '',
      highlights: '',
      inclusions: '',
      exclusions: '',
      itinerary: [],
      addons: [],
      availableDates: [],
      thingsToCarry: '',
      cancellationPolicy: '',
      rules: '',
      pickupLocations: []
    };
    setEditingTrip(newTrip);
    setNewDateInput('');
    setNewTimeInput('');
    setNewLocationInput('');
    setShowModal(true);
    setError(null);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await uploadCompressedImage(file, `trips/${Date.now()}_${file.name}`, 200);
      setEditingTrip(prev => ({ ...prev, images: [...(prev.images || []), url] }));
    } catch (err) {
      setError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = editingTrip.images.filter((_, i) => i !== index);
    setEditingTrip({ ...editingTrip, images: newImages });
  };

  const handleCategoryChange = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    const catName = category?.name || category?.title || categoryId;
    setEditingTrip(prev => ({ 
      ...prev, 
      categoryId,
      categoryName: catName,
      category: catName
    }));
  };

  const handleSave = async () => {
    if (!editingTrip.title) {
      setError('Trip title is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Find the selected category to get its name
      const selectedCategory = categories.find(c => c.id === editingTrip.categoryId);
      const catName = selectedCategory?.name || selectedCategory?.title || editingTrip.categoryName || editingTrip.category || editingTrip.categoryId || '';
      
      // Prepare trip data with categoryId, categoryName, and category
      const tripData = {
        ...editingTrip,
        featured: !!editingTrip.featured,
        upcoming: !!editingTrip.upcoming,
        days: Number(editingTrip.days) || (Number(editingTrip.nights) || 0) + 1,
        nights: Number(editingTrip.nights) || 0,
        highlights: typeof editingTrip.highlights === 'string'
          ? editingTrip.highlights.split(',').map(h => h.trim()).filter(Boolean)
          : (editingTrip.highlights || []),
        inclusions: typeof editingTrip.inclusions === 'string'
          ? editingTrip.inclusions.split(',').map(i => i.trim()).filter(Boolean)
          : (editingTrip.inclusions || []),
        exclusions: typeof editingTrip.exclusions === 'string'
          ? editingTrip.exclusions.split(',').map(e => e.trim()).filter(Boolean)
          : (editingTrip.exclusions || []),
        thingsToCarry: typeof editingTrip.thingsToCarry === 'string'
          ? editingTrip.thingsToCarry.split(',').map(t => t.trim()).filter(Boolean)
          : (editingTrip.thingsToCarry || []),
        cancellationPolicy: typeof editingTrip.cancellationPolicy === 'string'
          ? editingTrip.cancellationPolicy.split(',').map(c => c.trim()).filter(Boolean)
          : (editingTrip.cancellationPolicy || []),
        rules: typeof editingTrip.rules === 'string'
          ? editingTrip.rules.split(',').map(r => r.trim()).filter(Boolean)
          : (editingTrip.rules || []),
        categoryId: editingTrip.categoryId || selectedCategory?.id || '',
        categoryName: catName,
        category: catName
      };

      // Clean undefined fields to prevent Firestore errors
      Object.keys(tripData).forEach(key => {
        if (tripData[key] === undefined) {
          delete tripData[key];
        }
      });

      if (editingTrip.id) {
        await updateTrip(editingTrip.id, tripData);
      } else {
        await addTrip(tripData);
      }
      setShowModal(false);
    } catch (err) {
      setError('Failed to save trip. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setEditingTrip(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'nights') {
        const prevNights = prev.nights || 0;
        const prevDays = prev.days || 0;
        if (prevDays === 0 || prevDays === prevNights + 1) {
          updated.days = value + 1;
        }
      }
      return updated;
    });
  };

  const handleAddItem = (field, defaultValue = '') => {
    setEditingTrip(prev => ({ 
      ...prev, 
      [field]: [...(prev[field] || []), defaultValue] 
    }));
  };

  const handleItemChange = (field, index, value) => {
    const newItems = [...(editingTrip[field] || [])];
    newItems[index] = value;
    setEditingTrip({ ...editingTrip, [field]: newItems });
  };

  const handleRemoveItem = (field, index) => {
    const newItems = (editingTrip[field] || []).filter((_, i) => i !== index);
    setEditingTrip({ ...editingTrip, [field]: newItems });
  };

  const handleAddItinerary = () => {
    const currentItinerary = editingTrip.itinerary || [];
    const newDay = currentItinerary.length > 0 
      ? currentItinerary[currentItinerary.length - 1].day + 1 
      : 1;
    setEditingTrip({ 
      ...editingTrip, 
      itinerary: [...currentItinerary, { day: newDay, title: '', description: '', showMealIcon: true, meals: 'Breakfast & Veg/Non-Veg Meals as per itinerary plan' }] 
    });
  };

  const handleItineraryChange = (index, field, value) => {
    const newItinerary = [...(editingTrip.itinerary || [])];
    newItinerary[index] = { 
      ...newItinerary[index], 
      [field]: field === 'day' ? parseInt(value) || 1 : value 
    };
    setEditingTrip({ ...editingTrip, itinerary: newItinerary });
  };

  const handleRemoveItinerary = (index) => {
    const newItinerary = (editingTrip.itinerary || []).filter((_, i) => i !== index);
    setEditingTrip({ ...editingTrip, itinerary: newItinerary });
  };

  const handleAddAddon = () => {
    setEditingTrip({
      ...editingTrip,
      addons: [...(editingTrip.addons || []), { option: '', price: '' }]
    });
  };

  const handleAddonChange = (index, field, value) => {
    const newAddons = [...(editingTrip.addons || [])];
    newAddons[index] = { 
      ...newAddons[index], 
      [field]: field === 'price' ? parseInt(value) || 0 : value 
    };
    setEditingTrip({ ...editingTrip, addons: newAddons });
  };

  const handleRemoveAddon = (index) => {
    const newAddons = (editingTrip.addons || []).filter((_, i) => i !== index);
    setEditingTrip({ ...editingTrip, addons: newAddons });
  };

  // Pickup Location handlers
  const handleAddPickupLocation = () => {
    const newLocations = [...(editingTrip.pickupLocations || [])];
    newLocations.push({
      id: Date.now().toString(),
      location: '',
      date: '',
      time: '',
      address: ''
    });
    setEditingTrip({ ...editingTrip, pickupLocations: newLocations });
  };

  const handlePickupLocationChange = (index, field, value) => {
    const newLocations = [...(editingTrip.pickupLocations || [])];
    newLocations[index] = { ...newLocations[index], [field]: value };
    setEditingTrip({ ...editingTrip, pickupLocations: newLocations });
  };

  const handleRemovePickupLocation = (index) => {
    const newLocations = (editingTrip.pickupLocations || []).filter((_, i) => i !== index);
    setEditingTrip({ ...editingTrip, pickupLocations: newLocations });
  };

  // Available Departure Dates / Batches handlers
  const handleAddAvailableDate = (dateStr) => {
    if (!dateStr) return;
    setEditingTrip(prev => {
      const current = prev?.availableDates || [];
      if (current.includes(dateStr)) return prev;
      const updated = [...current, dateStr].sort();
      return { ...prev, availableDates: updated };
    });
  };

  const handleRemoveAvailableDate = (index) => {
    setEditingTrip(prev => {
      const updated = (prev?.availableDates || []).filter((_, i) => i !== index);
      return { ...prev, availableDates: updated };
    });
  };

  const handleGenerateRecurringDates = (daysOfWeek = [5], count = 4, city = 'Chhatrapati Sambhajinagar', customPrice = '') => {
    const resultDates = [];
    const newPickups = [];
    const today = new Date();
    const batchPrice = customPrice ? parseFloat(customPrice) : (editingTrip?.price || 0);
    const targetCity = city === 'CUSTOM_OTHER' ? (genCityCustom.trim() || 'Chhatrapati Sambhajinagar') : (city || 'Chhatrapati Sambhajinagar');
    
    let actualDays = [...daysOfWeek];
    if (actualDays.length > 0) {
      const order = [1, 2, 3, 4, 5, 6, 0]; // Mon, Tue, Wed, Thu, Fri, Sat, Sun
      actualDays.sort((a, b) => order.indexOf(a) - order.indexOf(b));
      actualDays = [actualDays[0]];
    }
    
    actualDays.forEach(dayOfWeek => {
      let d = new Date(today);
      d.setDate(d.getDate() + 1);
      while (d.getDay() !== dayOfWeek) {
        d.setDate(d.getDate() + 1);
      }
      for (let i = 0; i < count; i++) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        resultDates.push(dateStr);

        newPickups.push({
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          date: dateStr,
          city: targetCity,
          price: batchPrice,
          time: isSaturday(dateStr) ? '10:00 PM' : '6:00 AM',
          location: targetCity === 'Mumbai' ? 'Dadar / Borivali / Thane' : (targetCity === 'Pune' ? 'Wakad / Swargate' : (targetCity.includes('Sambhajinagar') ? 'Kranti Chowk / CIDCO / Baba Petrol Pump' : 'Departure Point')),
          address: ''
        });
        d.setDate(d.getDate() + 7);
      }
    });

    setEditingTrip(prev => {
      return { 
        ...prev, 
        availableDates: Array.from(new Set([...(prev?.availableDates || []), ...resultDates])).sort(),
        pickupLocations: [...(prev?.pickupLocations || []), ...newPickups]
      };
    });
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const difficultyColors = { 
    Easy: 'bg-green-50 text-green-700 border border-green-200', 
    Moderate: 'bg-yellow-50 text-yellow-700 border border-yellow-200', 
    Difficult: 'bg-red-50 text-red-700 border border-red-200', 
    Expert: 'bg-purple-50 text-purple-700 border border-purple-200' 
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-8">
      <div className="bg-white border-b border-gray-200 px-4 py-3 sm:px-6 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">Manage Trips</h1>
          <p className="text-gray-400 text-xs mt-0.5">{trips.length} trips total</p>
        </div>
        <button onClick={handleAddNew} className="bg-primary-500 hover:bg-primary-600 text-white py-1.5 px-3.5 rounded-lg text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5">
          <Plus size={15} /> Add New Trip
        </button>
      </div>

      <div className="p-3 sm:p-5">
        {error && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-xs">
            <AlertCircle size={16} />
            {error}
            <button onClick={() => setError(null)} className="ml-auto text-red-700 hover:text-red-900"><X size={16} /></button>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-3 border-b border-gray-200 bg-white flex flex-col sm:flex-row gap-2.5 sm:items-center sm:justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search trips..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-1.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" 
              />
            </div>
            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 cursor-pointer"
            >
              <option value="all">All Trips ({trips.length})</option>
              <option value="visible">Visible Only ({trips.filter(t => t.status !== 'hidden' && t.status !== 'inactive' && !t.hidden).length})</option>
              <option value="hidden">Hidden Only ({trips.filter(t => t.status === 'hidden' || t.status === 'inactive' || t.hidden).length})</option>
            </select>
          </div>

          <div className="overflow-x-auto min-w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80 text-[11px] font-bold uppercase text-gray-500 tracking-wider">
                  <th className="py-2.5 px-3 whitespace-nowrap">Trip</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Category</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Duration</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Price</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Difficulty</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Status</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Featured</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Upcoming</th>
                  <th className="py-2.5 px-3 whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTrips.map((trip) => {
                  const isHidden = trip.status === 'hidden' || trip.status === 'inactive' || trip.hidden;
                  return (
                    <tr key={trip.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <img src={trip.images?.[0]} alt={trip.title} className="w-12 h-9 rounded object-cover bg-gray-100 border border-gray-200 flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm font-semibold text-gray-900 truncate max-w-[180px] sm:max-w-[240px]">{trip.title}</div>
                            <div className="text-gray-400 text-[11px] truncate max-w-[160px]">{trip.location}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 bg-primary-50 text-primary-700 border border-primary-200 rounded text-[11px] font-semibold whitespace-nowrap">{trip.categoryName}</span>
                      </td>
                      <td className="py-2.5 px-3 text-xs text-gray-600 whitespace-nowrap">{trip.nights || 0}N/{trip.days || (trip.nights || 0) + 1}D</td>
                      <td className="py-2.5 px-3 text-xs text-gray-900 font-bold whitespace-nowrap">₹{trip.price?.toLocaleString()}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${difficultyColors[trip.difficulty]}`}>{trip.difficulty}</span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {isHidden ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
                            <EyeOff size={11} /> Hidden
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-green-50 text-green-700 border border-green-200 inline-flex items-center gap-1">
                            <Eye size={11} /> Visible
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {trip.featured ? (
                          <span className="px-2 py-0.5 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded text-[11px] font-semibold">⭐ Featured</span>
                        ) : (
                          <span className="text-gray-300 text-xs">-</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {trip.upcoming ? (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[11px] font-semibold">📅 Upcoming</span>
                        ) : (
                          <span className="text-gray-300 text-xs">-</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isHidden ? (
                            <button 
                              onClick={() => handleToggleVisibility(trip)} 
                              className="w-7 h-7 bg-green-50 rounded flex items-center justify-center text-green-700 hover:bg-green-100 border border-green-200 transition-colors" 
                              title="Show Trip on Website"
                            >
                              <Eye size={14} />
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleToggleVisibility(trip)} 
                              className="w-7 h-7 bg-amber-50 rounded flex items-center justify-center text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors" 
                              title="Hide Trip from Website"
                            >
                              <EyeOff size={14} />
                            </button>
                          )}
                          <button onClick={() => handleEdit(trip)} className="w-7 h-7 bg-primary-50 rounded flex items-center justify-center text-primary-600 hover:bg-primary-100 border border-primary-200 transition-colors" title="Edit">
                            <Edit size={14} />
                          </button>
                          <button onClick={() => handleDelete(trip.id)} className="w-7 h-7 bg-red-50 rounded flex items-center justify-center text-red-600 hover:bg-red-100 border border-red-200 transition-colors" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && editingTrip && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[92vh] overflow-hidden my-2 flex flex-col shadow-xl border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between flex-shrink-0 bg-white">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                {editingTrip.id ? 'Edit Trip' : 'Add New Trip'}
              </h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-3 sm:p-4 space-y-3 bg-gray-50/50">
              {/* Basic Information Section */}
              <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-2xs">
                <button type="button" onClick={() => toggleSection('basic')} className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-gray-50 transition-colors">
                  <span className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-6 h-6 bg-primary-500 rounded-md flex items-center justify-center text-white text-xs font-bold">1</span>
                    Basic Information
                  </span>
                  {expandedSections.includes('basic') ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                </button>
                
                {expandedSections.includes('basic') && (
                  <div className="p-3.5 pt-1 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="md:col-span-2">
                        <label className="block text-gray-700 font-semibold text-xs mb-1">Trip Title *</label>
                        <input 
                          type="text" 
                          value={editingTrip.title} 
                          onChange={(e) => handleFieldChange('title', e.target.value)}
                          placeholder="Enter trip title..."
                          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" 
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-gray-700 font-semibold text-xs mb-1">Description</label>
                        <textarea 
                          value={editingTrip.description || ''} 
                          onChange={(e) => handleFieldChange('description', e.target.value)}
                          rows={2}
                          placeholder="Enter description..."
                          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 resize-none focus:ring-1 focus:ring-primary-500" 
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 font-semibold text-xs mb-1">Location *</label>
                        <input 
                          type="text" 
                          value={editingTrip.location || ''} 
                          onChange={(e) => handleFieldChange('location', e.target.value)}
                          placeholder="e.g., Manali, HP"
                          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" 
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 font-semibold text-xs mb-1">Trip Category *</label>
                        <select 
                          value={editingTrip.categoryId} 
                          onChange={(e) => handleCategoryChange(e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                        >
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name || cat.title}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-700 font-semibold text-xs mb-1">Price (₹) *</label>
                        <input 
                          type="number" 
                          value={editingTrip.price || 0} 
                          onChange={(e) => handleFieldChange('price', parseInt(e.target.value) || 0)}
                          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" 
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 font-semibold text-xs mb-1">Rating (0-5)</label>
                        <input 
                          type="number" 
                          value={editingTrip.rating || 0} 
                          onChange={(e) => handleFieldChange('rating', parseFloat(e.target.value) || 0)}
                          step="0.1" 
                          min="0" 
                          max="5"
                          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" 
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 font-semibold text-xs mb-1">Duration (Nights)</label>
                        <input 
                          type="number" 
                          value={editingTrip.nights || 0} 
                          onChange={(e) => handleFieldChange('nights', parseInt(e.target.value) || 0)}
                          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" 
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 font-semibold text-xs mb-1">Duration (Days)</label>
                        <input 
                          type="number" 
                          value={editingTrip.days || (editingTrip.nights || 0) + 1} 
                          onChange={(e) => handleFieldChange('days', parseInt(e.target.value) || 0)}
                          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" 
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 font-semibold text-xs mb-1">Difficulty *</label>
                        <select 
                          value={editingTrip.difficulty || 'Moderate'} 
                          onChange={(e) => handleFieldChange('difficulty', e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                        >
                          <option value="Easy">Easy</option>
                          <option value="Moderate">Moderate</option>
                          <option value="Difficult">Difficult</option>
                          <option value="Expert">Expert</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-700 font-semibold text-xs mb-1">Max Group Size</label>
                        <input 
                          type="number" 
                          value={editingTrip.maxGroupSize || 15} 
                          onChange={(e) => handleFieldChange('maxGroupSize', parseInt(e.target.value) || 15)}
                          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" 
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 font-semibold text-xs mb-1">Website Visibility & Status</label>
                        <select 
                          value={editingTrip.status || 'active'} 
                          onChange={(e) => {
                            const val = e.target.value;
                            handleFieldChange('status', val);
                            handleFieldChange('hidden', val === 'hidden' || val === 'inactive');
                          }}
                          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                        >
                          <option value="active">Visible on Website (Active)</option>
                          <option value="hidden">Hidden from Website</option>
                          <option value="inactive">Inactive</option>
                          <option value="draft">Draft</option>
                        </select>
                      </div>

                      <div>
                        <label className="flex items-center gap-2 cursor-pointer mt-2">
                          <input 
                            type="checkbox" 
                            checked={editingTrip.featured || false}
                            onChange={(e) => handleFieldChange('featured', e.target.checked)}
                            className="w-4 h-4 bg-white border-gray-300 rounded text-primary-500 focus:ring-primary-500" 
                          />
                          <span className="text-gray-700 font-medium text-xs">Featured Trip</span>
                        </label>
                      </div>

                      <div>
                        <label className="flex items-center gap-2 cursor-pointer mt-2">
                          <input 
                            type="checkbox" 
                            checked={editingTrip.upcoming || false}
                            onChange={(e) => handleFieldChange('upcoming', e.target.checked)}
                            className="w-4 h-4 bg-white border-gray-300 rounded text-primary-500 focus:ring-primary-500" 
                          />
                          <span className="text-gray-700 font-medium text-xs">Upcoming Trip</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Images Section */}
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                <button type="button" onClick={() => toggleSection('images')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <span className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white text-sm">2</span>
                    Trip Images ({editingTrip.images?.length || 0})
                  </span>
                  {expandedSections.includes('images') ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
                </button>
                
                {expandedSections.includes('images') && (
                  <div className="p-6 pt-2 space-y-4">
                    <p className="text-gray-500 text-sm">Upload images (auto-compressed to 100-200KB)</p>
                    
                    {editingTrip.images?.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {editingTrip.images.map((url, index) => (
                          <div key={index} className="relative group">
                            <img src={url} alt={`Image ${index + 1}`} className="w-full h-32 object-cover rounded-xl bg-gray-100 border border-gray-200" />
                            <button type="button" onClick={() => handleRemoveImage(index)} className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <label className="flex items-center justify-center gap-3 py-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors">
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      {uploading ? (
                        <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-gray-400" />
                          <span className="text-gray-500 font-medium">Click to upload image</span>
                        </>
                      )}
                    </label>
                  </div>
                )}
              </div>

              {/* Highlights Section */}
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                <button type="button" onClick={() => toggleSection('highlights')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <span className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white text-sm">3</span>
                    Trip Highlights ({typeof editingTrip.highlights === 'string' ? editingTrip.highlights.split(',').map(h => h.trim()).filter(Boolean).length : (editingTrip.highlights || []).length})
                  </span>
                  {expandedSections.includes('highlights') ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
                </button>
                
                {expandedSections.includes('highlights') && (
                  <div className="p-6 pt-2 space-y-4">
                    <div className="flex gap-3 items-start">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-3" />
                      <textarea 
                        value={editingTrip.highlights || ''} 
                        onChange={(e) => handleFieldChange('highlights', e.target.value)}
                        placeholder="Enter highlights separated by commas (e.g. Kalu Waterfall Trek, Scenic views, Expert guides)..."
                        className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 resize-none focus:ring-1 focus:ring-primary-500" 
                        rows={3}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Inclusions Section */}
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                <button type="button" onClick={() => toggleSection('inclusions')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <span className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white text-sm">4</span>
                    Inclusions & Exclusions
                  </span>
                  {expandedSections.includes('inclusions') ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
                </button>
                
                {expandedSections.includes('inclusions') && (
                  <div className="p-6 pt-2 space-y-6">
                    <div>
                      <h4 className="text-green-700 font-bold mb-3 flex items-center gap-2">
                        <span>✓ What's Included</span>
                        <span className="text-xs font-normal text-gray-400">
                          ({typeof editingTrip.inclusions === 'string' ? editingTrip.inclusions.split(',').map(i => i.trim()).filter(Boolean).length : (editingTrip.inclusions || []).length})
                        </span>
                      </h4>
                      <div className="flex gap-3 items-start">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-3" />
                        <textarea 
                          value={editingTrip.inclusions || ''} 
                          onChange={(e) => handleFieldChange('inclusions', e.target.value)}
                          placeholder="Enter inclusions separated by commas (e.g. Accommodation, Meals, Guide, Permits)..."
                          className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 resize-none focus:ring-1 focus:ring-primary-500" 
                          rows={3}
                        />
                      </div>
                    </div>

                    <div>
                      <h4 className="text-red-700 font-bold mb-3 flex items-center gap-2">
                        <span>✗ Excluded</span>
                        <span className="text-xs font-normal text-gray-400">
                          ({typeof editingTrip.exclusions === 'string' ? editingTrip.exclusions.split(',').map(e => e.trim()).filter(Boolean).length : (editingTrip.exclusions || []).length})
                        </span>
                      </h4>
                      <div className="flex gap-3 items-start">
                        <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-3" />
                        <textarea 
                          value={editingTrip.exclusions || ''} 
                          onChange={(e) => handleFieldChange('exclusions', e.target.value)}
                          placeholder="Enter exclusions separated by commas (e.g. Travel insurance, Personal expenses, Mineral water)..."
                          className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 resize-none focus:ring-1 focus:ring-primary-500" 
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Add On Options Section */}
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                <button type="button" onClick={() => toggleSection('addons')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <span className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white text-sm">4b</span>
                    Add On Options ({(editingTrip.addons || []).length})
                  </span>
                  {expandedSections.includes('addons') ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
                </button>
                
                {expandedSections.includes('addons') && (
                  <div className="p-6 pt-2 space-y-3">
                    {(editingTrip.addons || []).map((addon, index) => (
                      <div key={index} className="flex flex-col sm:flex-row items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                        <input 
                          type="text" 
                          value={addon.option || addon.name || ''} 
                          onChange={(e) => handleAddonChange(index, 'option', e.target.value)} 
                          placeholder="Add on option name (e.g. Rooms at Kedarnath 4-5 Sharing)..."
                          className="flex-1 w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-primary-500" 
                        />
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <span className="text-xs font-bold text-gray-500">Rs.</span>
                          <input 
                            type="number" 
                            value={addon.price || ''} 
                            onChange={(e) => handleAddonChange(index, 'price', e.target.value)} 
                            placeholder="Price per person..."
                            className="w-32 bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-primary-500" 
                          />
                          <button 
                            type="button" 
                            onClick={() => handleRemoveAddon(index)} 
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={handleAddAddon} className="w-full py-2.5 border border-dashed border-gray-300 rounded-xl text-gray-600 hover:text-primary-600 hover:border-primary-500 transition-colors flex items-center justify-center gap-2 bg-white text-xs sm:text-sm font-bold">
                      <PlusCircle size={16} /> Add New Add On Option
                    </button>
                  </div>
                )}
              </div>

              {/* Itinerary Section */}
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                <button type="button" onClick={() => toggleSection('itinerary')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <span className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white text-sm">5</span>
                    Day-wise Itinerary ({(editingTrip.itinerary || []).length})
                  </span>
                  {expandedSections.includes('itinerary') ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
                </button>
                
                {expandedSections.includes('itinerary') && (
                  <div className="p-6 pt-2 space-y-4">
                    {(editingTrip.itinerary || []).map((day, index) => (
                      <div key={index} className="bg-white rounded-xl p-4 space-y-3 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                              <span className="text-white font-bold">D{day.day}</span>
                            </div>
                            <input 
                              type="number" 
                              value={day.day} 
                              onChange={(e) => handleItineraryChange(index, 'day', e.target.value)} 
                              min="1"
                              className="w-20 bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" 
                            />
                          </div>
                          <button type="button" onClick={() => handleRemoveItinerary(index)} className="w-10 h-10 bg-red-50 text-red-650 hover:bg-red-100 border border-red-200 text-red-650 transition-colors rounded-lg flex items-center justify-center">
                            <Trash size={18} className="text-red-600" />
                          </button>
                        </div>
                        <input 
                          type="text" 
                          value={day.title} 
                          onChange={(e) => handleItineraryChange(index, 'title', e.target.value)} 
                          placeholder="Day title..."
                          className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" 
                        />
                        <textarea 
                          value={day.description} 
                          onChange={(e) => handleItineraryChange(index, 'description', e.target.value)} 
                          rows={2} 
                          placeholder="Day description..."
                          className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 resize-none focus:ring-1 focus:ring-primary-500" 
                        />

                        {/* Meal Icon Show / Hide Toggle & Selection Options */}
                        <div className="pt-2.5 border-t border-gray-100 flex flex-col items-start gap-2.5 bg-teal-50/70 p-3 rounded-xl border border-teal-100">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-teal-900 select-none">
                            <input
                              type="checkbox"
                              checked={day.showMealIcon !== false}
                              onChange={(e) => handleItineraryChange(index, 'showMealIcon', e.target.checked)}
                              className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 border-gray-300 cursor-pointer"
                            />
                            <Utensils size={15} className="text-[#0d9488]" />
                            <span>Show Meal Included Icon for Day {day.day}</span>
                          </label>

                          {day.showMealIcon !== false && (
                            <div className="w-full space-y-2 pt-2 border-t border-teal-200/60">
                              {/* Meal Type Quick Select Pill Buttons */}
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[11px] font-bold text-teal-900">Select Included Meals:</span>
                                {[
                                  { key: 'Breakfast', label: '🍳 Breakfast' },
                                  { key: 'Lunch', label: '🍲 Lunch' },
                                  { key: 'Dinner', label: '🍽️ Dinner' },
                                  { key: 'Veg/Non-Veg Meals', label: '🥗 Veg/Non-Veg Meals' }
                                ].map((opt) => {
                                  const currentMeals = day.meals !== undefined ? day.meals : 'Breakfast & Veg/Non-Veg Meals as per itinerary plan';
                                  const isSelected = currentMeals.toLowerCase().includes(opt.key.toLowerCase());

                                  return (
                                    <button
                                      key={opt.key}
                                      type="button"
                                      onClick={() => {
                                        let selectedKeys = ['Breakfast', 'Lunch', 'Dinner', 'Veg/Non-Veg Meals'].filter(k => 
                                          k === opt.key ? !isSelected : currentMeals.toLowerCase().includes(k.toLowerCase())
                                        );

                                        let updatedMeals = '';
                                        if (selectedKeys.length === 0) {
                                          updatedMeals = 'Meals Included';
                                        } else if (selectedKeys.length === 1) {
                                          updatedMeals = `${selectedKeys[0]} Included`;
                                        } else {
                                          updatedMeals = `${selectedKeys.join(' & ')} as per itinerary plan`;
                                        }

                                        handleItineraryChange(index, 'meals', updatedMeals);
                                      }}
                                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                                        isSelected 
                                          ? 'bg-[#0d9488] text-white border-[#0d9488] shadow-sm' 
                                          : 'bg-white text-gray-700 border-gray-300 hover:bg-teal-50'
                                      }`}
                                    >
                                      {opt.label} {isSelected ? '✓' : ''}
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Editable Display Text Input */}
                              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 pt-1">
                                <span className="text-[11px] font-bold text-teal-900 flex-shrink-0">Display Text:</span>
                                <input
                                  type="text"
                                  value={day.meals !== undefined ? day.meals : 'Breakfast & Veg/Non-Veg Meals as per itinerary plan'}
                                  onChange={(e) => handleItineraryChange(index, 'meals', e.target.value)}
                                  placeholder="Meal details e.g. Breakfast & Veg/Non-Veg Meals..."
                                  className="w-full bg-white border border-teal-200 rounded-lg px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-teal-500 font-medium"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Accommodation Icon Show / Hide Toggle & Custom Details */}
                        <div className="pt-2.5 border-t border-gray-100 flex flex-col items-start gap-2.5 bg-teal-50/70 p-3 rounded-xl border border-teal-100 mt-2">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-teal-900 select-none">
                            <input
                              type="checkbox"
                              checked={day.showAccommodation === true}
                              onChange={(e) => handleItineraryChange(index, 'showAccommodation', e.target.checked)}
                              className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 border-gray-300 cursor-pointer"
                            />
                            <Home size={15} className="text-[#0d9488]" />
                            <span>Show Accommodation Included Icon for Day {day.day}</span>
                          </label>

                          {day.showAccommodation && (
                            <div className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-1.5 pt-1 border-t border-teal-200/60">
                              <span className="text-[11px] font-bold text-teal-900 flex-shrink-0">Accommodation Detail:</span>
                              <input
                                type="text"
                                value={day.accommodation || ''}
                                onChange={(e) => handleItineraryChange(index, 'accommodation', e.target.value)}
                                placeholder="e.g. Hotel in Hospet/Anegundi Side..."
                                className="w-full bg-white border border-teal-200 rounded-lg px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-teal-500 font-medium"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={handleAddItinerary} className="w-full py-3 border border-dashed border-gray-300 rounded-xl text-gray-500 hover:text-primary-600 hover:border-primary-500 transition-colors flex items-center justify-center gap-2 bg-white">
                      <PlusCircle size={18} /> Add Day
                    </button>
                  </div>
                )}
              </div>

              {/* Departure Dates / Batches Section */}
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                <button type="button" onClick={() => toggleSection('availableDates')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <span className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white text-sm">6</span>
                    Departure Dates / Batches ({(editingTrip.availableDates || []).length + (editingTrip.pickupLocations || []).filter(p => p.date).length})
                  </span>
                  {expandedSections.includes('availableDates') ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
                </button>
                
                {expandedSections.includes('availableDates') && (
                  <div className="p-6 pt-2 space-y-5">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-800 flex items-start gap-2.5">
                      <Calendar className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block mb-0.5">Multiple Departure Dates</span>
                        Add multiple batch dates for this trek without duplicating the trip. You can pick dates individually or use the generator below!
                      </div>
                    </div>

                    {/* Interactive Custom Batch Generator */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                        <span className="text-gray-900 font-bold text-xs flex items-center gap-1.5">
                          🛠️ Custom Recurring Batch Generator
                        </span>
                        <span className="text-[11px] text-primary-600 font-semibold">Pick Any Days & Duration</span>
                      </div>

                      {/* Day Selection Checkboxes */}
                      <div>
                        <span className="block text-gray-700 text-[11px] font-semibold mb-1.5">1. Select Days of the Week:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { label: 'Mon', val: 1 },
                            { label: 'Tue', val: 2 },
                            { label: 'Wed', val: 3 },
                            { label: 'Thu', val: 4 },
                            { label: 'Fri', val: 5 },
                            { label: 'Sat', val: 6 },
                            { label: 'Sun', val: 0 },
                          ].map(d => {
                            const isSelected = selectedDays.includes(d.val);
                            return (
                              <button
                                key={d.val}
                                type="button"
                                onClick={() => {
                                  setSelectedDays(prev =>
                                    isSelected ? prev.filter(v => v !== d.val) : [...prev, d.val]
                                  );
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                  isSelected
                                    ? 'bg-primary-600 text-white border-primary-600 shadow-2xs'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                                  }`}
                              >
                                {isSelected ? `✓ ${d.label}` : d.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* City, Price, Duration & Generate Button */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                        <div>
                          <span className="block text-gray-700 text-[11px] font-semibold mb-1">City for Batch:</span>
                          <select
                            value={genCityInput}
                            onChange={(e) => setGenCityInput(e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-primary-500"
                          >
                            <option value="Chhatrapati Sambhajinagar">Chhatrapati Sambhajinagar</option>
                            <option value="Ahilyanagar">Ahilyanagar</option>
                            <option value="Pune">Pune</option>
                            <option value="Mumbai">Mumbai</option>
                            <option value="Nashik">Nashik</option>
                            <option value="Base Camp / Self Travel">Base Camp / Self Travel</option>
                            <option value="CUSTOM_OTHER">+ Add Custom City...</option>
                          </select>
                          {genCityInput === 'CUSTOM_OTHER' && (
                            <input
                              type="text"
                              placeholder="Enter custom city..."
                              value={genCityCustom}
                              onChange={(e) => setGenCityCustom(e.target.value)}
                              className="mt-1.5 w-full bg-white border border-primary-400 rounded-lg px-2.5 py-1 text-xs text-gray-900 focus:outline-none"
                            />
                          )}
                        </div>
                        <div>
                          <span className="block text-gray-700 text-[11px] font-semibold mb-1">Price for City (₹):</span>
                          <input
                            type="number"
                            placeholder={`e.g. ${editingTrip?.price || 1699}`}
                            value={genPriceInput}
                            onChange={(e) => setGenPriceInput(e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <span className="block text-gray-700 text-[11px] font-semibold mb-1">Duration / Weeks:</span>
                          <select
                            value={recurrenceWeeks}
                            onChange={(e) => setRecurrenceWeeks(parseInt(e.target.value) || 4)}
                            className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-primary-500"
                          >
                            <option value={4}>4 Weeks (1 Month)</option>
                            <option value={8}>8 Weeks (2 Months)</option>
                            <option value={12}>12 Weeks (3 Months)</option>
                            <option value={24}>24 Weeks (6 Months)</option>
                            <option value={52}>52 Weeks (1 Year)</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          disabled={selectedDays.length === 0}
                          onClick={() => handleGenerateRecurringDates(selectedDays, recurrenceWeeks, genCityInput, genPriceInput)}
                          className="px-4 py-1.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                        >
                          ⚡ Generate {genCityInput === 'CUSTOM_OTHER' ? (genCityCustom || 'Custom') : genCityInput} Batches
                        </button>
                      </div>
                    </div>

                    {/* Add Custom Specific Date & City Batch */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 sm:p-4 space-y-3">
                      <span className="text-gray-900 font-bold text-xs block border-b border-gray-200 pb-2">
                        ➕ Add Custom Batch (Date, City, Price & Location)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
                        <div>
                          <label className="block text-gray-700 text-[11px] font-semibold mb-1">Select Date *</label>
                          <input
                            type="date"
                            value={newDateInput}
                            onChange={(e) => setNewDateInput(e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 text-[11px] font-semibold mb-1">Departure City *</label>
                          <select
                            value={newCityInput}
                            onChange={(e) => setNewCityInput(e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-primary-500 font-semibold"
                          >
                            <option value="Chhatrapati Sambhajinagar">Chhatrapati Sambhajinagar</option>
                            <option value="Ahilyanagar">Ahilyanagar</option>
                            <option value="Pune">Pune</option>
                            <option value="Mumbai">Mumbai</option>
                            <option value="Nashik">Nashik</option>
                            <option value="Base Camp / Self Travel">Base Camp / Self Travel</option>
                            <option value="CUSTOM_OTHER">+ Add Custom City...</option>
                          </select>
                          {newCityInput === 'CUSTOM_OTHER' && (
                            <input
                              type="text"
                              placeholder="Enter custom city..."
                              value={newCityCustom}
                              onChange={(e) => setNewCityCustom(e.target.value)}
                              className="mt-1.5 w-full bg-white border border-primary-400 rounded-lg px-2.5 py-1 text-xs text-gray-900 focus:outline-none"
                            />
                          )}
                        </div>
                        <div>
                          <label className="block text-gray-700 text-[11px] font-semibold mb-1">City Price (₹)</label>
                          <input
                            type="number"
                            placeholder={`₹${editingTrip?.price || 0}`}
                            value={newPriceInput}
                            onChange={(e) => setNewPriceInput(e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 text-[11px] font-semibold mb-1">Time</label>
                          <input
                            type="text"
                            placeholder="e.g. 10:00 PM"
                            value={newTimeInput}
                            onChange={(e) => setNewTimeInput(e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 text-[11px] font-semibold mb-1">Pickup Location</label>
                          <input
                            type="text"
                            placeholder="e.g. Kranti Chowk, CIDCO"
                            value={newLocationInput}
                            onChange={(e) => setNewLocationInput(e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-primary-500"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (newDateInput) {
                              const batchPrice = newPriceInput ? parseFloat(newPriceInput) : (editingTrip?.price || 0);
                              const targetCity = newCityInput === 'CUSTOM_OTHER' ? (newCityCustom.trim() || 'Chhatrapati Sambhajinagar') : newCityInput;
                              const newPickup = {
                                id: Date.now().toString(),
                                date: newDateInput,
                                city: targetCity || 'Chhatrapati Sambhajinagar',
                                price: batchPrice,
                                time: newTimeInput || (isSaturday(newDateInput) ? '10:00 PM' : '6:00 AM'),
                                location: newLocationInput || (targetCity === 'Mumbai' ? 'Dadar / Borivali' : (targetCity === 'Pune' ? 'Wakad / Swargate' : 'Departure Point')),
                                address: ''
                              };
                              setEditingTrip(prev => ({
                                ...prev,
                                availableDates: Array.from(new Set([...(prev.availableDates || []), newDateInput])).sort(),
                                pickupLocations: [...(prev.pickupLocations || []), newPickup]
                              }));
                              setNewDateInput('');
                              setNewTimeInput('');
                              setNewLocationInput('');
                              setNewPriceInput('');
                            }
                          }}
                          disabled={!newDateInput}
                          className="px-4 py-1.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                        >
                          <PlusCircle size={14} /> Add Batch
                        </button>
                      </div>
                    </div>

                    {/* List of Configured Batches */}
                    <div>
                      {(() => {
                        const pickups = (editingTrip.pickupLocations || []).filter(p => p.date);
                        const simpleDates = (editingTrip.availableDates || []).filter(d => !pickups.some(p => p.date === d));

                        const allConfiguredDates = [
                          ...pickups.map(p => ({
                            type: 'custom',
                            id: p.id,
                            date: p.date,
                            city: p.city && p.city !== 'Pune' ? p.city : 'Chhatrapati Sambhajinagar',
                            price: p.price ?? editingTrip.price,
                            time: p.time || (isSaturday(p.date) ? '10:00 PM' : '6:00 AM'),
                            location: p.location || 'Departure Point'
                          })),
                          ...simpleDates.map(d => ({
                            type: 'simple',
                            date: d,
                            city: 'Chhatrapati Sambhajinagar',
                            price: editingTrip.price,
                            time: isSaturday(d) ? '10:00 PM' : '6:00 AM',
                            location: 'Default Pickup'
                          }))
                        ].sort((a, b) => new Date(a.date) - new Date(b.date));

                        const totalCount = allConfiguredDates.length;

                        return (
                          <>
                            <label className="block text-gray-700 font-semibold text-xs mb-2">
                              Configured Departure Batches ({totalCount})
                            </label>
                            {totalCount === 0 ? (
                              <div className="text-center py-6 border border-dashed border-gray-200 rounded-xl bg-gray-50 text-gray-400 text-xs font-medium">
                                No departure dates/batches added yet. Pick a date above or use the generator!
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[240px] overflow-y-auto pr-1">
                                {allConfiguredDates.map((item, index) => {
                                  const dateObj = new Date(item.date);
                                  const formatted = !isNaN(dateObj.getTime())
                                    ? dateObj.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
                                    : item.date;
                                  return (
                                    <div
                                      key={item.id || index}
                                      className="flex items-center justify-between p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all group"
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <div className="w-7 h-7 rounded-md bg-white border border-gray-200 flex items-center justify-center text-primary-600 shadow-2xs flex-shrink-0 font-bold text-xs">
                                          {!isNaN(dateObj.getTime()) ? dateObj.getDate() : '📅'}
                                        </div>
                                        <div className="truncate min-w-0">
                                          <div className="flex items-center gap-1 flex-wrap">
                                            <span className="text-xs font-bold text-gray-800 truncate">{formatted}</span>
                                            <span className="px-1.5 py-0.2 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-bold">{item.city}</span>
                                            <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold">₹{item.price?.toLocaleString()}</span>
                                          </div>
                                          <span className="text-[10px] text-gray-500 font-medium block leading-none mt-0.5 truncate">{item.time} | {item.location}</span>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (item.type === 'simple') {
                                            setEditingTrip(prev => ({
                                              ...prev,
                                              availableDates: (prev.availableDates || []).filter(d => d !== item.date)
                                            }));
                                          } else {
                                            setEditingTrip(prev => ({
                                              ...prev,
                                              pickupLocations: (prev.pickupLocations || []).filter(p => p.id !== item.id)
                                            }));
                                          }
                                        }}
                                        className="w-6 h-6 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded flex items-center justify-center transition-colors flex-shrink-0 ml-1"
                                        title="Remove batch"
                                      >
                                        <Trash size={13} />
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Pickup Information Section */}
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                <button type="button" onClick={() => toggleSection('pickup')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <span className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white text-sm">7</span>
                    Pickup Locations ({(editingTrip.pickupLocations || []).length})
                  </span>
                  {expandedSections.includes('pickup') ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
                </button>
                
                {expandedSections.includes('pickup') && (
                  <div className="p-6 pt-2 space-y-4">
                    <p className="text-gray-500 text-sm">Add multiple pickup locations for this trip</p>
                    
                    {(editingTrip.pickupLocations || []).map((loc, index) => (
                      <div key={loc.id || index} className="bg-white rounded-xl p-4 space-y-3 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-primary-600 text-sm font-semibold">Location {index + 1}</span>
                          <button 
                            type="button" 
                            onClick={() => handleRemovePickupLocation(index)} 
                            className="w-8 h-8 bg-red-50 text-red-650 hover:bg-red-100 border border-red-200 text-red-650 transition-colors rounded-lg flex items-center justify-center"
                          >
                            <Trash size={16} className="text-red-600" />
                          </button>
                        </div>
                        
                        <div>
                          <label className="block text-gray-700 font-semibold text-xs mb-1.5">Location Name *</label>
                          <input 
                            type="text" 
                            value={loc.location || ''} 
                            onChange={(e) => handlePickupLocationChange(index, 'location', e.target.value)}
                            placeholder="e.g., Manali Bus Stand, ISBT Delhi"
                            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" 
                          />
                        </div>
                        
                        <div>
                          <label className="block text-gray-700 font-semibold text-xs mb-1.5">Full Address</label>
                          <input 
                            type="text" 
                            value={loc.address || ''} 
                            onChange={(e) => handlePickupLocationChange(index, 'address', e.target.value)}
                            placeholder="e.g., Near Main Market, Mall Road"
                            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" 
                          />
                        </div>
                      </div>
                    ))}
                    
                    <button 
                      type="button" 
                      onClick={handleAddPickupLocation} 
                      className="w-full py-3 border border-dashed border-primary-300 rounded-xl text-primary-600 hover:bg-primary-50 hover:border-primary-500 transition-colors flex items-center justify-center gap-2 bg-white font-semibold"
                    >
                      <PlusCircle size={18} /> Add Pickup Location
                    </button>
                  </div>
                )}
              </div>

              {/* Things to Carry Section */}
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                <button type="button" onClick={() => toggleSection('thingsToCarry')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <span className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white text-sm">8</span>
                    Things to Carry ({typeof editingTrip.thingsToCarry === 'string' ? editingTrip.thingsToCarry.split(',').map(t => t.trim()).filter(Boolean).length : (editingTrip.thingsToCarry || []).length})
                  </span>
                  {expandedSections.includes('thingsToCarry') ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
                </button>
                
                {expandedSections.includes('thingsToCarry') && (
                  <div className="p-6 pt-2 space-y-4">
                    <p className="text-gray-500 text-sm">Add items that trekkers should carry for this trip (separated by commas)</p>
                    <div className="flex gap-3 items-start">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-3" />
                      <textarea 
                        value={editingTrip.thingsToCarry || ''} 
                        onChange={(e) => handleFieldChange('thingsToCarry', e.target.value)}
                        placeholder="Enter items separated by commas (e.g. Trekking shoes, Water bottle, Raincoat, Torch)..."
                        className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 resize-none focus:ring-1 focus:ring-primary-500" 
                        rows={3}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Cancellation Policy Section */}
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                <button type="button" onClick={() => toggleSection('cancellationPolicy')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <span className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white text-sm">9</span>
                    Cancellation Policy ({typeof editingTrip.cancellationPolicy === 'string' ? editingTrip.cancellationPolicy.split(',').map(c => c.trim()).filter(Boolean).length : (editingTrip.cancellationPolicy || []).length})
                  </span>
                  {expandedSections.includes('cancellationPolicy') ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
                </button>
                
                {expandedSections.includes('cancellationPolicy') && (
                  <div className="p-6 pt-2 space-y-4">
                    <p className="text-gray-500 text-sm">Add cancellation policy rules for this trip (separated by commas)</p>
                    <div className="flex gap-3 items-start">
                      <X className="w-5 h-5 text-orange-600 flex-shrink-0 mt-3" />
                      <textarea 
                        value={editingTrip.cancellationPolicy || ''} 
                        onChange={(e) => handleFieldChange('cancellationPolicy', e.target.value)}
                        placeholder="Enter cancellation rules separated by commas (e.g. Free cancellation up to 7 days before, No refund within 24 hours)..."
                        className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 resize-none focus:ring-1 focus:ring-primary-500" 
                        rows={3}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Trip Rules Section */}
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                <button type="button" onClick={() => toggleSection('rules')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <span className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white text-sm">10</span>
                    Trip Rules ({typeof editingTrip.rules === 'string' ? editingTrip.rules.split(',').map(r => r.trim()).filter(Boolean).length : (editingTrip.rules || []).length})
                  </span>
                  {expandedSections.includes('rules') ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
                </button>
                
                {expandedSections.includes('rules') && (
                  <div className="p-6 pt-2 space-y-4">
                    <p className="text-gray-500 text-sm">Add rules and guidelines for this trip (separated by commas)</p>
                    <div className="flex gap-3 items-start">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-3" />
                      <textarea 
                        value={editingTrip.rules || ''} 
                        onChange={(e) => handleFieldChange('rules', e.target.value)}
                        placeholder="Enter trip rules separated by commas (e.g. No smoking during trek, Keep the environment clean, Follow guide instructions)..."
                        className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 resize-none focus:ring-1 focus:ring-primary-500" 
                        rows={3}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 px-4 py-3 border-t border-gray-200 bg-gray-50 flex-shrink-0 justify-end">
              <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 bg-white transition-colors text-xs font-semibold">
                Cancel
              </button>
              <button type="button" onClick={handleSave} disabled={saving} className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50">
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  editingTrip.id ? 'Save Changes' : 'Add Trip'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTrips;
