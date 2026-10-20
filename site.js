// Comportamenti comuni a tutte le pagine: header su scroll, menu mobile
// accessibile, flip-card attivabili da tastiera e da touch.
// Caricato con <script src="site.js" defer></script>.

(function () {
    'use strict';

    // ---------- Header opaco allo scroll ----------
    const header = document.querySelector('header');
    if (header) {
        const aggiornaHeader = () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
        };
        window.addEventListener('scroll', aggiornaHeader);
        // Anche al caricamento e al ridimensionamento: se la pagina si apre
        // già scorso l'header deve subito avere il suo sfondo
        window.addEventListener('resize', aggiornaHeader);
        aggiornaHeader();
    }

    // ---------- Menu mobile ----------
    const menu = document.querySelector('.mobile-menu');
    const hamburger = document.querySelector('.hamburger');

    // L'attributo inert (tutto il menu fuori dal tab order quando è chiuso)
    // non è supportato ovunque: qui un fallback che toglie e rimette il
    // tabindex sui contenuti del menu.
    const supportaInert = typeof HTMLElement !== 'undefined' && 'inert' in HTMLElement.prototype;

    function rendiMenuInerte(inerte) {
        if (!menu) return;
        if (supportaInert) {
            menu.inert = inerte;
            return;
        }
        menu.querySelectorAll('a, button').forEach(el => {
            if (inerte) {
                if (!el.hasAttribute('tabindex')) {
                    el.dataset.tabindexSalvato = '1';
                    el.setAttribute('tabindex', '-1');
                }
            } else if (el.dataset.tabindexSalvato) {
                el.removeAttribute('tabindex');
                delete el.dataset.tabindexSalvato;
            }
        });
    }

    function setMenuState(open) {
        if (!menu) return;
        menu.classList.toggle('open', open);
        // Blocca lo scroll della pagina quando il menu è aperto
        document.body.style.overflow = open ? 'hidden' : 'auto';
        if (hamburger) hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
        rendiMenuInerte(!open);
        if (open) {
            const closeBtn = menu.querySelector('.close-btn');
            if (closeBtn) closeBtn.focus();
        }
    }

    window.toggleMenu = function () {
        if (!menu) return;
        setMenuState(!menu.classList.contains('open'));
    };

    if (menu) {
        // Stato iniziale: chiuso e non tabbabile
        setMenuState(false);

        const closeBtn = menu.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                setMenuState(false);
                if (hamburger) hamburger.focus();
            });
        }

        // Chiusura automatica al click su una voce
        menu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                setMenuState(false);
            });
        });

        // Escape chiude e restituisce il focus
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && menu.classList.contains('open')) {
                setMenuState(false);
                if (hamburger) hamburger.focus();
            }
        });

        // Focus trap: con il menu aperto, Tab resta dentro il menu
        menu.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab' || !menu.classList.contains('open')) return;
            const focusables = menu.querySelectorAll('a, button');
            if (!focusables.length) return;
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        });
    }

    // ---------- Torna su ----------
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        const aggiornaTornaSu = () => {
            backToTop.classList.toggle('visibile', window.scrollY > 400);
        };
        window.addEventListener('scroll', aggiornaTornaSu, { passive: true });
        aggiornaTornaSu();
        backToTop.addEventListener('click', () => {
            // scroll istantaneo per chi ha disattivato le animazioni
            const soft = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            window.scrollTo({ top: 0, behavior: soft ? 'smooth' : 'auto' });
        });
    }

    // ---------- Form Brevo incorporato ----------
    // Il form non è più un iframe (sul quale il CSS del sito non può agire):
    // è HTML in pagina e viene inviato in AJAX allo stesso endpoint che usava
    // lo script di Brevo — POST a /serve/…?isAjax=1, risposta JSON.
    //
    // L'endpoint di Brevo accetta anche una mail già in lista (upsert) e
    // risponde comunque con success: non dice "utente già iscritto". Qui
    // teniamo quindi traccia delle iscrizioni riuscite da questo browser e,
    // se la mail è già presente, evitiamo il POST e lo diciamo all'utente.
    // Resta fuori dalle iscrizioni fatte da altri dispositivi, che per noi
    // sono indistinguibili dai nuovi arrivi.
    const ISCRITTI_KEY = 'uvdp-breve-iscritti';

    function emailIscritte() {
        try {
            const raw = localStorage.getItem(ISCRITTI_KEY);
            const elenco = raw ? JSON.parse(raw) : [];
            return Array.isArray(elenco) ? elenco : [];
        } catch (e) {
            return [];
        }
    }

    function segnaIscritta(email) {
        if (!email) return;
        try {
            const elenco = emailIscritte();
            if (!elenco.includes(email)) {
                elenco.push(email);
                localStorage.setItem(ISCRITTI_KEY, JSON.stringify(elenco));
            }
        } catch (e) { /* localStorage non disponibile */ }
    }

    function normalizzaEmail(valore) {
        return (valore || '').trim().toLowerCase();
    }

    document.querySelectorAll('form.brevo-form').forEach((form) => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const msg = form.querySelector('.brevo-messaggio');
            const btn = form.querySelector('.brevo-submit');
            const hp = form.querySelector('input[name="email_address_check"]');
            const emailInput = form.querySelector('input[name="EMAIL"]');
            const email = normalizzaEmail(emailInput && emailInput.value);

            function mostra(tipo, testo) {
                if (!msg) return;
                msg.hidden = false;
                msg.dataset.tipo = tipo;
                msg.textContent = testo;
            }

            // Dice a chi contiene il form (il gate del passaporto) come è
            // andata, così può procedere o restare dov'è.
            function notifica(esito, testo) {
                form.dispatchEvent(new CustomEvent('brevo:esito', {
                    bubbles: true,
                    detail: { esito: esito, messaggio: testo, email: email }
                }));
            }

            // Honeypot compilato: è un bot. Fingo il successo e non invio nulla.
            if (hp && hp.value) {
                mostra('ok', 'La tua iscrizione è andata a buon fine.');
                return;
            }

            // Captcha di Brevo (se attivo sul form): senza token non inviamo.
            // Al momento il form servito non lo espone, ma se lo aggiungono
            // deve valere anche per i nostri POST.
            const captchaBox = form.querySelector('.sib-captcha, .g-recaptcha, .g-recaptcha-v3');
            const body = new FormData(form);
            if (captchaBox && window.grecaptcha && typeof window.grecaptcha.getResponse === 'function') {
                const token = window.grecaptcha.getResponse(captchaBox);
                if (!token) {
                    const testo = 'Conferma che non sei un robot e riprova.';
                    mostra('errore', testo);
                    notifica('errore', testo);
                    return;
                }
                if (!body.has('g-recaptcha-response')) {
                    body.append('g-recaptcha-response', token);
                }
            }

            // Mail già iscritta da questo browser: non reinviare, avvisa e basta.
            if (email && emailIscritte().includes(email)) {
                const testo = 'Utente già iscritto: la tua email era già in lista, non è stato necessario aggiungerla di nuovo.';
                mostra('ok', testo);
                notifica('gia-iscritto', testo);
                return;
            }

            // Nuova iscrizione: serve l'opt-in. È validato qui e non con
            // required sul checkbox, così chi è già iscritto non deve
            // spuntarlo di nuovo per scaricare il passaporto.
            const optIn = form.querySelector('input[name="OPT_IN"]');
            if (optIn && !optIn.checked) {
                const testo = 'Serve il tuo consenso: spunta la casella dell\'informativa per iscriverti.';
                mostra('errore', testo);
                notifica('errore', testo);
                if (optIn.focus) optIn.focus();
                return;
            }

            if (btn) btn.disabled = true;
            try {
                const res = await fetch(form.action + '?isAjax=1', {
                    method: 'POST',
                    body: body,
                });
                const data = await res.json();
                if (data.redirect) {
                    window.top.location.replace(data.redirect);
                    return;
                }
                if (data.success) {
                    const testo = 'La tua iscrizione è andata a buon fine.';
                    segnaIscritta(email);
                    mostra('ok', testo);
                    notifica('ok', testo);
                    form.reset();
                } else {
                    const erroreCampo = data.errors && Object.values(data.errors)[0];
                    const testo = erroreCampo || data.message || 'La tua iscrizione non è andata a buon fine. Riprova.';
                    // Se un giorno l'endpoint rifiutasse le mail già in lista,
                    // lo trattiamo come "utente già iscritto" e non come errore.
                    if (/already|exist|duplicate/i.test(testo)) {
                        const avviso = 'Utente già iscritto: la tua email era già in lista, non è stato necessario aggiungerla di nuovo.';
                        segnaIscritta(email);
                        mostra('ok', avviso);
                        notifica('gia-iscritto', avviso);
                    } else {
                        mostra('errore', testo);
                        notifica('errore', testo);
                    }
                }
            } catch (err) {
                const testo = 'La tua iscrizione non è andata a buon fine. Riprova.';
                mostra('errore', testo);
                notifica('errore', testo);
            } finally {
                if (btn) btn.disabled = false;
            }
        });
    });

    // ---------- Flip-card (solo homepage) ----------
    // Pattern disclosure: un pulsante sul fronte apre il retro, che contiene
    // i link dei temi. I due pulsanti stanno fuori dalle facce animate, così
    // il focus si sposta subito senza attendere lo scambio di visibility.
    const cards = document.querySelectorAll('.flip-card:not(.card-disble)');
    if (!cards.length) return;

    function closeCard(card, restoreFocus) {
        card.classList.remove('flipped');
        const toggle = card.querySelector('.flip-toggle');
        if (toggle) {
            toggle.setAttribute('aria-expanded', 'false');
            if (restoreFocus) toggle.focus();
        }
    }

    function openCard(card) {
        // Una sola card girata alla volta (comportamento già presente)
        document.querySelectorAll('.flip-card.flipped').forEach(c => {
            if (c !== card) closeCard(c, false);
        });
        card.classList.add('flipped');
        const toggle = card.querySelector('.flip-toggle');
        if (toggle) toggle.setAttribute('aria-expanded', 'true');
        // Il focus va sul pulsante di chiusura: è già visibile e tabbabile
        const closeBtn = card.querySelector('.flip-close');
        if (closeBtn) closeBtn.focus();
    }

    cards.forEach(card => {
        const toggle = card.querySelector('.flip-toggle');
        const closeBtn = card.querySelector('.flip-close');

        if (toggle) {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                if (card.classList.contains('flipped')) {
                    closeCard(card, true);
                } else {
                    openCard(card);
                }
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeCard(card, true);
            });
        }

        card.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && card.classList.contains('flipped')) {
                closeCard(card, true);
            }
        });
    });
})();
