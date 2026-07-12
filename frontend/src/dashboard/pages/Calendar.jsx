import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Plus, Info } from 'lucide-react';

function Calendar() {
  const { bookings, audits } = useContext(AppContext);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 12)); // July 2026
  const [selectedDay, setSelectedDay] = useState(12); // Day 12 selected by default
  const [addEventModal, setAddEventModal] = useState(false);
  
  // Custom local events additions
  const [localEvents, setLocalEvents] = useState([
    { title: 'Weekly Engineering Standup', date: '2026-07-12', time: '09:00 - 10:00', type: 'Meeting' },
    { title: 'Server Audit Review Session', date: '2026-07-12', time: '14:00 - 15:00', type: 'Audit' },
    { title: 'Transit Van Inspection Handover', date: '2026-07-13', time: '11:00 - 11:30', type: 'Handover' }
  ]);

  const [newEvent, setNewEvent] = useState({ title: '', time: '', type: 'Meeting' });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(1);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(1);
  };

  // Get days in month
  const getDaysInMonth = (y, m) => {
    return new Date(y, m + 1, 0).getDate();
  };

  // Get starting day offset (0: Sunday, 1: Monday...)
  const getStartingDay = (y, m) => {
    return new Date(y, m, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(year, month);
  const startingDay = getStartingDay(year, month);

  // Pad previous month offset blocks
  const dayBlocks = [];
  for (let i = 0; i < startingDay; i++) {
    dayBlocks.push({ day: null, currentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    dayBlocks.push({ day: d, currentMonth: true });
  }

  // Get formatted date string for matching
  const getFormattedDateString = (dayVal) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(dayVal).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  // Check if day has any events
  const getEventsForDay = (dayVal) => {
    if (!dayVal) return [];
    const dateStr = getFormattedDateString(dayVal);
    
    const dayBookings = bookings
      .filter(b => b.date === dateStr && b.status !== 'Cancelled')
      .map(b => ({ title: `Booking: ${b.assetName}`, time: `${b.startTime} - ${b.endTime}`, type: 'Booking', user: b.user }));
      
    const dayAudits = audits
      .filter(a => a.startDate <= dateStr && a.endDate >= dateStr)
      .map(a => ({ title: `Audit: ${a.name}`, time: 'All Day', type: 'Audit', user: a.auditor }));

    const dayLocals = localEvents
      .filter(e => e.date === dateStr)
      .map(e => ({ title: e.title, time: e.time, type: e.type }));

    return [...dayBookings, ...dayAudits, ...dayLocals];
  };

  const activeEvents = getEventsForDay(selectedDay);

  const handleAddEventSubmit = (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.time) return;
    const dateStr = getFormattedDateString(selectedDay);
    setLocalEvents([...localEvents, {
      title: newEvent.title,
      date: dateStr,
      time: newEvent.time,
      type: newEvent.type
    }]);
    setNewEvent({ title: '', time: '', type: 'Meeting' });
    setAddEventModal(false);
  };

  return (
    <div className="space-y-6 animate-slide-in-up">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Operational Calendar</h1>
          <p className="text-xs text-muted-foreground">Monitor resource bookings and asset audit schedules.</p>
        </div>
        
        <button 
          onClick={() => setAddEventModal(true)}
          className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg text-xs shadow-md"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Event</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid card */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5 shadow-sm">
          {/* Calendar Navigation header */}
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-border">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4 text-primary" />
              <span>{monthNames[month]} {year}</span>
            </h2>
            <div className="flex gap-1">
              <button onClick={handlePrevMonth} className="p-1 rounded-lg hover:bg-secondary text-foreground">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={handleNextMonth} className="p-1 rounded-lg hover:bg-secondary text-foreground">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week header */}
          <div className="grid grid-cols-7 text-center font-bold text-muted-foreground text-[10px] uppercase tracking-wider mb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Calendar Numbers Grid */}
          <div className="grid grid-cols-7 gap-1">
            {dayBlocks.map((block, idx) => {
              const day = block.day;
              const hasEvents = day ? getEventsForDay(day).length > 0 : false;
              const isSelected = day === selectedDay;

              return (
                <div 
                  key={idx}
                  onClick={() => day && setSelectedDay(day)}
                  className={`h-16 border border-border/40 rounded-lg p-1.5 flex flex-col justify-between cursor-pointer transition-all ${
                    !day ? 'bg-secondary/10 cursor-default border-none' :
                    isSelected ? 'bg-primary text-primary-foreground border-primary' :
                    'bg-card text-foreground hover:bg-secondary/40'
                  }`}
                >
                  {day && (
                    <>
                      <span className="text-xs font-bold">{day}</span>
                      {hasEvents && (
                        <span className={`w-1.5 h-1.5 rounded-full self-center ${
                          isSelected ? 'bg-primary-foreground' : 'bg-primary animate-pulse'
                        }`} />
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Daily Event List */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm h-fit">
          <h2 className="text-sm font-bold text-foreground mb-4">
            Events for {monthNames[month]} {selectedDay}, {year}
          </h2>

          <div className="space-y-3">
            {activeEvents.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-1.5">
                <Info className="w-6 h-6 text-muted-foreground/40" />
                <span>No events or bookings scheduled for this day.</span>
              </div>
            ) : (
              activeEvents.map((evt, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-secondary/35 border border-border space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-foreground leading-snug">{evt.title}</span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                      evt.type === 'Booking' ? 'bg-blue-100 text-blue-800' :
                      evt.type === 'Audit' ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {evt.type}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{evt.time}</span>
                  </div>
                  {evt.user && (
                    <div className="text-[10px] text-muted-foreground pt-1">
                      Personnel: <span className="font-semibold text-foreground">{evt.user}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Add Event Modal */}
      {addEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAddEventModal(false)} />
          <div className="relative bg-card border border-border w-full max-w-sm p-6 rounded-2xl shadow-xl">
            <h2 className="text-sm font-bold text-foreground mb-4">Add Custom Event</h2>
            <form onSubmit={handleAddEventSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Event Title</label>
                <input 
                  type="text"
                  placeholder="e.g. Asset inspection sync"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-xs focus:outline-none bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Time Window</label>
                  <input 
                    type="text"
                    placeholder="e.g. 10:00 - 11:00"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs focus:outline-none bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Type</label>
                  <select 
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs focus:outline-none bg-background"
                  >
                    <option value="Meeting">Meeting</option>
                    <option value="Audit">Audit Check</option>
                    <option value="Handover">Handover</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setAddEventModal(false)} className="px-3 py-1.5 border rounded-lg text-xs hover:bg-secondary">
                  Cancel
                </button>
                <button type="submit" className="px-3 py-1.5 bg-primary text-primary-foreground font-semibold rounded-lg text-xs">
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Calendar;
