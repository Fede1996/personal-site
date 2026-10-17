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
