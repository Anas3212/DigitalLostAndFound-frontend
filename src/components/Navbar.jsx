import { Search, PlusCircle, Bell, Navigation } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const userInfo = localStorage.getItem('userInfo');
  const user = userInfo ? JSON.parse(userInfo) : null;

  return (
    <nav className="glass sticky top-1 rounded-3xl mx-2 z-50 px-8 py-5 flex items-center justify-between mt-4">
      <Link to="/" className="text-3xl font-black uppercase tracking-tighter text-gradient">
        Digital Found
      </Link>
      
      <div className="flex items-center gap-6">
        <Link to="/browse" className="text-slate-600 hover:text-primary-600 transition-all flex items-center gap-2 font-bold uppercase tracking-tight text-sm">
          <span>Browse</span>
        </Link>
        <Link to="/nearby" className="text-slate-600 hover:text-primary-600 transition-all flex items-center gap-2 font-bold uppercase tracking-tight text-sm">
          <Navigation size={20} />
          <span>Nearby</span>
        </Link>
        
        {user ? (
          <>
            <Link to="/report" className="btn-primary flex items-center gap-2 px-4 py-2 text-sm transition-transform active:scale-95">
              <PlusCircle size={18} />
              <span>Report</span>
            </Link>
            <div className="h-8 w-[1px] bg-slate-200" />
            <Link to="/dashboard" className="text-slate-600 hover:text-primary-600 transition-all flex items-center gap-2 font-bold uppercase tracking-tight text-sm px-2 group">
              <div className="relative">
                <Bell size={20} className="group-hover:rotate-12 transition-transform" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-accent-500 rounded-full border-2 border-white shadow-sm" />
              </div>
              <span className="hidden md:inline">Activity</span>
            </Link>
            <Link to="/profile" className="flex items-center gap-2 group ml-2">
              <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center border-2 border-primary-100 group-hover:border-primary-400 group-hover:bg-primary-100 transition-all font-black text-primary-600 shadow-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </Link>
          </>
        ) : (
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-slate-600 hover:text-primary-600 font-bold uppercase tracking-tight text-sm px-2">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary px-5 py-2.5 text-sm">
              Join
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
