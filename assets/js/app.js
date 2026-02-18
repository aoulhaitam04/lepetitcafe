
(function(){
  const $ = (s, el=document)=>el.querySelector(s);
  const $$ = (s, el=document)=>Array.from(el.querySelectorAll(s));

  // Mobile menu
  const burger = $('#hamburger');
  const drawer = $('#mobileDrawer');
  if(burger && drawer){
    burger.addEventListener('click', ()=>{
      const open = drawer.getAttribute('data-open') === 'true';
      drawer.setAttribute('data-open', String(!open));
      drawer.classList.toggle('hidden', open);
      burger.setAttribute('aria-expanded', String(!open));
    });
  }

  // Active link highlight
  const path = (location.pathname.split('/').pop() || 'index.html');
  $$('.navlinks a, #mobileDrawer a').forEach(a=>{
    const href = a.getAttribute('href');
    if(href === path) a.classList.add('active');
  });

  // Menu tabs (speisekarte)
  const tabs = $$('.tab');
  if(tabs.length){
    const panels = $$('.menu-panel');
    const show = (id)=>{
      tabs.forEach(t=>t.classList.toggle('active', t.dataset.target===id));
      panels.forEach(p=>p.classList.toggle('hidden', p.id!==id));
    };
    tabs.forEach(t=>t.addEventListener('click', ()=>show(t.dataset.target)));
    show(tabs[0].dataset.target);
  }

  // Cookie banner (essential-only)
  const cookieKey = "lpc_cookie_consent_v1";
  const cookie = $('#cookieBanner');
  if(cookie && !localStorage.getItem(cookieKey)){
    cookie.style.display = 'block';
    $('#cookieAccept')?.addEventListener('click', ()=>{
      localStorage.setItem(cookieKey, 'accepted');
      cookie.style.display = 'none';
    });
  } else if(cookie){
    cookie.style.display = 'none';
  }

  // Reservation rules
  const resForm = $('#reservationForm');
  if(resForm){
    const dateEl = $('#resDate');
    const timeEl = $('#resTime');
    const msgEl = $('#resMessage');

    const OPEN_TIME = "10:30";
    const LAST_TIME = "16:30"; // last reservation time
    // closed Wednesday (getDay(): Sun 0 ... Sat 6). Wednesday is 3.
    const CLOSED_DAY = 3;

    // Set input limits
    if(timeEl){
      timeEl.min = OPEN_TIME;
      timeEl.max = LAST_TIME;
      timeEl.step = 900; // 15 minutes
    }

    // date: min today
    if(dateEl){
      const today = new Date();
      const pad = (n)=>String(n).padStart(2,'0');
      const iso = `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`;
      dateEl.min = iso;
    }

    const setMessage = (text, ok=false)=>{
      if(!msgEl) return;
      msgEl.textContent = text;
      msgEl.className = ok ? "success" : "notice";
      msgEl.classList.remove('hidden');
    };

    const isWednesday = (d)=>{
      if(!d) return false;
      const dt = new Date(d + "T00:00:00");
      return dt.getDay() === CLOSED_DAY;
    };

    const timeInRange = (t)=>{
      if(!t) return false;
      return (t >= OPEN_TIME && t <= LAST_TIME);
    };

    // Live feedback
    dateEl?.addEventListener('change', ()=>{
      if(isWednesday(dateEl.value)){
        setMessage("Mittwoch ist Ruhetag – bitte wähle einen anderen Tag.");
      } else {
        msgEl?.classList.add('hidden');
      }
    });
    timeEl?.addEventListener('change', ()=>{
      if(!timeInRange(timeEl.value)){
        setMessage(`Reservierungen sind nur zwischen ${OPEN_TIME} und ${LAST_TIME} möglich.`);
      } else {
        msgEl?.classList.add('hidden');
      }
    });

    resForm.addEventListener('submit', (e)=>{
      // Hard validation
      if(isWednesday(dateEl?.value)){
        e.preventDefault();
        setMessage("Mittwoch ist Ruhetag – bitte wähle einen anderen Tag.");
        return;
      }
      if(!timeInRange(timeEl?.value)){
        e.preventDefault();
        setMessage(`Reservierungen sind nur zwischen ${OPEN_TIME} und ${LAST_TIME} möglich.`);
        return;
      }
      // if user selected today, ensure time not in the past (optional)
      try{
        const now = new Date();
        if(dateEl?.value){
          const chosenDate = new Date(dateEl.value + "T00:00:00");
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          if(chosenDate.getTime() === today.getTime() && timeEl?.value){
            const [hh, mm] = timeEl.value.split(':').map(Number);
            const chosen = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, 0);
            if(chosen.getTime() < now.getTime()){
              e.preventDefault();
              setMessage("Bitte wähle eine Uhrzeit in der Zukunft.");
              return;
            }
          }
        }
      }catch(_){}
    });
  }
})();
