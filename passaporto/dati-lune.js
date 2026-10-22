// Dati del Passaporto Neurodivergente: pianeti e lune.
//
// DA AGGIORNARE quando si aggiunge una luna o un pianeta — deve restare
// allineato alle schede delle pagine pianeta e alle flip-card dell'homepage.
// I percorsi delle icone sono relativi alla cartella "passaporto/".

const PIANETI = [
    {
        slug: "mars",
        nome: "Marte",
        tema: "Umore e Stress",
        blob: "blob-1",
        lune: [
            { id: "burnout", nome: "Burnout", icona: "../Asset/thumb/burnout.png", motto: "Non è debolezza: è aver reggito troppo a lungo." },
            { id: "stress", nome: "Stress", icona: "../Asset/thumb/stress.png", motto: "Utile a piccole dosi. Logorante quando non si spegne." },
            { id: "distimia", nome: "Distimia", icona: "../Asset/thumb/distimia.png", motto: "Non è il proprio carattere: è una condizione che dura anni." },
            { id: "depressione", nome: "Depressione", icona: "../Asset/thumb/depressione.png", motto: "Non si supera con la forza di volontà." },
            { id: "disturbo-bipolare", nome: "Disturbo Bipolare", icona: "../Asset/thumb/disturbo-bipolare.png", motto: "Non sono alti e bassi: sono fasi cliniche." },
            { id: "anedonia", nome: "Anedonia", icona: "../Asset/thumb/anedonia.png", motto: "Non è indifferenza: è la perdita del piacere." }
        ]
    },
    {
        slug: "mercury",
        nome: "Mercurio",
        tema: "Differenze nell'Apprendimento",
        blob: "blob-2",
        lune: [
            { id: "dislessia", nome: "Dislessia", icona: "../Asset/thumb/dislessia.png", motto: "Il pensiero resta profondo. Cambia il modo di leggere." },
            { id: "disprassia", nome: "Disprassia", icona: "../Asset/thumb/disprassia.png", motto: "Riguarda la coordinazione, non l'intelligenza." },
            { id: "iperlessia", nome: "Iperlessia", icona: "../Asset/thumb/iperlessia.png", motto: "Leggere presto non significa aver capito tutto." },
            { id: "discalculia", nome: "Discalculia", icona: "../Asset/thumb/discalculia.png", motto: "I numeri non tengono. Non misura l'intelligenza." },
            { id: "disgrafia", nome: "Disgrafia", icona: "../Asset/thumb/disgrafia.png", motto: "L'idea è chiara. È il segno a essere faticoso." },
            { id: "disortografia", nome: "Disortografia", icona: "../Asset/thumb/disortografia.png", motto: "Il pensiero è chiaro. È la scrittura codificata a mancare." }
        ]
    },
    {
        slug: "venus",
        nome: "Venere",
        tema: "Disturbi di Personalità",
        blob: "blob-3",
        lune: [
            { id: "disturbo-evitante", nome: "Disturbo Evitante di Personalità", icona: "../Asset/thumb/disturbo-evitante.png", motto: "Non è timidezza: è paura del rifiuto che fa evitare." },
            { id: "disturbo-antisociale", nome: "Disturbo Antisociale di Personalità", icona: "../Asset/thumb/disturbo-antisociale.png", motto: "Non è cattiveria: è una condizione clinica seria." },
            { id: "disturbo-paranoide", nome: "Disturbo Paranoide di Personalità", icona: "../Asset/thumb/disturbo-paranoide.png", motto: "Non è diffidenza: è una lente sempre accesa." },
            { id: "disturbo-borderline", nome: "Disturbo Borderline di Personalità", icona: "../Asset/thumb/disturbo-borderline.png", motto: "Non è essere eccessivi: è instabilità clinica." },
            { id: "disturbo-narcisistico", nome: "Disturbo Narcisistico di Personalità", icona: "../Asset/thumb/disturbo-narcisistico.png", motto: "Non è vanità: è una stima di sé fragile." },
            { id: "disturbo-istrionico", nome: "Disturbo Istrionico di Personalità", icona: "../Asset/thumb/disturbo-istrionico.png", motto: "Non è fare scene: è un modo stabile di stare nelle relazioni." }
        ]
    },
    {
        slug: "earth",
        nome: "Terra",
        tema: "Cervello e Percezione",
        blob: "blob-4",
        lune: [
            { id: "arto-fantasma", nome: "Arto Fantasma", icona: "../Asset/thumb/arto-fantasma.png", motto: "Il cervello conserva la mappa di ciò che non c'è più." },
            { id: "ipertimesia", nome: "Ipertimesia", icona: "../Asset/thumb/ipertimesia.png", motto: "Un archivio che non si spegne mai." },
            { id: "prosopagnosia", nome: "Prosopagnosia", icona: "../Asset/thumb/prosopagnosia.png", motto: "I volti non arrivano con il nome." },
            { id: "sindrome-savant", nome: "Sindrome Savant", icona: "../Asset/thumb/sindrome-savant.png", motto: "Un talento eccezionale, dentro una persona intera." },
            { id: "sinestesia", nome: "Sinestesia", icona: "../Asset/thumb/sinestesia.png", motto: "I sensi si incrociano: i numeri hanno un colore." },
            { id: "afantasia", nome: "Afantasia", icona: "../Asset/thumb/afantasia.png", motto: "Chiudendo gli occhi non si vede nulla. La fantasia resta." }
        ]
    },
    {
        slug: "jupiter",
        nome: "Giove",
        tema: "Neurodivergenza",
        blob: "blob-5",
        lune: [
            { id: "autismo-livello-1", nome: "Autismo Livello 1", icona: "../Asset/thumb/autismo-livello-1.png", motto: "Il livello indica l'aiuto necessario, non il valore." },
            { id: "autismo-livello-2", nome: "Autismo Livello 2", icona: "../Asset/thumb/autismo-livello-2.png", motto: "Serve supporto sostanziale, non pazienza generica." },
            { id: "autismo-livello-3", nome: "Autismo Livello 3", icona: "../Asset/thumb/autismo-livello-3.png", motto: "Supporto molto sostanziale. La presenza resta intera." },
            { id: "sindrome-di-tourette", nome: "Sindrome di Tourette", icona: "../Asset/thumb/sindrome-di-tourette.png", motto: "I tic non sono una scelta." },
            { id: "adhd", nome: "ADHD", icona: "../Asset/thumb/adhd.png", motto: "Non è pigrizia: è un'altra organizzazione delle priorità." },
            { id: "alessitimia", nome: "Alessitimia", icona: "../Asset/thumb/alessitimia.png", motto: "Le emozioni ci sono. Mancano le parole." }
        ]
    },
    {
        slug: "saturn",
        nome: "Saturno",
        tema: "Neurosviluppo",
        blob: "blob-6",
        lune: [
            { id: "multipotenzialita", nome: "Multipotenzialità", icona: "../Asset/thumb/multipotenzialita.png", motto: "Non è mancanza di concentrazione: è un modo di essere." },
            { id: "persona-altamente-sensibile", nome: "Persona Altamente Sensibile", icona: "../Asset/thumb/persona-altamente-sensibile.png", motto: "Non è una patologia: è un tratto studiato." },
            { id: "plusdotazione", nome: "Plusdotazione", icona: "../Asset/thumb/plusdotazione.png", motto: "Non significa solo andare bene a scuola." },
            { id: "sviluppo-asincrono", nome: "Sviluppo Asincrono", icona: "../Asset/thumb/sviluppo-asincrono.png", motto: "Non è incoerenza: sono tempi diversi." },
            { id: "iperreattivita-sensoriale", nome: "Iperreattività Sensoriale", icona: "../Asset/thumb/iperreattivita-sensoriale.png", motto: "Non è esagerare: è un sistema nervoso diverso." },
            { id: "doppia-eccezionalita", nome: "Doppia Eccezionalità", icona: "../Asset/thumb/doppia-eccezionalita.png", motto: "Il talento copre la fatica. La fatica copre il talento." }
        ]
    },
    {
        slug: "uranus",
        nome: "Urano",
        tema: "Disturbi Neurologici",
        blob: "blob-7",
        lune: [
            { id: "afasia", nome: "Afasia", icona: "../Asset/thumb/afasia.png", motto: "L'intelligenza resta intatta. Mancano le parole." },
            { id: "emicrania-cronica", nome: "Emicrania Cronica", icona: "../Asset/thumb/emicrania-cronica.png", motto: "Non è un mal di testa qualsiasi." },
            { id: "epilessia", nome: "Epilessia", icona: "../Asset/thumb/epilessia.png", motto: "Le crisi ricorrono. Con i farmaci si controllano." },
            { id: "malattia-di-parkinson", nome: "Malattia di Parkinson", icona: "../Asset/thumb/malattia-di-parkinson.png", motto: "Il movimento rallenta. La persona no." },
            { id: "sclerosi-multipla", nome: "Sclerosi Multipla", icona: "../Asset/thumb/sclerosi-multipla.png", motto: "Ogni persona ha sintomi diversi. Le terapie esistono." },
            { id: "sla", nome: "Sclerosi Laterale Amiotrofica (SLA)", icona: "../Asset/thumb/sla.png", motto: "Mente e sensi restano integri. Il movimento si riduce." }
        ]
    },
    {
        slug: "neptune",
        nome: "Nettuno",
        tema: "Disturbi d'Ansia",
        blob: "blob-8",
        lune: [
            { id: "attacchi-di-panico", nome: "Attacchi di Panico", icona: "../Asset/thumb/attacchi-di-panico.png", motto: "Spaventano moltissimo. Non sono pericolosi." },
            { id: "disturbo-ansia-generalizzata", nome: "Disturbo d'Ansia Generalizzata", icona: "../Asset/thumb/disturbo-ansia-generalizzata.png", motto: "Non significa pensare troppo: è ansia che resta accesa." },
            { id: "disturbo-ossessivo-compulsivo", nome: "Disturbo Ossessivo-Compulsivo", icona: "../Asset/thumb/disturbo-ossessivo-compulsivo.png", motto: "Non è amore per l'ordine: sono rituali contro l'ansia." },
            { id: "disturbo-ansia-sociale", nome: "Disturbo d'Ansia Sociale", icona: "../Asset/thumb/disturbo-ansia-sociale.png", motto: "Non è timidezza: è paura del giudizio." },
            { id: "mutismo-selettivo", nome: "Mutismo Selettivo", icona: "../Asset/thumb/mutismo-selettivo.png", motto: "Non è testardaggine: è un blocco d'ansia." },
            { id: "stress-post-traumatico", nome: "Disturbo da Stress Post-Traumatico", icona: "../Asset/thumb/stress-post-traumatico.png", motto: "Non è reagire male: è la risposta del cervello al trauma." }
        ]
    }
];
