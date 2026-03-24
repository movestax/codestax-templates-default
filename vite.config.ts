import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

let componentTagger: (() => any) | undefined;
try { componentTagger = (await import("lovable-tagger")).componentTagger; } catch {}

// Error bridge: reports Vite build errors from preview iframe to parent app
function errorBridgePlugin() {
  return {
    name: 'error-bridge',
    transformIndexHtml(html: string) {
      const script = `<script>
(function(){
  if(window.parent===window)return;
  function r(m,s){try{window.parent.postMessage({type:'iframe-error',message:String(m).slice(0,500),stack:s?String(s).slice(0,1000):void 0},'*')}catch(e){}}
  new MutationObserver(function(ms){ms.forEach(function(m){m.addedNodes.forEach(function(n){if(n.tagName&&n.tagName.toLowerCase()==='vite-error-overlay')setTimeout(function(){try{var root=n.shadowRoot;if(!root)return;var msg=root.querySelector('.message-body'),f=root.querySelector('.file'),fr=root.querySelector('.frame');r((msg?msg.textContent:'')||'Vite build error',[f?f.textContent:'',fr?fr.textContent:''].filter(Boolean).join('\\n'))}catch(e){}},100)})})}).observe(document.documentElement,{childList:true,subtree:true});
  document.querySelectorAll('vite-error-overlay').forEach(function(n){setTimeout(function(){try{var root=n.shadowRoot;if(!root)return;var msg=root.querySelector('.message-body');r((msg?msg.textContent:'')||'Vite build error','')}catch(e){}},100)});
  window.addEventListener('error',function(e){if(e.message)r(e.message,e.filename?e.filename+':'+e.lineno:'')});
  window.addEventListener('unhandledrejection',function(e){r(e.reason?(e.reason.message||String(e.reason)):'Unhandled promise rejection',e.reason&&e.reason.stack?e.reason.stack:'')});
})();
</script>`;
      return html.replace('</head>', script + '</head>');
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    allowedHosts: true,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger?.(),
    errorBridgePlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
