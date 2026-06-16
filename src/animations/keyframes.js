// Inject CSS keyframes used by components (map node pulse, sparkle pop).
// Idempotent — safe to call multiple times.
const KEYFRAMES_ID = 'mathquest-keyframes';

const RULES = `
@keyframes map-node-pulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    filter: drop-shadow(0 0 8px rgba(255, 210, 74, 0.7));
  }
  50% {
    transform: translate(-50%, -50%) scale(1.07);
    filter: drop-shadow(0 0 18px rgba(255, 210, 74, 1));
  }
}

@keyframes sparkle-pop {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.3) rotate(0deg);
  }
  60% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.15) rotate(20deg);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.7) rotate(0deg);
  }
}

@keyframes cloud-drift {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(8px); }
}
`;

export function injectKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(KEYFRAMES_ID)) return;
  const style = document.createElement('style');
  style.id = KEYFRAMES_ID;
  style.textContent = RULES;
  document.head.appendChild(style);
}
