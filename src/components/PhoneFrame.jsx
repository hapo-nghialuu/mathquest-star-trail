// Phone frame — a 375x812 mobile viewport centered on desktop. The 13" +
// desktop case (max-width 480px) auto-scales the frame to fit.
import React from 'react';

export default function PhoneFrame({ children }) {
  // Auto-scale on smaller desktop windows.
  React.useEffect(() => {
    const updateScale = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const scale = Math.min(1, vw / 480, vh / 880);
      document.documentElement.style.setProperty('--phone-scale', scale.toFixed(3));
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return (
    <div className="phone-stage" role="application" aria-label="MathQuest Star Trail">
      <div className="phone-screen">{children}</div>
    </div>
  );
}
