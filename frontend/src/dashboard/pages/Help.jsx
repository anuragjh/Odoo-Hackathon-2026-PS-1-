import React, { useState } from 'react';
import { CircleHelp, ChevronDown, ChevronUp, BookOpen, Video, ShieldCheck, Mail } from 'lucide-react';

function Help() {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const faqs = [
    {
      q: "How does the system prevent double-allocation of a single asset?",
      a: "AssetFlow enforces real-time conflict checking during allocations. If you attempt to assign an asset that is currently marked as 'Allocated', the system will block the transaction, display the name of the current holder, and offer a 'Request Transfer' option instead."
    },
    {
      q: "How are resource booking overlaps validated?",
      a: "When booking shared resources like meeting rooms or vehicles, the system checks the requested time slots against existing reservations for that date. If the slots overlap by even a minute, the booking gets rejected, showing you the conflicting slot and holder."
    },
    {
      q: "What happens when an audit cycle is closed?",
      a: "Closing an audit cycle locks the records for security. The system automatically processes any discrepancies: assets marked as 'Missing' are converted to 'Lost' status in the master directory, and assets flagged as 'Damaged' are set to 'Fair/Damaged' condition, generating a final discrepancy report."
    },
    {
      q: "Who can approve maintenance requests?",
      a: "Maintenance repair tickets are routed through an approval pipeline. Only employees Elevated to 'Asset Manager' roles are permitted to authorize repair requests, assign support technicians, and review resolved logs before returning the asset to service."
    }
  ];

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="space-y-6 animate-slide-in-up">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Support & Help Guides</h1>
        <p className="text-xs text-muted-foreground">Find answers to configuration workflows, guides, and contact corporate IT support.</p>
      </div>

      {/* Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border p-5 rounded-2xl flex items-start gap-3">
          <BookOpen className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h3 className="font-bold text-foreground">Documentation</h3>
            <p className="text-muted-foreground leading-relaxed">Read comprehensive guides on asset lifecycles and ERP setups.</p>
            <a href="#" className="text-primary font-semibold hover:underline block pt-1">Open Manuals &rarr;</a>
          </div>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl flex items-start gap-3">
          <Video className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h3 className="font-bold text-foreground">Video Walkthroughs</h3>
            <p className="text-muted-foreground leading-relaxed">Watch quick 2-minute video walkthroughs of bookings and audits.</p>
            <a href="#" className="text-primary font-semibold hover:underline block pt-1">Watch Videos &rarr;</a>
          </div>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h3 className="font-bold text-foreground">Policy Guidelines</h3>
            <p className="text-muted-foreground leading-relaxed">Review corporate hardware allocation terms and audit frequencies.</p>
            <a href="#" className="text-primary font-semibold hover:underline block pt-1">View Policies &rarr;</a>
          </div>
        </div>
      </div>

      {/* Accordion FAQ */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-bold text-foreground mb-4">Frequently Asked Questions</h2>
        <div className="space-y-2.5">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div key={index} className="border border-border rounded-xl overflow-hidden text-xs">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left font-semibold text-foreground hover:bg-secondary/40 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>
                {isOpen && (
                  <div className="px-4 py-3 bg-secondary/20 border-t border-border text-muted-foreground leading-relaxed animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Support footer */}
      <div className="bg-secondary/30 p-5 rounded-2xl border border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="text-xs space-y-1">
          <h3 className="font-bold text-foreground flex items-center gap-1">
            <Mail className="w-4 h-4 text-primary" />
            <span>Still need assistance?</span>
          </h3>
          <p className="text-muted-foreground">Contact the corporate IT service desk or raise a facilities support ticket.</p>
        </div>
        <button className="bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg text-xs hover:bg-primary/95 transition-all shadow-md">
          Raise Service Request
        </button>
      </div>

    </div>
  );
}

export default Help;
