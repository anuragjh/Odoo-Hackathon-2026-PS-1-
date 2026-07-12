import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { Calendar, Plus, Clock, User, AlertCircle, Trash2, CheckCircle2 } from 'lucide-react';

function ResourceBookings() {
  const { assets, bookings, createBooking, setBookings, setAssets } = useContext(AppContext);
  
  // Form states
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [startHour, setStartHour] = useState('');
  const [endHour, setEndHour] = useState('');
  
  // Alert states
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Filter state
  const [selectedResourceFilter, setSelectedResourceFilter] = useState('All');

  // Submit booking
  const handleBookingSubmit = (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!selectedAssetId || !bookingDate || !startHour || !endHour) {
      setErrorMsg('Please fill in all the booking fields.');
      return;
    }

    const res = createBooking({
      assetId: selectedAssetId,
      date: bookingDate,
      startTime: startHour,
      endTime: endHour
    });

    if (res.success) {
      setSuccessMsg('Resource booked successfully! Check your schedule below.');
      setSelectedAssetId('');
      setBookingDate('');
      setStartHour('');
      setEndHour('');
    } else {
      setErrorMsg(res.error);
    }
  };

  // Cancel booking
  const handleCancelBooking = (bookingId, assetId) => {
    // Cancel the booking status
    setBookings(bookings.map(b => {
      if (b.id === bookingId) {
        return { ...b, status: 'Cancelled' };
      }
      return b;
    }));

    // Check if there are other active bookings for the asset. If not, mark asset Available.
    const activeForAsset = bookings.filter(b => b.assetId === assetId && b.id !== bookingId && (b.status === 'Upcoming' || b.status === 'Ongoing'));
    if (activeForAsset.length === 0) {
      setAssets(prevAssets => prevAssets.map(a => {
        if (a.id === assetId) {
          return { ...a, status: 'Available' };
        }
        return a;
      }));
    }

    setSuccessMsg('Booking cancelled successfully.');
  };

  // Filter Bookings
  const filteredBookings = bookings.filter(b => {
    return selectedResourceFilter === 'All' || b.assetId === selectedResourceFilter;
  });

  return (
    <div className="space-y-6 animate-slide-in-up">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Resource Bookings</h1>
        <p className="text-xs text-muted-foreground">Book conference rooms, corporate transit vehicles, and project electronics.</p>
      </div>

      {/* Alert Notices */}
      {successMsg && (
        <div className="p-4 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400 font-semibold text-xs flex justify-between items-center">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="hover:underline text-[10px]">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bookings Form */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm h-fit">
          <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-primary" />
            <span>Create Booking Slot</span>
          </h2>
          
          <form onSubmit={handleBookingSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Select Resource</label>
              <select 
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
              >
                <option value="">-- Choose Resource --</option>
                {assets.filter(a => a.isShared).map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.status})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Date</label>
              <input 
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Start Time</label>
                <input 
                  type="time"
                  value={startHour}
                  onChange={(e) => setStartHour(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">End Time</label>
                <input 
                  type="time"
                  value={endHour}
                  onChange={(e) => setEndHour(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
                />
              </div>
            </div>

            {/* Overlap Error Warning */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl border bg-rose-50 border-rose-200 text-rose-950 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400 text-xs flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-semibold">{errorMsg}</span>
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-primary text-primary-foreground font-semibold py-2 rounded-lg text-xs hover:bg-primary/95 transition-all shadow-md shadow-primary/10"
            >
              Reserve Time Slot
            </button>
          </form>
        </div>

        {/* Existing Bookings Log */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary" />
                <span>Existing Schedule Calendar</span>
              </h2>
              
              {/* Filter Schedule */}
              <select 
                value={selectedResourceFilter} 
                onChange={(e) => setSelectedResourceFilter(e.target.value)}
                className="w-full sm:w-44 px-3 py-1.5 border rounded-lg focus:outline-none text-[10px] bg-background"
              >
                <option value="All">All Resources</option>
                {assets.filter(a => a.isShared).map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
              {filteredBookings.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground">No bookings scheduled for this resource.</div>
              ) : (
                filteredAssetsBookings(filteredBookings).map((book) => (
                  <div 
                    key={book.id} 
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
                      book.status === 'Cancelled' ? 'bg-secondary/20 opacity-60 border-dashed' : 'bg-secondary/30'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm">{book.assetName}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          book.status === 'Upcoming' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/20 dark:text-blue-400' :
                          book.status === 'Ongoing' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400' :
                          book.status === 'Completed' ? 'bg-secondary text-muted-foreground' :
                          'bg-rose-100 text-rose-800 dark:bg-rose-950/20 dark:text-rose-400'
                        }`}>
                          {book.status}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          <span>{book.user}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{book.date} &bull; {book.startTime} - {book.endTime}</span>
                        </span>
                      </div>
                    </div>

                    {(book.status === 'Upcoming' || book.status === 'Ongoing') && (
                      <button 
                        onClick={() => handleCancelBooking(book.id, book.assetId)}
                        className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-lg text-[10px] font-bold flex items-center gap-1 self-end sm:self-center"
                        title="Cancel Slot Reservation"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Cancel Slot</span>
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Help sort bookings by Date and Time
function filteredAssetsBookings(bookingList) {
  return [...bookingList].sort((a, b) => {
    if (a.date !== b.date) return new Date(b.date) - new Date(a.date);
    return b.startTime.localeCompare(a.startTime);
  });
}

export default ResourceBookings;
