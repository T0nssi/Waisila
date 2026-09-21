/* ==========================================================================
   EPOXY PRO — behaviour (vanilla JS, no dependencies, ~2.5 KB)
   1) mobile menu   2) lead-form validation + submit
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- 1. Mobile menu ---------- */
  var toggle = document.getElementById('navToggle');
  var menu   = document.getElementById('navMenu');

  if (toggle && menu) {
    var setOpen = function (open) {
      menu.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'ปิดเมนู' : 'เปิดเมนู');
    };

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    // Close after picking a destination, and on Esc
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });
    // Leaving mobile width with the panel open would otherwise strand it
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1000) setOpen(false);
    });
  }

  /* ---------- 2. Lead form ---------- */
  var form = document.getElementById('quoteForm');
  if (!form) return;

  var statusEl = document.getElementById('quoteStatus');
  var submitBtn = document.getElementById('quoteSubmit');
  var CONTACT_FALLBACK =
    'กรุณาโทร <a href="tel:0812345678">081-234-5678</a> ' +
    'หรือทัก LINE <a href="https://line.me/R/ti/p/@epoxypro" target="_blank" rel="noopener">@epoxypro</a> แทนครับ';

  function showStatus(kind, html) {
    statusEl.className = 'form-status is-shown form-status--' + kind;
    statusEl.innerHTML = html;
  }

  function setFieldError(input, show) {
    var err = document.getElementById('err-' + input.id);
    input.setAttribute('aria-invalid', show ? 'true' : 'false');
    if (err) err.classList.toggle('is-shown', show);
  }

  // Thai mobile/landline: 9–10 digits once spaces, dashes and +66 are stripped
  function normalisePhone(value) {
    return String(value).replace(/[\s\-().]/g, '').replace(/^\+?66/, '0');
  }
  function phoneIsValid(value) {
    var digits = normalisePhone(value);
    return /^0\d{8,9}$/.test(digits);
  }

  var nameInput  = document.getElementById('qName');
  var phoneInput = document.getElementById('qPhone');

  // Clear an error as soon as the visitor starts fixing it
  [nameInput, phoneInput].forEach(function (input) {
    input.addEventListener('input', function () {
      if (input.getAttribute('aria-invalid') === 'true') setFieldError(input, false);
    });
  });

  function validate() {
    var ok = true;
    var nameBad = nameInput.value.trim().length < 2;
    setFieldError(nameInput, nameBad);
    if (nameBad) ok = false;

    var phoneBad = !phoneIsValid(phoneInput.value);
    setFieldError(phoneInput, phoneBad);
    if (phoneBad) ok = false;

    if (!ok) (nameBad ? nameInput : phoneInput).focus();
    return ok;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (form.botcheck.value) return;          // honeypot tripped — silently drop
    if (!validate()) {
      showStatus('err', 'กรุณาตรวจสอบข้อมูลที่ทำเครื่องหมายไว้อีกครั้ง');
      return;
    }

    var key = (form.dataset.endpointKey || '').trim();

    // No endpoint configured yet. Say so honestly — never fake a success message,
    // or the owner loses leads without ever knowing.
    if (!key) {
      showStatus('err',
        'ขออภัย ระบบส่งฟอร์มยังไม่ได้เชื่อมต่อ ข้อความของคุณยังไม่ถูกส่ง<br>' + CONTACT_FALLBACK);
      console.warn('[quoteForm] data-endpoint-key is empty — see README-TH.md step 3.');
      return;
    }

    var payload = {
      access_key: key,
      subject: 'ขอใบเสนอราคาจากเว็บไซต์ — ' + nameInput.value.trim(),
      from_name: 'EPOXY PRO Website',
      name:     nameInput.value.trim(),
      phone:    normalisePhone(phoneInput.value),
      area:     document.getElementById('qArea').value,
      job_type: document.getElementById('qType').value,
      message:  document.getElementById('qNote').value.trim()
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'กำลังส่ง…';
    statusEl.className = 'form-status';

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (res) { return res.json().then(function (d) { return { ok: res.ok, data: d }; }); })
      .then(function (r) {
        // Only claim success when the endpoint actually confirms it
        if (r.ok && r.data && r.data.success) {
          showStatus('ok', '✅ ส่งข้อมูลเรียบร้อย ทีมงานจะติดต่อกลับภายใน 1 วันทำการ');
          form.reset();
        } else {
          throw new Error((r.data && r.data.message) || 'submit failed');
        }
      })
      .catch(function (err) {
        console.error('[quoteForm]', err);
        showStatus('err', '❌ ส่งไม่สำเร็จ ข้อความของคุณยังไม่ถูกส่ง<br>' + CONTACT_FALLBACK);
      })
      .then(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'ส่งข้อมูล ขอใบเสนอราคา';
      });
  });
})();
