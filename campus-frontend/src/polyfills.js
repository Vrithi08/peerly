// Fix for SockJS/StompJS in Vite
if (typeof global === 'undefined') {
  window.global = window;
}
import { Buffer } from 'buffer';
window.Buffer = Buffer;
window.process = { env: {} };
