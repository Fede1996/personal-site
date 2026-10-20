// Generazione del PDF del passaporto, interamente nel browser.
// Richiede jsPDF (window.jspdf.jsPDF) e qrcode-generator (window.qrcode).

(function () {
    'use strict';

    const SITO_URL = 'https://www.gorrinoofficial.it';
    const SITO_QR_MSG = 'Scarica anche tu il tuo passaporto';

    // Colori coerenti col sito
    const CREMA = [247, 231, 212];
    const VIOLA = [96, 43, 160];
    const INCHIOSTRO = [33, 21, 51];
    const GRIGIO = [90, 71, 120];

    // ---------- Utilità ----------
    // Le icone originali pesano centinaia di KB l'una (34 MB in tutto) e
    // finirebbero nel PDF a piena risoluzione: su un telefono la
    // generazione restava bloccata per decine di secondi. Le riduciamo qui
    // a una misura più che sufficiente (nel PDF sono ~22 mm) e passiamo a
    // jsPDF il risultato, non l'originale.
    const LATO_ICONA = 128;

    function caricaImmagine(src) {
        return new Promise(resolve => {
            const img = new Image();
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = canvas.height = LATO_ICONA;
                    const ctx = canvas.getContext('2d');
                    // La qualità "high" del ridimensionamento viene calcolata
                    // al momento della codifica e costa oltre 200 ms per icona:
                    // con quarantotto lune era questo a bloccare la pagina.
                    // Con "medium" il risultato è identico a occhio e costa
                    // meno di un millisecondo.
                    ctx.imageSmoothingQuality = 'medium';
                    // Sfondo come la pagina del PDF: se l'icona ha angoli
                    // trasparenti non resta un quadrato bianco.
                    ctx.fillStyle = '#f7e7d4';
                    ctx.fillRect(0, 0, LATO_ICONA, LATO_ICONA);
                    // Mantiene le proporzioni e centra, senza deformare
                    const l = Math.max(img.naturalWidth, img.naturalHeight) || 1;
                    const s = LATO_ICONA / l;
                    const w = img.naturalWidth * s;
                    const h = img.naturalHeight * s;
                    ctx.drawImage(img, (LATO_ICONA - w) / 2, (LATO_ICONA - h) / 2, w, h);
                    // JPEG invece di PNG: la codifica PNG di quarantotto
                    // immagini era ciò che bloccava il telefono. Lo sfondo
                    // crema disegnato sopra fa sparire i bordi.
                    resolve(canvas.toDataURL('image/jpeg', 0.85));
                } catch (e) {
                    resolve(null);
                }
            };
            img.onerror = () => resolve(null);
            img.src = src;
        });
    }

    // Lascia respirare l'interfaccia fra una pagina e l'altra: senza questo
    // respiro il browser resta occupato e sembra bloccato.
    function respiro() {
        return new Promise(r => setTimeout(r, 0));
    }

    function qrPngDataUrl(testo) {
        // Il canvas disegna i moduli del QR e produce una PNG pulita,
        // compatibile con addImage di jsPDF (il dataURL nativo di
        // qrcode-generator è GIF, non sempre supportata).
        const qr = qrcode(0, 'M');
        qr.addData(testo);
        qr.make();
        const n = qr.getModuleCount();
        const cella = 8;
        const margine = 4 * cella;
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = n * cella + margine * 2;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#211533';
        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                if (qr.isDark(r, c)) {
                    ctx.fillRect(margine + c * cella, margine + r * cella, cella, cella);
                }
            }
        }
        return canvas.toDataURL('image/png');
    }

    function iniziali(testo) {
        return (testo || '?')
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map(p => p.charAt(0).toUpperCase())
            .join('');
    }

    // ---------- Pagine ----------
    function paginaCopertina(doc, dati) {
        const W = doc.internal.pageSize.getWidth();
        const H = doc.internal.pageSize.getHeight();

        doc.setFillColor(...CREMA);
        doc.rect(0, 0, W, H, 'F');

        // Doppio bordo viola, stile documento
        doc.setDrawColor(...VIOLA);
        doc.setLineWidth(1.2);
        doc.rect(12, 12, W - 24, H - 24);
        doc.setLineWidth(0.3);
        doc.rect(16, 16, W - 32, H - 32);

        doc.setTextColor(...VIOLA);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.text('UNA VOCE DAL PROFONDO', W / 2, 48, { align: 'center' });

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(28);
        doc.text('PASSAPORTO', W / 2, 78, { align: 'center' });
        doc.text('NEURODIVERGENTE', W / 2, 92, { align: 'center' });

        doc.setLineWidth(0.6);
        doc.line(W / 2 - 30, 102, W / 2 + 30, 102);

        doc.setTextColor(...INCHIOSTRO);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.text('intestato a', W / 2, 120, { align: 'center' });

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.text(dati.nome, W / 2, 134, { align: 'center' });

        if (dati.soprannome) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(13);
            doc.setTextColor(...VIOLA);
            doc.text('Esploratore: ' + dati.soprannome, W / 2, 148, { align: 'center' });
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(...GRIGIO);
        const data = new Date().toLocaleDateString('it-IT', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
        doc.text('Rilasciato il ' + data, W / 2, H - 52, { align: 'center' });

        doc.setFontSize(10);
        doc.text('Ogni luna è un tema esplorato insieme.', W / 2, H - 40, { align: 'center' });
        doc.text('Questo passaporto non è uno strumento clinico: è una mappa.', W / 2, H - 32, { align: 'center' });
    }

    function paginaPianeta(doc, gruppo, immagini) {
        const W = doc.internal.pageSize.getWidth();
        const H = doc.internal.pageSize.getHeight();

        doc.setFillColor(...CREMA);
        doc.rect(0, 0, W, H, 'F');

        // Fascia intestazione
        doc.setFillColor(...VIOLA);
        doc.rect(0, 0, W, 34, 'F');
        doc.setTextColor(...CREMA);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text(gruppo.pianeta.nome.toUpperCase(), 20, 16);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.text(gruppo.pianeta.tema, 20, 26);

        doc.setTextColor(...INCHIOSTRO);
        doc.setFontSize(9);
        doc.text('Le lune che hai scelto', W - 20, 26, { align: 'right' });

        // Griglia 2 colonne delle lune
        const colX = [20, W / 2 + 5];
        const larghezzaCol = W / 2 - 30;
        let y = 50;
        const rigaH = 34;

        gruppo.lune.forEach((luna, i) => {
            const col = i % 2;
            const x = colX[col];
            if (col === 0 && i > 0) y += rigaH;
            if (y + rigaH > H - 20) return; // pagina piena: le lune successive non entrano

            const chiave = gruppo.pianeta.slug + '/' + luna.id;
            const img = immagini[chiave];

            // Icona della luna, oppure un cerchio con le iniziali
            const iconaX = x;
            const iconaY = y;
            const iconaR = 11;
            if (img) {
                try {
                    doc.addImage(img, 'JPEG', iconaX, iconaY, iconaR * 2, iconaR * 2);
                } catch (e) {
                    imgFallback(doc, iconaX, iconaY, iconaR, luna.nome);
                }
            } else {
                imgFallback(doc, iconaX, iconaY, iconaR, luna.nome);
            }

            const testoX = x + iconaR * 2 + 6;
            const testoLar = larghezzaCol - iconaR * 2 - 6;

            // Il nome della condizione può essere lungo ("Disturbo Evitante
            // di Personalità"): lo mandiamo a capo su due righe — e se non
            // bastano ne rimpiccioliamo il corpo — invece di stampare solo la
            // prima riga e tagliare il resto.
            doc.setFont('helvetica', 'bold');
            let nomeCorpo = 11;
            let nomeRighe;
            for (;;) {
                doc.setFontSize(nomeCorpo);
                nomeRighe = doc.splitTextToSize(luna.nome, testoLar);
                if (nomeRighe.length <= 2 || nomeCorpo <= 8) break;
                nomeCorpo -= 0.5;
            }
            nomeRighe = nomeRighe.slice(0, 2);

            doc.setTextColor(...INCHIOSTRO);
            doc.text(nomeRighe, testoX, y + 8);

            // Il motto scende sotto l'ultima riga del nome, senza toccarlo
            // (passoNome è l'altezza di una riga in mm: il corpo è in punti).
            const passoNome = nomeCorpo * 1.15 / 2.8346;
            const mottoY = y + 8 + (nomeRighe.length - 1) * passoNome + 7;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(...GRIGIO);
            const mottoRighe = doc.splitTextToSize(luna.motto, testoLar);
            doc.text(mottoRighe.slice(0, 2), testoX, mottoY);
        });

        // Piè di pagina del pianeta
        doc.setFontSize(8);
        doc.setTextColor(...GRIGIO);
        doc.text('Una Voce Dal Profondo — ' + gruppo.pianeta.nome, 20, H - 12);
    }

    function imgFallback(doc, x, y, r, nome) {
        doc.setFillColor(...VIOLA);
        doc.circle(x + r, y + r, r, 'F');
        doc.setTextColor(...CREMA);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(iniziali(nome), x + r, y + r + 1, { align: 'center' });
    }

    function paginaQr(doc) {
        const W = doc.internal.pageSize.getWidth();
        const H = doc.internal.pageSize.getHeight();

        doc.setFillColor(...CREMA);
        doc.rect(0, 0, W, H, 'F');

        doc.setTextColor(...VIOLA);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text('CONDIVIDI LA ROTTA', W / 2, 60, { align: 'center' });

        doc.setTextColor(...INCHIOSTRO);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.text('Chi ami merita la sua mappa.', W / 2, 74, { align: 'center' });

        // QR verso il sito
        const qrSize = 40;
        const qrX = (W - qrSize) / 2;
        const qrY = 92;
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 10, 3, 3, 'F');
        try {
            doc.addImage(qrPngDataUrl(SITO_URL), 'PNG', qrX, qrY, qrSize, qrSize);
        } catch (e) {
            doc.setDrawColor(...VIOLA);
            doc.rect(qrX, qrY, qrSize, qrSize);
            doc.text('QR', qrX + qrSize / 2, qrY + qrSize / 2, { align: 'center' });
        }

        doc.setTextColor(...VIOLA);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text(SITO_QR_MSG, W / 2, qrY + qrSize + 22, { align: 'center' });

        doc.setTextColor(...INCHIOSTRO);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.text(SITO_URL, W / 2, qrY + qrSize + 34, { align: 'center' });

        doc.setTextColor(...GRIGIO);
        doc.setFontSize(9);
        doc.text('Passaporto generato da Una Voce Dal Profondo', W / 2, H - 28, { align: 'center' });
        doc.text('Le schede sono divulgazione: non sostituiscono il parere di un professionista.', W / 2, H - 20, { align: 'center' });
    }

    // ---------- Orchestrazione ----------
    // onProgress (facoltativo) riceve { etichetta, fatti, totale }: serve
    // alla pagina per mostrare che il lavoro sta procedendo.
    async function generaPassaportoPDF(dati, onProgress) {
        const avanza = (etichetta, fatti, totale) => {
            if (typeof onProgress === 'function') {
                try { onProgress({ etichetta, fatti, totale }); } catch (e) { /* mai fatale */ }
            }
        };
        if (typeof window.jspdf === 'undefined' || typeof window.qrcode === 'undefined') {
            throw new Error('Le librerie del PDF non sono ancora caricate: riprova tra un attimo.');
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

        // Riduce le icone delle lune selezionate, un po' alla volta
        const immagini = {};
        const elenco = dati.scelte.flatMap(gruppo =>
            gruppo.lune.map(luna => ({ chiave: gruppo.pianeta.slug + '/' + luna.id, src: luna.icona }))
        );
        avanza('Preparo le immagini delle lune…', 0, elenco.length);
        for (let i = 0; i < elenco.length; i += 8) {
            await Promise.all(elenco.slice(i, i + 8).map(async voce => {
                const img = await caricaImmagine(voce.src);
                if (img) immagini[voce.chiave] = img;
            }));
            avanza('Preparo le immagini delle lune…', Math.min(i + 8, elenco.length), elenco.length);
            await respiro();
        }

        // Copertina, una pagina per pianeta, chiusura con il QR
        const totalePagine = 1 + dati.scelte.length + 1;
        let pagina = 0;

        paginaCopertina(doc, dati);
        pagina++;
        avanza('La copertina è pronta…', pagina, totalePagine);
        await respiro();

        for (const gruppo of dati.scelte) {
            doc.addPage();
            paginaPianeta(doc, gruppo, immagini);
            pagina++;
            avanza('Compongo ' + gruppo.pianeta.nome + '…', pagina, totalePagine);
            await respiro();
        }

        doc.addPage();
        paginaQr(doc);
        pagina++;
        avanza('Aggiungo il QR e chiudo…', pagina, totalePagine);

        const slug = (dati.nome || 'passaporto')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        doc.save('passaporto-neurodivergente-' + (slug || 'esploratore') + '.pdf');
        avanza('Fatto!', totalePagine, totalePagine);
    }

    window.generaPassaportoPDF = generaPassaportoPDF;
})();
