import React, { useState } from "react";
import { X, Cookie } from "lucide-react";
import { Btn } from "./primitives";
import { C } from "../theme";
import { hasStoredConsent, storeConsent, loadAnalytics } from "../lib/analytics";

export default function ConsentBanner() {
  const [visible, setVisible] = useState(!hasStoredConsent());
  const [expanded, setExpanded] = useState(false);

  if (!visible) return null;

  const accept = () => {
    storeConsent(true);
    loadAnalytics();
    setVisible(false);
  };
  const decline = () => {
    storeConsent(false);
    setVisible(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[200] p-4 sm:p-5 sm:max-w-md sm:left-auto sm:right-4 sm:bottom-4">
      <div className="rounded-2xl p-4 shadow-lg" style={{ backgroundColor: C.surface, border: `1px solid ${C.outlineVariant}` }}>
        <div className="flex items-start gap-3">
          <div style={{ backgroundColor: C.secondaryContainer }} className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"><Cookie size={16} style={{ color: C.onSecondaryContainer }} /></div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold mb-1">Cookies & analytics</p>
            <p className="text-xs" style={{ color: C.onSurfaceVariant }}>
              We'd like to use basic, anonymized analytics to understand how the club app is used.{" "}
              <button onClick={() => setExpanded(e => !e)} className="font-semibold underline" style={{ color: C.primary }}>
                {expanded ? "Show less" : "Learn more"}
              </button>
            </p>
            {expanded && (
              <p className="text-xs mt-2 p-2.5 rounded-lg" style={{ backgroundColor: C.surfaceContainerLow, color: C.onSurfaceVariant }}>
                If you accept, we load Google Analytics with IP addresses
                anonymized. No data is sold or shared with advertisers.
                You can change this anytime from your Profile. See the
                full Privacy Policy for details.
              </p>
            )}
          </div>
          <button onClick={decline} className="p-1 rounded-full shrink-0" style={{ color: C.outline }}><X size={14} /></button>
        </div>
        <div className="flex gap-2 mt-3">
          <Btn size="sm" variant="outline" full onClick={decline}>Decline</Btn>
          <Btn size="sm" full onClick={accept}>Accept</Btn>
        </div>
      </div>
    </div>
  );
}
