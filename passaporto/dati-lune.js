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
            { id: "burnout", nome: "Burnout", icona: "../Asset/thumb/burnout.png", motto: "Quando la fiamma consuma chi la custodisce." },
            { id: "stress", nome: "Stress", icona: "../Asset/thumb/stress.png", motto: "La tempesta che chiede di essere ascoltata." },
            { id: "distimia", nome: "Distimia", icona: "../Asset/thumb/distimia.png", motto: "Una pioggia sottile che non smette." },
            { id: "depressione", nome: "Depressione", icona: "../Asset/thumb/depressione.png", motto: "Attraversare il buio per ritrovare la propria orbita." },
            { id: "disturbo-bipolare", nome: "Disturbo Bipolare", icona: "../Asset/thumb/disturbo-bipolare.png", motto: "Tra due soli, una rotta che insegna il ritmo." },
            { id: "anedonia", nome: "Anedonia", icona: "../Asset/thumb/anedonia.png", motto: "Quando la fiamma smette di scaldare." }
        ]
    },
    {
        slug: "mercury",
        nome: "Mercurio",
        tema: "Differenze nell'Apprendimento",
        blob: "blob-2",
        lune: [
            { id: "dislessia", nome: "Dislessia", icona: "../Asset/thumb/dislessia.png", motto: "Le lettere danzano e insegnano un'altra rotta." },
            { id: "disprassia", nome: "Disprassia", icona: "../Asset/thumb/disprassia.png", motto: "Il corpo impara il suo passo." },
            { id: "iperlessia", nome: "Iperlessia", icona: "../Asset/thumb/iperlessia.png", motto: "Le parole arrivano prima del loro significato." },
            { id: "discalculia", nome: "Discalculia", icona: "../Asset/thumb/discalculia.png", motto: "I numeri sono una lingua straniera." },
            { id: "disgrafia", nome: "Disgrafia", icona: "../Asset/thumb/disgrafia.png", motto: "La mano cerca la sua forma." },
            { id: "disortografia", nome: "Disortografia", icona: "../Asset/thumb/disortografia.png", motto: "Le parole cercano la propria via sulla carta." }
        ]
    },
    {
        slug: "venus",
        nome: "Venere",
        tema: "Disturbi di Personalità",
        blob: "blob-3",
        lune: [
            { id: "disturbo-evitante", nome: "Disturbo Evitante di Personalità", icona: "../Asset/thumb/disturbo-evitante.png", motto: "La distanza come modo di proteggersi." },
            { id: "disturbo-antisociale", nome: "Disturbo Antisociale di Personalità", icona: "../Asset/thumb/disturbo-antisociale.png", motto: "Quando le regole sembrano scritte per altri." },
            { id: "disturbo-paranoide", nome: "Disturbo Paranoide di Personalità", icona: "../Asset/thumb/disturbo-paranoide.png", motto: "La guardia che non si abbassa mai." },
            { id: "disturbo-borderline", nome: "Disturbo Borderline di Personalità", icona: "../Asset/thumb/disturbo-borderline.png", motto: "Emozioni che bruciano a piena intensità." },
            { id: "disturbo-narcisistico", nome: "Disturbo Narcisistico di Personalità", icona: "../Asset/thumb/disturbo-narcisistico.png", motto: "Lo specchio che chiede conferma." },
            { id: "disturbo-istrionico", nome: "Disturbo Istrionico di Personalità", icona: "../Asset/thumb/disturbo-istrionico.png", motto: "Il ritratto che cerca uno specchio." }
        ]
    },
    {
        slug: "earth",
        nome: "Terra",
        tema: "Cervello e Percezione",
        blob: "blob-4",
        lune: [
            { id: "arto-fantasma", nome: "Arto Fantasma", icona: "../Asset/thumb/arto-fantasma.png", motto: "La memoria del corpo oltre il corpo." },
            { id: "ipertimesia", nome: "Ipertimesia", icona: "../Asset/thumb/ipertimesia.png", motto: "Il tempo non passa: si deposita." },
            { id: "prosopagnosia", nome: "Prosopagnosia", icona: "../Asset/thumb/prosopagnosia.png", motto: "Volti senza nome, volti senza memoria." },
            { id: "sindrome-savant", nome: "Sindrome Savant", icona: "../Asset/thumb/sindrome-savant.png", motto: "Un dono che brilla fuori misura." },
            { id: "sinestesia", nome: "Sinestesia", icona: "../Asset/thumb/sinestesia.png", motto: "Quando i suoni hanno un colore." },
            { id: "afantasia", nome: "Afantasia", icona: "../Asset/thumb/afantasia.png", motto: "Immaginare, anche senza immagini." }
        ]
    },
    {
        slug: "jupiter",
        nome: "Giove",
        tema: "Neurodivergenza",
        blob: "blob-5",
        lune: [
            { id: "autismo-livello-1", nome: "Autismo Livello 1", icona: "../Asset/thumb/autismo-livello-1.png", motto: "Il mondo si sente troppo, e si capisce in modo unico." },
            { id: "autismo-livello-2", nome: "Autismo Livello 2", icona: "../Asset/thumb/autismo-livello-2.png", motto: "Un bisogno di chiarezza in un mondo confuso." },
            { id: "autismo-livello-3", nome: "Autismo Livello 3", icona: "../Asset/thumb/autismo-livello-3.png", motto: "Comunicare oltre le parole." },
            { id: "sindrome-di-tourette", nome: "Sindrome di Tourette", icona: "../Asset/thumb/sindrome-di-tourette.png", motto: "Il corpo che parla prima del pensiero." },
            { id: "adhd", nome: "ADHD", icona: "../Asset/thumb/adhd.png", motto: "L'attenzione che non sta ferma, ma sa dove andare." },
            { id: "alessitimia", nome: "Alessitimia", icona: "../Asset/thumb/alessitimia.png", motto: "Emozioni che chiedono un nome." }
        ]
    },
    {
        slug: "saturn",
        nome: "Saturno",
        tema: "Neurosviluppo",
        blob: "blob-6",
        lune: [
            { id: "multipotenzialita", nome: "Multipotenzialità", icona: "../Asset/thumb/multipotenzialita.png", motto: "Troppe strade, tutte vere." },
            { id: "persona-altamente-sensibile", nome: "Persona Altamente Sensibile", icona: "../Asset/thumb/persona-altamente-sensibile.png", motto: "Sentire il mondo con la pelle dell'anima." },
            { id: "plusdotazione", nome: "Plusdotazione", icona: "../Asset/thumb/plusdotazione.png", motto: "Una mente che chiede orizzonti più ampi." },
            { id: "sviluppo-asincrono", nome: "Sviluppo Asincrono", icona: "../Asset/thumb/sviluppo-asincrono.png", motto: "Crescere a velocità diverse." },
            { id: "iperreattivita-sensoriale", nome: "Iperreattività Sensoriale", icona: "../Asset/thumb/iperreattivita-sensoriale.png", motto: "Il mondo arriva a volume pieno." },
            { id: "doppia-eccezionalita", nome: "Doppia Eccezionalità", icona: "../Asset/thumb/doppia-eccezionalita.png", motto: "Due luci nella stessa orbita." }
        ]
    },
    {
        slug: "uranus",
        nome: "Urano",
        tema: "Disturbi Neurologici",
        blob: "blob-7",
        lune: [
            { id: "afasia", nome: "Afasia", icona: "../Asset/thumb/afasia.png", motto: "Le parole smarriscono la strada." },
            { id: "emicrania-cronica", nome: "Emicrania Cronica", icona: "../Asset/thumb/emicrania-cronica.png", motto: "Un dolore che torna, e insegna il rispetto dei propri limiti." },
            { id: "epilessia", nome: "Epilessia", icona: "../Asset/thumb/epilessia.png", motto: "La tempesta elettrica che attraversa il cervello." },
            { id: "malattia-di-parkinson", nome: "Malattia di Parkinson", icona: "../Asset/thumb/malattia-di-parkinson.png", motto: "Il tempo che rallenta il gesto." },
            { id: "sclerosi-multipla", nome: "Sclerosi Multipla", icona: "../Asset/thumb/sclerosi-multipla.png", motto: "Un corpo che cambia le proprie mappe." },
            { id: "sla", nome: "Sclerosi Laterale Amiotrofica (SLA)", icona: "../Asset/thumb/sla.png", motto: "Quando il movimento si fa silenzio." }
        ]
    },
    {
        slug: "neptune",
        nome: "Nettuno",
        tema: "Disturbi d'Ansia",
        blob: "blob-8",
        lune: [
            { id: "attacchi-di-panico", nome: "Attacchi di Panico", icona: "../Asset/thumb/attacchi-di-panico.png", motto: "L'onda che arriva senza preavviso." },
            { id: "disturbo-ansia-generalizzata", nome: "Disturbo d'Ansia Generalizzata", icona: "../Asset/thumb/disturbo-ansia-generalizzata.png", motto: "La preoccupazione che non trova mai riposo." },
            { id: "disturbo-ossessivo-compulsivo", nome: "Disturbo Ossessivo-Compulsivo", icona: "../Asset/thumb/disturbo-ossessivo-compulsivo.png", motto: "Il pensiero che si ripete per sentirsi al sicuro." },
            { id: "disturbo-ansia-sociale", nome: "Disturbo d'Ansia Sociale", icona: "../Asset/thumb/disturbo-ansia-sociale.png", motto: "Lo sguardo degli altri come un palcoscenico." },
            { id: "mutismo-selettivo", nome: "Mutismo Selettivo", icona: "../Asset/thumb/mutismo-selettivo.png", motto: "Il silenzio che protegge una voce." },
            { id: "stress-post-traumatico", nome: "Disturbo da Stress Post-Traumatico", icona: "../Asset/thumb/stress-post-traumatico.png", motto: "Quando la tempesta resta, dopo la tempesta." }
        ]
    }
];
