import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './LandingPage.css';

gsap.registerPlugin(ScrollTrigger);

// ── Minimal SVG Icons ─────────────────────────────────────────────────────────
const Ico = ({ path, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);
const ICONS = {
  arrow:    'M5 12h14M12 5l7 7-7 7',
  box:      'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
  users:    'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  tool:     'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
  shield:   'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  chart:    'M3 3v18h18M18 9l-5 5-4-4-3 3',
  bell:     'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0',
  layers:   'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  check:    'M20 6L9 17l-5-5',
  tag:      'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01',
  zap:      'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
};

// ── Marquee strip data ────────────────────────────────────────────────────────
const MARQUEE = [
  'Asset Lifecycle', 'Role-Based Access', 'Resource Booking',
  'Maintenance Workflows', 'Audit Cycles', 'Overdue Alerts',
  'Transfer Requests', 'Discrepancy Reports', 'KPI Dashboard',
];

// ── Features ──────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: 'box',      n: '01', title: '7-State Lifecycle',     sub: 'Track assets through Available, Allocated, Reserved, Under Maintenance, Lost, Retired, and Disposed states.' },
  { icon: 'users',    n: '02', title: 'Role-Based Workflows',  sub: 'Four scoped roles: Admin setup, Asset Manager registry, Dept. Head approvals, and Employee directory.' },
  { icon: 'calendar', n: '03', title: 'Overlap Validation',    sub: 'Book shared rooms, vehicles, and equipment by time slot with real-time double-allocation defense.' },
  { icon: 'tool',     n: '04', title: 'Maintenance Routing',   sub: 'Structured repair approvals: route requests through automated validation before repair work starts.' },
  { icon: 'shield',   n: '05', title: 'Scheduled Audits',      sub: 'Run scheduled audit cycles with assigned auditors and auto-generated discrepancy reports.' },
  { icon: 'chart',    n: '06', title: 'Real-time Visibility',   sub: 'Surf utilization stats, active bookings, and asset conditions in one unified KPI dashboard.' },
  { icon: 'bell',     n: '07', title: 'System Notifications',  sub: 'Get automated alerts for overdue returns, maintenance approvals, and booking reminders.' },
  { icon: 'layers',   n: '08', title: 'Transfer Blockers',     sub: 'Prevent double-allocation and spreadsheet errors with unified, role-based resource transfer logs.' },
];

// ── Stats ─────────────────────────────────────────────────────────────────────
const STATS = [
  { val: '7',    label: 'Asset States' },
  { val: '4',    label: 'Scoped Roles' },
  { val: '100%', label: 'Conflict Guard'},
  { val: '0',    label: 'Spreadsheets' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const rootRef    = useRef(null);
  const heroRef    = useRef(null);
  const tagRef     = useRef(null);
  const h1Ref      = useRef(null);
  const subRef     = useRef(null);
  const ctaRef     = useRef(null);
  const statsRef   = useRef(null);
  const featRef    = useRef(null);
  const marqueeRef = useRef(null);
  const ctaSectRef = useRef(null);
  const cursorRef  = useRef(null);
  const cursorDot  = useRef(null);
  const navRef     = useRef(null);

  // ── Custom cursor ───────────────────────────────────────────────────────────
  useEffect(() => {
    const cursor = cursorRef.current;
    const dot    = cursorDot.current;
    if (!cursor || !dot) return;

    let mx = 0, my = 0, cx = 0, cy = 0;

    const onMove = (e) => {
      mx = e.clientX; my = e.clientY;
      gsap.to(dot, { x: mx, y: my, duration: 0.06, ease: 'none' });
    };

    const raf = gsap.ticker.add(() => {
      cx += (mx - cx) * 0.12;
      cy += (my - cy) * 0.12;
      gsap.set(cursor, { x: cx - 18, y: cy - 18 });
    });

    const grow = () => gsap.to(cursor, { scale: 1.8, opacity: 0.5, duration: 0.25 });
    const shrink = () => gsap.to(cursor, { scale: 1, opacity: 1, duration: 0.25 });

    const hoverables = document.querySelectorAll('a, button, .lp-feat-card');
    hoverables.forEach(el => {
      el.addEventListener('mouseenter', grow);
      el.addEventListener('mouseleave', shrink);
    });

    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mousemove', onMove);
      gsap.ticker.remove(raf);
      hoverables.forEach(el => {
        el.removeEventListener('mouseenter', grow);
        el.removeEventListener('mouseleave', shrink);
      });
    };
  }, []);

  // ── Hero entrance ───────────────────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from(navRef.current, { y: -30, opacity: 0, duration: 0.7 })
        .from(tagRef.current,  { y: 20, opacity: 0, duration: 0.5 }, '-=0.3')
        .from(h1Ref.current.querySelectorAll('.lp-word'), {
          y: 80, opacity: 0, duration: 0.7, stagger: 0.06, ease: 'power4.out',
        }, '-=0.2')
        .from(subRef.current,  { y: 20, opacity: 0, duration: 0.5 }, '-=0.3')
        .from(ctaRef.current.children,  { y: 16, opacity: 0, duration: 0.4, stagger: 0.1 }, '-=0.2')
        .from('.lp-dashboard-wrapper', { y: 40, opacity: 0, duration: 0.8 }, '-=0.2')
        .from(statsRef.current.querySelectorAll('.lp-stat'), {
          y: 30, opacity: 0, duration: 0.5, stagger: 0.08,
        }, '-=0.1');
    }, rootRef);

    return () => ctx.revert();
  }, []);

  // ── Scroll animations ───────────────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Marquee
      const mq = marqueeRef.current;
      if (mq) {
        const inner = mq.querySelector('.lp-mq-inner');
        gsap.to(inner, { x: '-50%', duration: 22, ease: 'none', repeat: -1 });
      }

      // Feature cards
      if (featRef.current) {
        gsap.from(featRef.current.querySelectorAll('.lp-feat-card'), {
          scrollTrigger: { trigger: featRef.current, start: 'top 80%' },
          y: 50, opacity: 0, duration: 0.6, stagger: 0.07, ease: 'power3.out',
        });
      }

      // CTA section
      if (ctaSectRef.current) {
        gsap.from(ctaSectRef.current.querySelectorAll('.lp-anim'), {
          scrollTrigger: { trigger: ctaSectRef.current, start: 'top 75%' },
          y: 40, opacity: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out',
        });
      }
    }, rootRef);

    return () => ctx.revert();
  }, []);

  // ── Magnetic button ─────────────────────────────────────────────────────────
  const magRef = useRef(null);
  const magMove = (e) => {
    const el = magRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top  - r.height / 2;
    gsap.to(el, { x: x * 0.35, y: y * 0.35, duration: 0.3, ease: 'power2.out' });
  };
  const magLeave = () => gsap.to(magRef.current, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,0.5)' });

  // ── Word wrap helper ────────────────────────────────────────────────────────
  const wrapWords = (text) =>
    text.split(' ').map((w, i) => (
      <span key={i} className="lp-word-wrap">
        <span className="lp-word">{w}</span>
      </span>
    ));

  return (
    <div className="lp-root" ref={rootRef}>
      {/* Custom cursor */}
      <div className="lp-cursor-ring" ref={cursorRef} />
      <div className="lp-cursor-dot"  ref={cursorDot} />

      {/* ── Nav ───────────────────────────────────────────────────────────── */}
      <nav className="lp-nav" ref={navRef}>
        <div className="lp-nav-inner">
          <div className="lp-logo">
            <div className="lp-logo-mark"><Ico path={ICONS.box} size={16} /></div>
            <span>AssetFlow</span>
          </div>
          <div className="lp-nav-links">
            <a href="#features">Features</a>
            <a href="#about">About</a>
          </div>
          <button className="lp-nav-cta" onClick={() => navigate('/get-started')}>
            Launch App <Ico path={ICONS.arrow} size={14} />
          </button>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="lp-hero" ref={heroRef}>
        <div className="lp-hero-inner">
          <div className="lp-tag" ref={tagRef}>
            Enterprise Asset &amp; Resource Management
          </div>

          <h1 className="lp-h1" ref={h1Ref}>
            <span className="lp-h1-line">{wrapWords('Every asset.')}</span>
            <span className="lp-h1-line lp-h1-dim">{wrapWords('Always accountable.')}</span>
          </h1>

          <p className="lp-sub" ref={subRef}>
            AssetFlow centralises departments, assets, bookings, maintenance,
            and audits into one clean ERP platform — built for teams that need
            structure, not spreadsheets.
          </p>

          <div className="lp-cta-row" ref={ctaRef}>
            <button
              ref={magRef}
              className="lp-btn-primary"
              onMouseMove={magMove}
              onMouseLeave={magLeave}
              onClick={() => navigate('/get-started')}
            >
              Open Dashboard <Ico path={ICONS.arrow} size={16} />
            </button>
            <a href="#features" className="lp-btn-ghost">See features</a>
          </div>

          {/* Live High-Fidelity App Preview (Nexus-style) */}
          <div className="lp-dashboard-wrapper lp-anim">
            <div className="lp-mockup-header">
              <div className="lp-mockup-dots">
                <span className="lp-md-dot red"></span>
                <span className="lp-md-dot yellow"></span>
                <span className="lp-md-dot green"></span>
              </div>
              <div className="lp-mockup-url">assetflow.enterprise/dashboard</div>
            </div>
            <div className="lp-mockup-body">
              {/* Collapsible Sidebar */}
              <div className="lp-mockup-sidebar">
                <div className="lp-sidebar-brand">
                  <div className="lp-brand-icon"><Ico path={ICONS.box} size={13} /></div>
                  <span>AssetFlow</span>
                </div>
                <nav className="lp-sidebar-nav">
                  <div className="lp-side-item active">
                    <Ico path={ICONS.chart} size={12} /> <span>Overview</span>
                  </div>
                  <div className="lp-side-item">
                    <Ico path={ICONS.box} size={12} /> <span>Assets Directory</span>
                  </div>
                  <div className="lp-side-item">
                    <Ico path={ICONS.calendar} size={12} /> <span>Resource Bookings</span>
                  </div>
                  <div className="lp-side-item">
                    <Ico path={ICONS.tool} size={12} /> <span>Maintenance Approval</span>
                  </div>
                  <div className="lp-side-item">
                    <Ico path={ICONS.shield} size={12} /> <span>Audit Cycles</span>
                  </div>
                </nav>
              </div>

              {/* Main Content Workspace */}
              <div className="lp-mockup-workspace">
                <div className="lp-workspace-header">
                  <div className="lp-header-title">System Architecture Overview</div>
                  <div className="lp-header-user">
                    <Ico path={ICONS.users} size={12} />
                    <span>Asset Manager</span>
                  </div>
                </div>

                {/* Dashboard Widgets */}
                <div className="lp-mockup-widgets">
                  <div className="lp-m-widget">
                    <div className="lp-widget-lbl">Total Registered</div>
                    <div className="lp-widget-num">1,428</div>
                    <div className="lp-widget-trend trend-green">Available: 843</div>
                  </div>
                  <div className="lp-m-widget">
                    <div className="lp-widget-lbl">Conflict Guard</div>
                    <div className="lp-widget-num">Active</div>
                    <div className="lp-widget-trend trend-green">Overlap Blocked</div>
                  </div>
                  <div className="lp-m-widget">
                    <div className="lp-widget-lbl">Maintenance Approval</div>
                    <div className="lp-widget-num">6 Pending</div>
                    <div className="lp-widget-trend trend-red">Requires Audit</div>
                  </div>
                </div>

                {/* Simulated Data Table */}
                <div className="lp-mockup-table-container">
                  <div className="lp-table-title">Real-Time Lifecycle Tracking</div>
                  <table className="lp-mockup-table">
                    <thead>
                      <tr>
                        <th>Asset Item</th>
                        <th>Category</th>
                        <th>Department</th>
                        <th>Transition Lifecycle</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Tesla Model Y</td>
                        <td>Vehicle</td>
                        <td>Logistics</td>
                        <td><span className="lp-mock-badge mock-allocated">Allocated</span></td>
                      </tr>
                      <tr>
                        <td>Conference Room Beta</td>
                        <td>Workspace</td>
                        <td>Marketing</td>
                        <td><span className="lp-mock-badge mock-reserved">Reserved</span></td>
                      </tr>
                      <tr>
                        <td>Velo Ergonomic Desk</td>
                        <td>Furniture</td>
                        <td>Operations</td>
                        <td><span className="lp-mock-badge mock-available">Available</span></td>
                      </tr>
                      <tr>
                        <td>Optics Lab Scanner</td>
                        <td>Equipment</td>
                        <td>R&amp;D Engineering</td>
                        <td><span className="lp-mock-badge mock-maintenance">Under Maintenance</span></td>
                      </tr>
                      <tr>
                        <td>ThinkPad Carbon X1</td>
                        <td>Hardware</td>
                        <td>IT Support</td>
                        <td><span className="lp-mock-badge mock-retired">Retired</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="lp-stats" ref={statsRef}>
            {STATS.map((s, i) => (
              <div key={i} className="lp-stat">
                <span className="lp-stat-val">{s.val}</span>
                <span className="lp-stat-lbl">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative grid lines */}
        <div className="lp-grid-lines" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="lp-grid-col" />)}
        </div>
      </section>

      {/* ── Marquee ───────────────────────────────────────────────────────── */}
      <div className="lp-marquee" ref={marqueeRef}>
        <div className="lp-mq-inner">
          {[...MARQUEE, ...MARQUEE].map((t, i) => (
            <span key={i} className="lp-mq-item">
              <span className="lp-mq-dot" />
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section id="features" className="lp-features">
        <div className="lp-sect-hdr">
          <span className="lp-sect-num">01</span>
          <h2 className="lp-sect-title">Built for real operations</h2>
          <p className="lp-sect-sub">Every module maps to an actual workflow inside your organisation.</p>
        </div>

        <div className="lp-feat-grid" ref={featRef}>
          {FEATURES.map((f, i) => (
            <div key={i} className="lp-feat-card" tabIndex={0}>
              <div className="lp-feat-top">
                <span className="lp-feat-n">{f.n}</span>
                <div className="lp-feat-icon"><Ico path={ICONS[f.icon]} size={18} /></div>
              </div>
              <h3 className="lp-feat-title">{f.title}</h3>
              <p className="lp-feat-sub">{f.sub}</p>
              {f.title === 'Asset Registry' && (
                <div className="lp-feat-micro-card">
                  <div className="lp-micro-tag">Full Lifecycle</div>
                  <div className="lp-lifecycle-states">
                    <span className="lp-state-active">Available</span>
                    <span className="lp-arrow">→</span>
                    <span>Allocated</span>
                    <span className="lp-arrow">→</span>
                    <span>Under Maintenance</span>
                    <span className="lp-arrow">→</span>
                    <span>Retired</span>
                  </div>
                </div>
              )}
              {f.title === 'Resource Booking' && (
                <div className="lp-feat-micro-card">
                  <div className="lp-micro-tag">Overlap Defense</div>
                  <div className="lp-defense-status">
                    <span className="lp-defense-pill">Active Protection</span>
                    <span className="lp-defense-desc">Conflict Prevention Enabled</span>
                  </div>
                </div>
              )}
              <div className="lp-feat-line" />
            </div>
          ))}
        </div>
      </section>

      {/* ── Workflow strip ────────────────────────────────────────────────── */}
      <section id="about" className="lp-workflow">
        <div className="lp-sect-hdr">
          <span className="lp-sect-num">02</span>
          <h2 className="lp-sect-title">From setup to full control</h2>
        </div>
        <div className="lp-steps">
          {[
            { n: '1', t: 'Org Setup',        d: 'Admin configures departments, categories, and promotes employees.' },
            { n: '2', t: 'Register Assets',   d: 'Asset Manager registers and tags all assets with lifecycle state.' },
            { n: '3', t: 'Allocate & Book',   d: 'Assets allocated; shared resources booked without overlaps.' },
            { n: '4', t: 'Maintain & Audit',  d: 'Repair approvals route before work; audits close with discrepancy reports.' },
          ].map((s, i) => (
            <div key={i} className="lp-step">
              <div className="lp-step-n">{s.n}</div>
              <div className="lp-step-body">
                <div className="lp-step-header">
                  <h3 className="lp-step-title">{s.t}</h3>
                  {s.t === 'Allocate & Book' && (
                    <span className="lp-inline-badge badge-defense">Conflict Defense Active</span>
                  )}
                  {s.t === 'Maintain & Audit' && (
                    <span className="lp-inline-badge badge-audit">Audit Validation Logged</span>
                  )}
                </div>
                <p  className="lp-step-desc">{s.d}</p>
              </div>
              {i < 3 && <div className="lp-step-line" />}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="lp-cta-sect" ref={ctaSectRef}>
        <div className="lp-cta-inner">
          <span className="lp-sect-num lp-anim">03</span>
          <h2 className="lp-cta-title lp-anim">
            Ready to take<br />control of your assets?
          </h2>
          <p className="lp-cta-sub lp-anim">
            Open the dashboard and start managing departments, assets,
            bookings, and audits — all in one place.
          </p>
          <button
            className="lp-btn-primary lp-btn-primary--lg lp-anim"
            onClick={() => navigate('/dashboard')}
          >
            Open Dashboard <Ico path={ICONS.arrow} size={18} />
          </button>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-logo">
            <div className="lp-logo-mark"><Ico path={ICONS.box} size={14} /></div>
            <span>AssetFlow</span>
          </div>
          <p className="lp-footer-copy">
            Odoo Hackathon 2026 · Enterprise Asset &amp; Resource Management
          </p>
        </div>
      </footer>
    </div>
  );
}
