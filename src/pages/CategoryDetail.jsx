import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, ArrowRight, Mountain, ChevronRight } from 'lucide-react';
import TripCard from '../components/TripCard';
import { useCachedTrips, useCachedCategories } from '../firebaseCache';

const CategoryDetail = () => {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    let currentCat = null;
    const unsubscribeCat = useCachedCategories((categories) => {
      const found = categories.find(c => c.id === id || c.name === id || c.title === id);
      if (found) {
        setCategory(found);
        currentCat = found;
      }
    });

    const unsubscribeTrips = useCachedTrips((allTrips) => {
      const catName = (currentCat?.title || currentCat?.name || '').toLowerCase();
      const matched = allTrips.filter(trip => {
        if (trip.categoryId === id) return true;
        if (currentCat && trip.categoryId === currentCat.id) return true;
        if (catName && (trip.categoryName || '').toLowerCase() === catName) return true;
        if (catName && (trip.category || '').toLowerCase() === catName) return true;
        return false;
      });
      setTrips(matched);
      setLoading(false);
    });

    return () => { unsubscribeCat(); unsubscribeTrips(); };
  }, [id]);

  const filteredTrips = trips.sort((a, b) => {
      if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#F5B301] animate-spin" />
      </div>
    );
  }

  const categoryName = category?.name || category?.title || 'Category';
  const categoryTitle = category?.title || '';
  const headerImage = category?.image || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=2070&q=80';
  const featuredCount = filteredTrips.filter(t => t.featured).length;

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      {/* Hero Banner with exact 16:9 Aspect Ratio */}
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden bg-black flex flex-col justify-between">
        {/* Header Image */}
        <img src={headerImage} alt={categoryName} className="absolute inset-0 w-full h-full object-cover object-top opacity-90" loading="lazy" />
        
        {/* Rich Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/25" />

        {/* Top Bar: Breadcrumbs (Left) & Stats Badge (Desktop Only) */}
        <div className="relative z-20 w-full max-w-[2400px] mx-auto px-4 sm:px-8 xl:px-12 flex items-center justify-between pt-16 sm:pt-20">
          <nav className="hidden sm:flex items-center gap-1.5 text-[11px] sm:text-xs text-white/90 font-medium bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/15 shadow-sm">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link to="/trips" className="hover:text-white transition-colors">Trips</Link>
            <ChevronRight size={12} />
            <span className="text-[#F5B301] font-bold truncate max-w-[120px] sm:max-w-none">{categoryName}</span>
          </nav>

          {/* Top Right Stats Badge - Hidden on mobile to keep layout clean */}
          <div className="hidden md:flex items-center gap-2.5 bg-black/60 backdrop-blur-md rounded-xl px-3.5 py-1.5 border border-white/20 shadow-lg">
            <div className="text-center">
              <span className="text-xs sm:text-sm font-black text-white">{filteredTrips.length}</span>
              <span className="text-[10px] text-white/70 uppercase font-bold tracking-wider ml-1">Trips</span>
            </div>
            <div className="w-px h-3.5 bg-white/30" />
            <div className="text-center">
              <span className="text-xs sm:text-sm font-black text-[#F5B301]">{featuredCount}</span>
              <span className="text-[10px] text-white/70 uppercase font-bold tracking-wider ml-1">Featured</span>
            </div>
          </div>
        </div>

        {/* Bottom Content: Clean & minimal on mobile */}
        <div className="relative z-20 w-full max-w-[2400px] mx-auto px-4 sm:px-8 xl:px-12 pb-3 sm:pb-6 flex flex-col justify-end">
          <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight font-poppins drop-shadow-md">
            {categoryName}
          </h1>
          {categoryTitle && categoryTitle.toLowerCase() !== categoryName.toLowerCase() && (
            <p className="text-xs sm:text-sm text-white/80 font-medium tracking-wide mt-0.5 line-clamp-1">
              {categoryTitle}
            </p>
          )}
          {category?.description && (
            <p className="hidden sm:block text-white/80 text-xs sm:text-sm line-clamp-2 mt-1.5 font-normal leading-relaxed max-w-2xl drop-shadow-sm">
              {category.description}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-[2400px] mx-auto px-5 sm:px-8 xl:px-12 py-8">
        <p className="text-sm text-[#888888] mb-6">
          Showing <span className="text-[#111111] font-semibold">{filteredTrips.length}</span> trips in{' '}
          <span className="text-[#F5B301]">{categoryTitle}</span>
        </p>

        {filteredTrips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredTrips.map(trip => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-[#EEEEEE]">
            <div className="w-20 h-20 bg-[#F3F4F6] rounded-full flex items-center justify-center mx-auto mb-5">
              <Mountain className="w-10 h-10 text-[#9CA3AF]" />
            </div>
            <h3 className="text-xl font-semibold text-[#111111] mb-2">No trips found</h3>
            <p className="text-[#555555] mb-6 text-sm">
              No trips available in this category yet.
            </p>
            <Link to="/trips" className="inline-flex items-center gap-2 bg-[#F5B301] text-[#111111] font-semibold px-6 py-2.5 rounded-full hover:bg-[#E5A100] transition-colors">
              Browse All Trips <ArrowRight size={16} />
            </Link>
          </div>
        )}

        <div className="text-center mt-10">
          <Link to="/trips" className="inline-flex items-center gap-2 text-[#888888] hover:text-[#F5B301] transition-colors text-sm">
            ← Back to All Trips
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CategoryDetail;
