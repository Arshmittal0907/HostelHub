import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import { Building2, Search, MapPin, Globe, Mail, Phone, Users, ArrowRight } from 'lucide-react';

export const CollegeDirectoryPage: React.FC = () => {
  const [colleges, setColleges] = useState<any[]>([]);
  const [search, setSearch] = useState<string>('');
  const [cityFilter, setCityFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchColleges();
  }, [search, cityFilter]);

  const fetchColleges = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (cityFilter) query.append('city', cityFilter);

      const res = await apiRequest(`/colleges?${query.toString()}`);
      if (res.success) {
        setColleges(res.data);
      }
    } catch (e) {
      console.error('Error fetching colleges:', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 text-brand-700 font-bold text-xl">
          <Building2 className="w-5 h-5 text-brand-600" />
          <span>Hostel<span className="text-teal-600">Hub</span></span>
        </Link>

        <div className="flex items-center space-x-3">
          <Link
            to="/register-college"
            className="text-xs font-semibold text-slate-600 hover:text-brand-700 transition"
          >
            Register Institution
          </Link>
          <Link
            to="/login"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 shadow-sm transition"
          >
            Sign In
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full px-6 py-10 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Approved Colleges Directory
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Browse verified educational institutions operating residential hostels on HostelHub.
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-8 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by college name, code, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <input
            type="text"
            placeholder="Filter by city (e.g. Bangalore, Pune)..."
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="sm:w-64 px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Colleges Grid */}
        {isLoading ? (
          <div className="py-16 text-center text-slate-400 text-xs">Loading approved colleges...</div>
        ) : colleges.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500 text-xs">
            No approved colleges found matching your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {colleges.map((col) => (
              <div
                key={col.id}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
                      {col.code}
                    </span>
                    <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                      Verified
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1">{col.name}</h3>

                  <div className="space-y-1 text-xs text-slate-500 mb-4">
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{col.city}, {col.state}</span>
                    </div>
                    {col.officialEmail && (
                      <div className="flex items-center space-x-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{col.officialEmail}</span>
                      </div>
                    )}
                    {col.website && (
                      <div className="flex items-center space-x-1.5">
                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                        <a href={col.website} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">
                          {col.website}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Registered Hostels ({col.hostels?.length || 0})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {col.hostels?.map((h: any) => (
                        <span
                          key={h.id}
                          className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700"
                        >
                          {h.name} ({h.type})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Applications Open</span>
                  <Link
                    to={`/register-student?collegeId=${col.id}`}
                    className="inline-flex items-center space-x-1 text-xs font-bold text-brand-600 hover:text-brand-800"
                  >
                    <span>Register for Hostel</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
