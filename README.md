# Visualizzatore Prodotto: Elmo Vichingo

<!-- TODO img/gif -->
<!-- ![Animazione barca](VoxelBoat.gif) -->

## Idea e obiettivi
Creare un configuratore di un prodotto che permetta all'utente di visualizzare le possibili personalizzazioni.
Il prodotto utilizzato nel progetto è un elmo vichingo con componenti in cuoio e rifiniture metalliche e non.
La visiera, formata da due parti, è configurabile in un totale di 10 combinazioni diverse di materiali.
I materiali metallici disponibili sono: oro, rame, ottone e bronzo.
Per i guanciali ed il paranuca sono disponibili 6 combinazioni differenti, con materiali quai cuoio(in due tipologie) e pelliccia. 

Il configuratore rende disponibili 4 ambienti diversi in cui poter osservare l'elmo.
La luce principale è data da una luce puntuale che illumina il modello dall'alto, la luce ambientale è data da una luce ambientale costante e da la luce provenente dall'ambiente selezionato.

### File usati
* il modello con texture [Viking Berserk Helmet free model](https://skfb.ly/6RLLA To view a copy of this license, visit http://creativecommons.org/licenses/by/4.0/)
* le texture dei materiali [Megascans](https://quixel.com/megascans/home?search=brass&assetId=se4nbarc)
* le cubemap [humus](https://www.humus.name/index.php?page=Textures&start=56)


## Struttura del progetto
Il progetto può essere lanciato aprendo il file *index.html*.
Il progetto è strutturato nel seguente modo:
* nella cartella *scripts* sono presenti i file:
  * *global.js* in cui sono salvate tutte le variabili globali e parametri di configurazione;
  * *main.js* contiene la logica principale, effettua i caricamenti delle texture ed istanzia i materiali con le relative uniform;
  * *utity.js* contiene alcune funzioni di supporto come il corretto caricamento del modello oppure funzioni per modificarne le parti;
  * *shaders.js* contiene delle variabili di tipo stringa in cui sono definiti gli shader usati nel progetto;
* la catella *materials* contiene le texture di tutti i materiali usati, organizzati in sottocartetlle; 
* la catella *libs* raggruppa tutte le librerie e dipendenze;
* la catella *models* contiene il modello dell'elmo e relative texture;
* la catella *cubemaps* contiene tutte le EM ed IEM usate nel configuratore;
* la catella *iamges* contiene figure, loghi ed immagini usate nella pagine html del configuratore.




## Processo di sviluppo
In un primo momento ci siamo concentrati sulla creazione del modello della barca, usando la classe voxelWorld risparmiando sulla generazione delle facce all'interno della barca. Poi abbiamo sviluppato una versione non ottimizzata del mare di dimensione massima 64x64. Successivamente abbiamo fatto qualche prova con telecamera e texture fino a trovare un risultato soddisfacente.
In ultimo, abbiamo ottimizzato il mare calcolando il suo movimento all'interno del vertex shader e abbiamo aggiunto l'avanzamento della barca.

## Problematiche
Il problema principale è stato quello di rendere l'applicazione GPU-bound piuttosto che CPU-bound, spostando quindi il lavoro computazionale all'interno degli shader. Abbiamo avuto problematiche minori riguardo al movimento coerente dei remi, dato che volevamo usare la stessa mesh per entrambe le file dei remi.
