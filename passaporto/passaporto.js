// Logica del builder del passaporto: selezione lune, anteprima e gate
// newsletter. Il PDF è in passaporto-pdf.js.
//
// Richiede dati-lune.js (const PIANETI) caricato prima di questo file.

(function () {
    'use strict';

    const GATE_KEY = 'uvdp-passaporto-iscrizione';

    const picker = document.getElementById('planet-picker');
    const nomeInput = document.getElementById('nome');
    const soprannomeInput = document.getElementById('soprannome');
    const previewIdentity = document.getElementById('preview-identity');
    const previewCount = document.getElementById('preview-count');
    const previewList = document.getElementById('preview-list');
    const generaBtn = document.getElementById('genera-pdf');
    const generateHint = document.getElementById('generate-hint');
    const avanzamento = document.getElementById('avanzamento');
    const avanzFill = document.getElementById('avanzamento-fill');
    const avanzTesto = document.getElementById('avanzamento-testo');
    const gate = document.getElementById('newsletter-gate');
    const gateConfirm = document.getElementById('conferma-iscrizione');

    if (!picker || typeof PIANETI === 'undefined') return;

    // ---------- Costruzione dei pannelli ----------
    PIANETI.forEach(pianeta => {
        const details = document.createElement('details');
        details.className = 'planet-panel';
        details.dataset.slug = pianeta.slug;

        const summary = document.createElement('summary');
        summary.innerHTML =
            '<span class="planet-dot" aria-hidden="true"></span>' +
            '<span class="planet-name"></span>' +
            '<span class="planet-theme"></span>' +
            '<span class="planet-count">0 lune selezionate</span>';
        summary.querySelector('.planet-dot').style.background =
            'radial-gradient(circle, rgba(96,43,160,0.85), rgba(96,43,160,0.35))';
        summary.querySelector('.planet-name').textContent = pianeta.nome;
        summary.querySelector('.planet-theme').textContent = pianeta.tema;
        details.appendChild(summary);

        const body = document.createElement('div');
        body.className = 'planet-panel-body';

        const actions = document.createElement('div');
        actions.className = 'planet-actions';
        const selectAll = document.createElement('button');
        selectAll.type = 'button';
        selectAll.className = 'select-all-btn';
        selectAll.textContent = 'Seleziona tutte le lune';
        actions.appendChild(selectAll);
        body.appendChild(actions);

        const grid = document.createElement('div');
        grid.className = 'moon-grid';
        pianeta.lune.forEach(luna => {
            const label = document.createElement('label');
            label.className = 'moon-choice';

            const check = document.createElement('input');
            check.type = 'checkbox';
            check.className = 'moon-check';
            check.value = pianeta.slug + '/' + luna.id;
            check.dataset.planet = pianeta.slug;
            check.dataset.moon = luna.id;

            const img = document.createElement('img');
            img.src = luna.icona;
            img.alt = '';

            const span = document.createElement('span');
            span.textContent = luna.nome;

            label.appendChild(check);
            label.appendChild(img);
            label.appendChild(span);
            grid.appendChild(label);
        });
        body.appendChild(grid);
        details.appendChild(body);
        picker.appendChild(details);

        selectAll.addEventListener('click', () => {
            const checks = grid.querySelectorAll('.moon-check');
            const allOn = Array.from(checks).every(c => c.checked);
            checks.forEach(c => { c.checked = !allOn; });
            update();
        });
    });

    // ---------- Stato selezione ----------
    function selectedMoons() {
        const scelte = [];
        picker.querySelectorAll('.moon-check:checked').forEach(check => {
            const pianeta = PIANETI.find(p => p.slug === check.dataset.planet);
            if (!pianeta) return;
            const luna = pianeta.lune.find(l => l.id === check.dataset.moon);
            if (!luna) return;
            let gruppo = scelte.find(s => s.pianeta.slug === pianeta.slug);
            if (!gruppo) {
                gruppo = { pianeta: pianeta, lune: [] };
                scelte.push(gruppo);
            }
            gruppo.lune.push(luna);
        });
        return scelte;
    }

    function update() {
        const scelte = selectedMoons();
        const totaleLune = scelte.reduce((n, s) => n + s.lune.length, 0);

        // Evidenzia le chip selezionate (classe, non :has(): più portabile)
        picker.querySelectorAll('.moon-choice').forEach(label => {
            const check = label.querySelector('.moon-check');
            label.classList.toggle('selezionata', !!(check && check.checked));
        });

        // Contatori per pianeta
        picker.querySelectorAll('.planet-panel').forEach(panel => {
            const n = panel.querySelectorAll('.moon-check:checked').length;
            panel.querySelector('.planet-count').textContent =
                n === 1 ? '1 luna selezionata' : n + ' lune selezionate';
        });

        // Anteprima identità
        const nome = (nomeInput.value || '').trim();
        const soprannome = (soprannomeInput.value || '').trim();
        if (nome && soprannome) {
            previewIdentity.textContent = nome + ' — «' + soprannome + '»';
        } else if (nome) {
            previewIdentity.textContent = nome;
        } else {
            previewIdentity.textContent = 'Il tuo nome comparirà qui.';
        }

        // Anteprima selezione
        if (totaleLune === 0) {
            previewCount.textContent = 'Nessuna luna selezionata: apri un pianeta e scegli quelle che ti parlano.';
        } else {
            const nPianeti = scelte.length;
            const pagine = totaleLune + 2; // copertina + retro (QR)
            previewCount.textContent =
                totaleLune + (totaleLune === 1 ? ' luna' : ' lune') +
                ' su ' + nPianeti + (nPianeti === 1 ? ' pianeta' : ' pianeti') +
                ' → ' + pagine + ' pagine totali, copertina e QR compresi.';
        }

        previewList.innerHTML = '';
        scelte.forEach(gruppo => {
            const li = document.createElement('li');
            const titolo = document.createElement('div');
            titolo.className = 'preview-planet';
            titolo.textContent = gruppo.pianeta.nome + ' · ' + gruppo.pianeta.tema;
            const tags = document.createElement('div');
            tags.className = 'preview-moons';
            gruppo.lune.forEach(luna => {
                const tag = document.createElement('span');
                tag.className = 'preview-tag';
                tag.textContent = luna.nome;
                tags.appendChild(tag);
            });
            li.appendChild(titolo);
            li.appendChild(tags);
            previewList.appendChild(li);
        });

        // Abilitazione del download
        const pronto = nome.length > 0 && totaleLune > 0;
        generaBtn.disabled = !pronto;
        generateHint.textContent = pronto
            ? 'Tutto pronto: premi "Genera il PDF".'
            : 'Inserisci il nome e scegli almeno una luna per abilitare il download.';
    }

    picker.addEventListener('change', update);
    nomeInput.addEventListener('input', update);
    soprannomeInput.addEventListener('input', update);
    update();

    // ---------- Gate newsletter ----------
    // Il via libera all'iscrizione: in localStorage se possibile, almeno per
    // questa sessione se localStorage non è disponibile (es. navigazione
    // privata di Safari), altrimenti il gate si riaprirebbe all'infinito.
    let sbloccato = false;
    function isSubscribed() {
        if (sbloccato) return true;
        try { return localStorage.getItem(GATE_KEY) === 'ok'; }
        catch (e) { return false; }
    }

    // Messaggio accanto al pulsante di generazione: è l'unico posto dove
    // l'utente guarda quando non succede nulla.
    function messaggio(testo, tipo) {
        generateHint.textContent = testo;
        generateHint.dataset.tipo = tipo || 'info';
        if (tipo === 'errore') {
            generateHint.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // Barra di avanzamento della generazione: mostra che la pagina lavora.
    function aggiornaAvanzamento(etichetta, fatti, totale) {
        if (!avanzamento) return;
        const perc = totale > 0 ? Math.round((fatti / totale) * 100) : 0;
        if (avanzFill) avanzFill.style.width = perc + '%';
        if (avanzTesto) {
            avanzTesto.textContent = etichetta + (totale > 1 ? '  (' + fatti + ' di ' + totale + ')' : '');
        }
    }

    async function generate() {
        const scelte = selectedMoons();
        const nome = (nomeInput.value || '').trim();
        const soprannome = (soprannomeInput.value || '').trim();

        // Prima di tutto: se manca qualcosa, dillo invece di non fare nulla.
        if (!nome) {
            messaggio('Manca il nome: scrivilo qui sopra per poter creare il passaporto.', 'errore');
            nomeInput.focus();
            return false;
        }
        if (!scelte.length) {
            messaggio('Non hai ancora scelto nessuna luna: apri un pianeta e seleziona quelle che ti parlano.', 'errore');
            return false;
        }

        if (!isSubscribed()) {
            gate.hidden = false;
            // L'iframe del form parte senza src: un iframe lazy dentro un
            // contenitore hidden non carica mai nemmeno dopo lo show. Qui,
            // quando il gate diventa visibile, assegniamo il src una volta.
            const iframe = gate.querySelector('#gate-frame');
            if (iframe && !iframe.src && iframe.dataset.src) {
                iframe.src = iframe.dataset.src;
            }
            gate.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return false;
        }

        if (typeof window.generaPassaportoPDF !== 'function') {
            messaggio('Qualcosa non ha funzionato nel caricamento del generatore: ricarica la pagina e riprova.', 'errore');
            return false;
        }

        // Stato "in lavorazione": con tutte le lune selezionate la
        // generazione richiede qualche secondo, e senza un segnale visibile
        // sembra tutto bloccato. Qui spinner + barra di avanzamento.
        const etichetta = generaBtn.dataset.etichettaOrigine || generaBtn.textContent;
        generaBtn.dataset.etichettaOrigine = etichetta;
        generaBtn.disabled = true;
        generaBtn.classList.add('in-corso');
        generaBtn.innerHTML = '<span class="spinner" aria-hidden="true"></span>Generazione in corso…';
        avanzamento.hidden = false;
        aggiornaAvanzamento('Preparo il tuo passaporto…', 0, 1);
        messaggio('Qualche secondo e il PDF è pronto.', 'info');

        try {
            await window.generaPassaportoPDF(
                { nome: nome, soprannome: soprannome, scelte: scelte },
                (p) => aggiornaAvanzamento(p.etichetta, p.fatti, p.totale)
            );
            aggiornaAvanzamento('Fatto!', 1, 1);
            messaggio('Fatto! Il passaporto è stato scaricato: controlla la cartella dei download.', 'info');
            return true;
        } catch (e) {
            messaggio('Non sono riuscito a generare il PDF' + (e && e.message ? ': ' + e.message : '') + '. Riprova, o ricarica la pagina.', 'errore');
            return false;
        } finally {
            generaBtn.disabled = false;
            generaBtn.classList.remove('in-corso');
            generaBtn.textContent = etichetta;
            // la barra resta un attimo sul risultato, poi si richiude
            setTimeout(() => { avanzamento.hidden = true; }, 2500);
            update();
        }
    }

    generaBtn.addEventListener('click', () => { generate(); });

    gateConfirm.addEventListener('click', async () => {
        sbloccato = true;
        try { localStorage.setItem(GATE_KEY, 'ok'); } catch (e) { /* localStorage non disponibile */ }
        // Il via libera è dato: il gate non serve più. Se poi manca il nome
        // o le lune, è generate() a dirlo con un messaggio chiaro.
        gate.hidden = true;
        await generate();
    });
})();
