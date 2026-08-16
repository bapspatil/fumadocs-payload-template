/**
 * Blocking theme bootstrap that matches Fumadocs RootProvider defaults:
 * class attribute, `theme` storage key, system default, light/dark values.
 *
 * next-themes cannot render this `<script>` from a Client Component on
 * React 19 / Next.js 16, so the server layout injects it instead.
 */
export const themeInitScript = `(function(){try{var d=document.documentElement,t=["light","dark"],s=localStorage.getItem("theme")||"system",m=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light",r=s==="system"?m:s;d.classList.remove.apply(d.classList,t);d.classList.add(r);if(r==="light"||r==="dark")d.style.colorScheme=r}catch(e){}})();`;
