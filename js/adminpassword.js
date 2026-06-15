

(function () {
  const CORRECT_HASH = "04aa54d42ff86b69a78c00a235bf3b69f7e591981164545f15b7b75068e3f7f2";
  const SESSION_KEY = "nv_admin_auth";

  if (sessionStorage.getItem(SESSION_KEY) === "1") return;

  document.documentElement.style.visibility = "hidden";

  const overlay = document.createElement("div");
  overlay.innerHTML = `
    <div id="nv-gate" style="position:fixed;inset:0;background:#0a0a0a;display:flex;align-items:center;justify-content:center;z-index:99999;font-family:Inter,sans-serif;">
      <div style="background:#111;border:0.5px solid #2a2a2a;border-radius:12px;padding:2.5rem 2rem;width:320px;text-align:center;">
        <div style="font-family:'Playfair Display',serif;font-size:1.4rem;letter-spacing:0.2em;color:#fff;margin-bottom:0.25rem;">NOIR<span style="color:#888">VANE</span></div>
        <p style="font-size:12px;color:#555;margin:0 0 2rem;letter-spacing:0.05em;">Admin access only</p>
        <div style="text-align:left;margin-bottom:1rem;">
          <label style="font-size:12px;color:#666;display:block;margin-bottom:6px;letter-spacing:0.05em;">PASSWORD</label>
          <input id="nv-pw" type="password" placeholder="Enter password"
            style="width:100%;box-sizing:border-box;background:#1a1a1a;border:0.5px solid #333;border-radius:6px;color:#fff;padding:0.65rem 0.75rem;font-size:14px;outline:none;">
        </div>
        <button id="nv-btn" style="width:100%;background:#fff;color:#000;border:none;border-radius:6px;padding:0.65rem;font-size:14px;font-weight:500;cursor:pointer;">
          Unlock Dashboard
        </button>
        <p id="nv-err" style="color:#c0392b;font-size:12px;margin:0.75rem 0 0;display:none;">Incorrect password. Try again.</p>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  async function attempt() {
    const val = document.getElementById("nv-pw").value;
    const msgBuffer = new TextEncoder().encode(val);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const userHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    if (userHash === CORRECT_HASH) {
      sessionStorage.setItem(SESSION_KEY, "1");
      document.getElementById("nv-gate").remove();
      document.documentElement.style.visibility = "";
    } else {
      document.getElementById("nv-err").style.display = "block";
      document.getElementById("nv-pw").value = "";
      document.getElementById("nv-pw").focus();
    }
  }

  document.getElementById("nv-btn").addEventListener("click", attempt);
  document.getElementById("nv-pw").addEventListener("keydown", function (e) {
    if (e.key === "Enter") attempt();
  });

  document.documentElement.style.visibility = "visible";
})();