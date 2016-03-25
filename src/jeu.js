/*TP2 Version Finale
Programmation d'animation2
Groupe 1797
Techniques d'Integration Multiemdia 
Prof. Johnathan Martel
Etudiante: Ana Cristina Mahneke
6 juillet 2015
d'apres le code obtenu dans le cadre des cours 7-14 
dessins des personnages et tilemap par Cristina Mahneke
*/

(function () {

    var jeu = new Phaser.Game(768, 640, Phaser.AUTO, 'jeuHanselGretel', {
        preload: fctpreload,
        create: fctcreate,
        update: fctupdate
        //render: fctrender
        
    });

    function fctpreload() {
        jeu.ecran_demarrage = this.game.add.sprite();
        // chargement des images des personnages
        jeu.load.image('gretel', 'assets/perso_jeu-01.png');
        jeu.load.image('hansel', 'assets/perso_jeu-02.png');
        jeu.load.image('biscuit', 'assets/perso_jeu-03.png');
        jeu.load.image('sourciere', 'assets/perso_jeu-04.png');
        jeu.load.image('etoile', 'assets/etoile1.png');
        // Chargement du fichier json qui contient l'info du niveau
        jeu.load.tilemap('NiveauHG', 'assets/NiveauHG.json', '', Phaser.Tilemap.TILED_JSON);
        // Chargement de l'image des tuiles (tileset)
        jeu.load.image('tuiles', 'assets/TilesHGPS.png');
        //charger les sprites des animations
        jeu.load.atlasJSONHash('gretel', 'assets/gretel.png', 'assets/gretel.json');
        jeu.load.atlasJSONHash('hansel', 'assets/hansel.png', 'assets/hansel.json');
        jeu.load.atlasJSONHash('sourciere', 'assets/sourciere.png', 'assets/sourciere.json');
        jeu.load.atlasJSONHash('etoile', 'assets/etoile.png', 'assets/etoile.json');
        jeu.load.image('bouton', 'assets/bouton.png');
        
        //---------------CHARGER LES SONS---------------//
        jeu.load.audio('crunch', 'assets/crunch.mp3');
        jeu.load.audio('blesse', 'assets/blesse.wav');
        jeu.load.audio('perdant', 'assets/perdant.wav');
        jeu.load.audio('gagnant','assets/gagnant.mp3');
        jeu.load.audio('sky_loop', 'assets/sky-loop_01.mp3');

    }//FIN fctpreload-------------------------------------------------------

    function fctcreate() {
        // Démarrer le système de physique Arcade
        jeu.physics.startSystem(Phaser.Physics.ARCADE);
        
        // Créer le sprite de Gretel
        this.gretel = jeu.add.sprite(64, 64, 'gretel');
        //animer  Gretel
        this.gretel.animations.add('idle', Phaser.Animation.generateFrameNames('Gretel_Idle', 0, 59, '', 4), 30, true);
        this.gretel.animations.add('marche', Phaser.Animation.generateFrameNames('Gretel_Marche', 0, 59, '', 4), 30, true);
        //Gretel par default dera en etat d'attente 
         this.gretel.animations.play('idle', 30, true);
        // Le point d'ancrage(0,0) est maintenant au centre
        this.gretel.anchor.setTo(0.0, 0.0);   
        // Permet à la physique de s'appliquer sur gretel
        jeu.physics.enable(this.gretel); // Création du body
        // Nombre de vies de depart de Gretel
        jeu.nbVies = 5;
        //Créer Hansel:
        this.hansel = jeu.add.sprite(64, 64, 'hansel');
        // Permet à la physique de s'appliquer sur Hansel
        jeu.physics.enable(this.hansel);
        this.hansel.body.immovable = true;
         //Animer Hansel:
        this.hansel.animations.add('idle', Phaser.Animation.generateFrameNames('Hansel_Idle', 0, 59, '', 4), 30, true);
        //Hansel par default sera en etat d'attente
        this.hansel.animations.play('idle', 30, true);
        
        // Placer Hansel dans le prison:
        this.hansel.x = jeu.width/1.175; 
        this.hansel.y = jeu.height/18;
        
        //Créer la sourcière (ennemi)
        this.sourciere = jeu.add.sprite(64,64, 'sourciere');
        jeu.physics.enable(this.sourciere);
        //Placer la sourcière dans sa maison
        this.sourciere.x = jeu.width/1.5; 
        this.sourciere.y = jeu.height/10.0;
        this.sourciere.body.velocity.x = 50;
        //animer la sourciere
        this.sourciere.animations.add('idle', Phaser.Animation.generateFrameNames('sourciere_Idle', 0, 89, '', 4), 60, true);
        this.sourciere.animations.add('marche', Phaser.Animation.generateFrameNames('sourciere_Marche', 0, 59, '', 4), 30, true);
        //la sourciere par default sera en etat de marche
        this.sourciere.animations.play('marche', 60, true);
        
        //Créer les mauvaises etoiles (ennemi#2)
        this.etoile = jeu.add.sprite(64,64, 'etoile');
        
        //stocker les frames pour l'animation dans une variable comme ils l'ont fait ici, et ensuite utiliser le methode callAll pour animer l'ensemble du group: http://www.html5gamedevs.com/topic/2794-how-to-add-an-animation-to-a-group-sprite/
        var frameNames = Phaser.Animation.generateFrameNames('etoile', 0, 29, '', 4);
        
        
        //instancier l'etoile
        this.pgEtoile = jeu.add.physicsGroup(Phaser.Physics.ARCADE);
        this.pgEtoile.create(64 * 1, 64 * 8, "etoile");
        this.pgEtoile.create(64 * 2, 64 * 5, "etoile");
        this.pgEtoile.create(64 * 4, 64 * 8, "etoile");
        this.pgEtoile.create(64 * 8, 64 * 4, "etoile");
        this.pgEtoile.setAll("scale", new Phaser.Point(.75, .75));
        this.pgEtoile.setAll("body.velocity.x", 50);

        
        //animer l'ensemble d'etoiles
        this.pgEtoile.callAll('animations.add', 'animations', 'etoile', frameNames, 30, true, false);
        
        this.pgEtoile.callAll('play', null, 'etoile');
        
        
        //Créer les biscuits qu'il faut que Gretel ramasse
        this.biscuit = jeu.add.sprite(64,64, 'biscuit');
        
        this.pgBiscuit = jeu.add.physicsGroup(Phaser.Physics.ARCADE);
        this.pgBiscuit.create(64 * 8, 64 * 6, "biscuit");
        this.pgBiscuit.create(64 * 3, 64 * 4, "biscuit");
        this.pgBiscuit.create(64 * 10.75, 64 * 4, "biscuit");
        this.pgBiscuit.create(64 * 10.75, 64 * 9, "biscuit");
        this.pgBiscuit.create(64 * 5.5, 64 * 1, "biscuit");
        this.pgBiscuit.create(64 * 6, 64 * 4, "biscuit");
        this.pgBiscuit.create(64 * 4, 64 * 9, "biscuit");
        this.pgBiscuit.create(64 * 9.5, 64 * 2.5, "biscuit");
        this.pgBiscuit.create(64 * 3, 64 * 7, "biscuit");
        this.pgBiscuit.create(64 * 3, 64 * 1, "biscuit");
        this.pgBiscuit.setAll("scale", new Phaser.Point(1.5, 1.5));
        this.pgBiscuit.setAll("body.immovable", true);
        
        //variable pour stocker le nombre de biscuits que Gretel a ramassé
        jeu.nbBiscuits = 0;
       
        //récuperer l'input du clavier
        this.clavier = jeu.input.keyboard;

        // Création du niveau à partir du tilemap
        this.niveau = jeu.add.tilemap('NiveauHG');
        
        // Ajoute le tileset dans le niveau
        this.niveau.addTilesetImage('tuiles');
        
		// Crée la couche à partir du niveau
        this.couche = this.niveau.createLayer('sol');
        
        // Active les collisions sur la couche avec les tuiles ayant l'id de 3, et 6 à 10
        this.niveau.setCollision([3,6,7,8,9,10], true, this.couche);
        // Affiche les info de debugage des collisions
        //this.couche.debug = true;
        
        // Faire que les personnages apparaissent au dessus du niveau
        jeu.world.bringToTop(this.pgBiscuit);
        jeu.world.bringToTop(this.gretel);
        jeu.world.bringToTop(this.hansel);
        jeu.world.bringToTop(this.sourciere);
        jeu.world.bringToTop(this.pgEtoile);
        
        //-----TEXTES-----------------------
        jeu.tempsDebut = jeu.time.now;
        jeu.txtTemps = jeu.add.text(10,05, '00:00', {font: "16pt 'Architects Daughter'", fill:'#fff', weight:700});
        
        jeu.comptBiscuits = jeu.add.text(170,05, 'Biscuits: ' + jeu.nbBiscuits, {font: "16pt 'Architects Daughter'", fill:'#fff', weight:700});
        jeu.comptVies = jeu.add.text(300,05, 'Vies: ' + jeu.nbVies, {font: "16pt 'Architects Daughter'", fill:'#fff', weight:700});
        
        //------------SONS-------------------
        jeu.sonEnviro = this.add.sound('sky_loop');
        jeu.sonEnviro.volume = 1;
        jeu.sonEnviro.loop = true;
        jeu.sonEnviro.play();
        jeu.sonBiscuits = this.add.sound('crunch');
        jeu.sonPerdant = this.add.sound('perdant');
        jeu.sonBlesse = this.add.sound('blesse');
        jeu.sonGagnant = this.add.sound('gagnant');
        
    }//FIN fctcreate------------------------------------------------------

    function fctupdate() {
         
        //DEPLACEMENTS ET COLLISIONS DE GRETEL
        //a chaque frame verifier les collisions entre Gretel et les murs
        jeu.physics.arcade.collide(this.gretel, this.couche);
        /*Sur chaque frame, lire le clavier et agir sur la vitesse de déplacement*/
         // Sur chaque frame:
        var velocity = {x:0, y:0}; // Etablir la vitesse initiale a 0
         if(this.clavier.isDown(Phaser.Keyboard.A)){ // Est-ce que la touche A est pressé
         this.gretel.body.velocity.x = -100; // Vitesse de -100 en x
         }
         else if(this.clavier.isDown(Phaser.Keyboard.D)){ // Est-ce que la touche D est pressé
         this.gretel.body.velocity.x = 100; // Vitesse de 100 en x
         }else{
            this.gretel.body.velocity.x = 0; // au moment que les touches A et D soient pas pressés, la velocité en x sera 0
         }
        
         if(this.clavier.isDown(Phaser.Keyboard.W)){// Est-ce que la touche S est pressé
         this.gretel.body.velocity.y = -100; // Vitesse de -100 en y
         }
         else if(this.clavier.isDown(Phaser.Keyboard.S)){ // Est-ce que la touche W est pressé
         this.gretel.body.velocity.y = 100; // Vitesse de 100 en y
         }else{
            this.gretel.body.velocity.y = 0;// au moment que les touches W et S soient pas pressés, la velocité en y sera 0
         }
        
        //si les cles a,s,d,ouw sont presses, Gretel sera en etat de marche
        
        if(this.clavier.isDown(Phaser.Keyboard.W) || this.clavier.isDown(Phaser.Keyboard.A) || this.clavier.isDown(Phaser.Keyboard.S) || this.clavier.isDown(Phaser.Keyboard.D)){
            this.gretel.animations.play('marche', 30, true);
        }else{
            // this.gretel.animations.stop('marche', 0, true);
            this.gretel.animations.play('idle', 30, true);
        }

        //COLLISIONS DE LA SOURCIERE CONTRE LES MURS
        jeu.physics.arcade.collide(this.sourciere, this.couche, deplacementsSourciere);
        
        //COLLISIONS DES ETOILES
        jeu.physics.arcade.collide(this.pgEtoile, this.pgEtoile, collisionMur);
        jeu.physics.arcade.collide(this.pgEtoile, this.couche, collisionMur);
        
        //COLLISONS ENTRE GRETEL ET LES ETOILES
        jeu.physics.arcade.collide(this.gretel, this.pgEtoile, viesGretel);
        
        //COLLISONS ENTRE GRETEL ET LA SOURCIERE, perde autmatique
        //Si Gretel s'est fait touché par la sourciere, ça serait un perde automatique 
        jeu.physics.arcade.collide(this.sourciere,this.gretel, perdre);
        
        //UPDATE  sur le compteur de nombre des vies de Gretel:
        jeu.comptVies.setText("Vies: "+jeu.nbVies);
        
        //COLLISON ENTRE GRETEL ET HANSEL; gagner
        
        jeu.physics.arcade.collide(this.gretel, this.hansel, gagner);
        
        // COLLISION ENTRE LA SOURCIERE ET HANSEL
        jeu.physics.arcade.collide(this.sourciere, this.hansel, deplacementsSourciere);
        
        //DESTRUCTION/RAMASSEMENT DES BISCUITS
        jeu.physics.arcade.collide(this.gretel,this.pgBiscuit, ramasserBiscuits);
      
        //update du nombre de biscuits, afficher texte
        jeu.nbBiscuits = 10 - this.pgBiscuit.length;
        jeu.comptBiscuits.setText("Biscuits: "+jeu.nbBiscuits);
        
        // Afficher le temps
        var temps = new Date(jeu.time.now - jeu.tempsDebut);
        jeu.minutes = ('0'+ temps.getMinutes()).slice(-2);
        jeu.secondes = ('0'+ temps.getSeconds()).slice(-2);
        jeu.txtTemps.setText("Temps: "+jeu.minutes+": "+jeu.secondes);
        
    }//FIN fctupdate-----------------------------------------------------
    
    //---COLLISIONS AVEC LES MURS------------
     function collisionMur (element){
            
            switch (Math.ceil(Math.random() * 4)) {
                case 1:
                    element.body.velocity.x = 50;
                    break;
                case 2:
                    element.body.velocity.x = -50;
                    break;
                case 3:
                    element.body.velocity.y = 50;
                    break;
                case 4:
                    element.body.velocity.y = -50;
                    break;
                
            }

        }
  
   // DEPLACEMENT ALEATOIRE DE LA SOURCIERE
     function deplacementsSourciere (element){
            if(element.body.speed > 0)
            {
                element.animations.play('marche', 30, true);
            }
            switch (Math.ceil(Math.random() * 5)) {
                case 1:
                    element.body.velocity.x = 50;
                    break;
                case 2:
                    element.body.velocity.x = -50;
                    break;
                case 3:
                   
                    element.body.velocity.y = 50;
                    break;
                case 4:
                    
                    element.body.velocity.y = -50;
                    break;
                case 5:
                    element.animations.play('idle', 60, false);
                    setTimeout(function(){deplacementsSourciere(element)}, 2500);
                    break;
            }
     }
    
    
    //fonction qui permet la destruction et rammasement des biscuits par Gretel
    function  ramasserBiscuits (gretel, biscuit){
      biscuit.destroy();
      jeu.sonBiscuits.play();
     
    }
    //ETATS DE FIN-REDEMARRAGE DU JEU------------------------
    
    //fonction pour calculer et afficher le nombre de vies à Gretel
    function viesGretel(gretel, etoile){
           jeu.nbVies-=1;
           jeu.sonBlesse.play();
           console.log(jeu.nbVies);
           collisionMur(etoile);
            gretel.x = 60;
            gretel.y = 100;
        if(jeu.nbVies<=0){
            perdre(gretel);
            
        }
    }
    
    //Redemarrer le jeu 
    function reDemarrer (){
        jeu.state.restart();
        
    }
    //Redemarrer le jeu et afficher l'etat gagner
    function gagner(){
        console.log("Tu as gagné!");
        var txtGagner = jeu.add.text(260,200, 'Tu as gagné!', {font: "36pt 'Architects Daughter'", fill:'#fff', weight:700});
        jeu.add.button(300,300, 'bouton', reDemarrer, this, 2,1,0);
        jeu.sonGagnant.play();
        jeu.sonEnviro.stop();
    }
    //Redemarrer le jeu et afficher l'etat perdre
    function perdre(gretel){
        gretel.kill();
        console.log("Tu as perdu!");
       var txtPerdre = jeu.add.text(260,200, 'Tu as perdu!', {font: "36pt 'Architects Daughter'", fill:'#fff', weight:700});
        jeu.add.button(300,300, 'bouton', reDemarrer, this, 2,1,0);
        jeu.sonPerdant.play();
        jeu.sonEnviro.stop();
    }
   /* function fctrender() {
        jeu.debug.bodyInfo(this.gretel, 0, 20);

    }*/
    
})();//-------------------FIN JEU--------------------------------------