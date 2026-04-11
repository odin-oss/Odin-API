
DO $$
DECLARE
    linux INTEGER;
    windows INTEGER;
    python INTEGER;
    others INTEGER;
    catBDD INTEGER;
    catLinux INTEGER;
    catReseaux INTEGER;
    catDevEnv INTEGER;
    catDevOps INTEGER;
    catOps INTEGER;
    catInfo INTEGER;
    catWeb INTEGER;
    catWindows INTEGER;
    roleStudent INTEGER;
    roleTeacher INTEGER;
    roleAdmin INTEGER;
    pwd1 INTEGER;
    pwd2 INTEGER;
    pwd3 INTEGER;
    pwd4 INTEGER;
    pwd5 INTEGER;
    pwd6 INTEGER;
BEGIN
    INSERT INTO User_role(label) VALUES ('ADMINISTRATOR') ON CONFLICT (label) DO NOTHING;
    INSERT INTO User_role(label) VALUES ('TEACHER') ON CONFLICT (label) DO NOTHING;
    INSERT INTO User_role(label) VALUES ('STUDENT') ON CONFLICT (label) DO NOTHING;

    SELECT id_role INTO roleAdmin FROM User_role WHERE label = 'ADMINISTRATOR';

    IF NOT EXISTS (SELECT 1 FROM Password WHERE pwd = '$2b$11$9Labq.sH7IjvHZezC5Pf2.M2xoxaZ9QfKA/lME4p50dSh0vFWqumu') THEN
        INSERT INTO Password(pwd) VALUES ('$2b$11$9Labq.sH7IjvHZezC5Pf2.M2xoxaZ9QfKA/lME4p50dSh0vFWqumu');
    END IF;
    
    SELECT id_password INTO pwd1 FROM Password WHERE pwd = '$2b$11$9Labq.sH7IjvHZezC5Pf2.M2xoxaZ9QfKA/lME4p50dSh0vFWqumu';

    INSERT INTO Users(lastname, firstname, mail, id_role, id_password) VALUES ('Caelus', 'Odin', 'odin@odin.fr', roleAdmin, pwd1) ON CONFLICT (mail) DO NOTHING;
    
    INSERT INTO Enum_agent_type(label) VALUES ('Available') ON CONFLICT (label) DO NOTHING;
    INSERT INTO Enum_agent_type(label) VALUES ('Attributed') ON CONFLICT (label) DO NOTHING;

    INSERT INTO Random_dictionary(word)
    VALUES ('swamp'),('lord'),('farquaad'),('castle'),('city'),('dragon'),
    ('garden'),('dwarf'), ('village'),('shrek'),('ogre'),('toilets'),('cabin'),('odin'),('cirrus'),
    ('fairy'),('kingdom'),('unicorn'),('clearing'),('palace'),('princess'),('stella'),
    ('fiona'),('tower'),('forest'),('siren'),('lake'),('dark'),('abandoned'), ('gingerbread'),
    ('man'),('giant'),('troll'), ('bridge'),('wishing'),('well'),('secret'),
    ('enchanted'), ('lair'),('golden'),('hidden'),('cave'),('beanstalk'),
    ('donkey'),('prince'),('harold'),('gingy'),('puss'),('boots'),
    ('king'),('queen'),('lillian'),('big'),('bad'),('wolf'),
    ('three'),('little'),('pigs'),('blind'),('mice'),('pinocchio'),
    ('rabbit'),('magic'),('mirror'),('godmother'),
    ('ugly'),('duckling'),('red'), ('riding'),('hood'),
    ('mad'),('hatter'),('march'),('hare'),('dormouse'),
    ('snow'),('white'),('sleeping'),('beauty'),('rapunzel'),
    ('cinderella'),('charming'),('wicked'),('witch'),('muffin'),
    ('fairytale'),('creatures'),('triplets'),('merry'),('men'),
    ('rumpelstiltskin'),('foret'),('marais'),('chateau'),('ville'),
    ('duloc'),('grotte'),('nains'), ('jardin'),('toillettes'),('cabane'),
    ('royaume'),('fees'),('clairiere'), ('licornes'),('palais'), ('royal'),
    ('prison'), ('ogres'),('tour'), ('princesse'), ('enchantee'),('lac'),
    ('sirenes'),('sombre'),('mine'), ('abandonnee'),('petits'),('gateaux'),
    ('epices'),('geants'),('pont'),('trolls'),('magique'),('puits'),
    ('souhaits'),('repaire'),('dore'),('cachee'),('tige'),('haricot'),
    ('geant'),('ane'),('pain'),('epice'),('chat'),('potte'),('roi'),('reine'),
    ('grand'),('mechant'),('loup'),('trois'),('cochons'),('souris'),('aveugles'),
    ('lapin'),('blanc'),('miroir'),('canard'),('laide'),('robin'),('bois'),
    ('petit'),('chaperon'),('rouge'),('chapelier'),('fou'),('lievre'),
    ('mars'),('dormeur'),('blanchette'),('belle'),('dormant'),('raiponce'),
    ('cendrillon'),('charmant'),('mechante'),('sorciere'),('homme'),
    ('creatures'),('contes'),('triples'),('joyeux'),('compagnons'),('ulfi'),('blacky'),
    ('benoit'),('lefebvre'),('paul'),('emile'),('vetu'),('louis'),('vieillard'),
    ('edouard'),('houllegatte'),('arthur'),('teirlynck'),('daphne'),('urbanski'),
    ('nuage'),('ciel'),('pluie'),('orage'),('eclair'),('aurore'),('crepuscule'),('vent'),
    ('brise'),('souffle'),('rayon'),('arcenciel'),('rosee'),('goutte'),('etoile'),
    ('lune'),('soleil'),('horizon'),('montagne'),('mer'),('riviere'),('foret'),('prairie'),
    ('champ'),('fleurs'),('arbres'),('feuilles'),('herbe'),('champignon'),('cascade'),('ruisseau'),
    ('baie'),('ocean'),('etang'),('lac'),('glace'),('neige'),('flocon'),('sable'),('desert'),
    ('canopee'),('flore'),('faune'),('oiseau'),('papillon'),('abeille'),('libellule'),('poisson'),
    ('baleine'),('dauphin'),('tortue'),('lion'),('tigre'),('ours'),('loup'),('ecureuil'),('renard'),
    ('biche'),('cerf'),('oiseaumouche'),('epervier'),('faucon'),('aigle'),('hibou'),('aigrette'),
    ('cygne'),('cygnet'),('canard'),('grenouille'),('salamandre'),('lezard'),('tortue'),('colibri'),
    ('martinpecheur'),('amandier'),('saule'),('chene'),('pin'),('erable'),('bouleau'),('acacia'),
    ('cedre'),('rose'),('tulipe'),('iris'),('marguerite'),('lilas'),('narcisse'),('pivoine'),('jonquille'),
    ('chardon'),('trefle'),('lierre'),('mousse'),('fougere'),('champignon'),('epine'),('racine'),('rameau'),('branche')
    ON CONFLICT (word) DO NOTHING;

    INSERT INTO Image_type (label)
    VALUES ('linux'), ('windows'), ('macosx'), ('kasm') ON CONFLICT (label) DO NOTHING;

    INSERT INTO Enum_state_application (label)
    VALUES ('Ready'), ('Off'), ('Getting ready'), ('Deleted'), ('Scheduled'), ('Error'), ('EndedSession'), ('DeletedLaunch'), ('DeletedDownload'), ('DeletedDone'), ('DeletedError')
    ON CONFLICT (label) DO NOTHING;

    INSERT INTO Enum_export_state (status)
    VALUES ('Launched'), ('Exporting'), ('Available'), ('Expired'), ('Revoked'), ('Error')
    ON CONFLICT (status) DO NOTHING;

    INSERT INTO Port_type (label)
    VALUES ('strip_path'), ('no_strip_path'), ('none')
    ON CONFLICT (label) DO NOTHING;

    INSERT INTO Variable_environment (key, value)
    VALUES
    ('USER','<username>'), /*1*/
    ('PASSWORD','<password>'), /*2*/
    ('PUID', '1000'), /*3*/
    ('PGID', '1000'), /*4*/
    ('POSTGRES_PASSWORD', '<password>'), /*5*/
    ('POSTGRES_USER', '<username>'), /*6*/
    ('POSTGRES_DB', 'mydb'), /*7*/
    ('POSTGRES_INITDB_ARGS', ''),/*8*/
    ('POSTGRES_INITDB_WALDIR', ''), /*9*/
    ('POSTGRES_HOST_AUTH_METHOD', ''), /*10*/
    ('PGDATA', ''), /*11*/
    ('PGADMIN_DEFAULT_EMAIL', '<username>@crrs.cloud'), /*12*/
    ('PGADMIN_DEFAULT_PASSWORD', '<password>'), /*13*/
    ('DEFAULT_WORKSPACE', '/home/<username>/workspace'), /*14*/
    ('MARIADB_DATABASE', 'mydb'), /*15*/
    ('MARIADB_USER', '<username>'), /*16*/
    ('MARIADB_ROOT_PASSWORD', '<password>'), /*17*/
    ('MARIADB_PASSWORD', '<password>'), /*18*/
    ('MYSQL_DATABASE', 'mydb'), /*19*/
    ('MYSQL_ROOT_PASSWORD', '<password>'), /*20*/
    ('MYSQL_USER', '<username>'), /*21*/
    ('MYSQL_PASSWORD', '<password>'), /*22*/
    ('PMA_HOST', 'ci<target><hash>3306'), /*23*/
    ('PMA_USER', '<username>'), /*24*/
    ('PMA_PASSWORD', '<password>'), /*25*/
    ('PMA_PORT', '3306'), /*26*/
    ('HTERMINAL', 'true'), /*27 deprecated*/
    ('USERID', '1001'), /*28*/
    ('GROUPID', '1001'), /*29*/
    ('ROOT', 'true'), /*30*/
    ('DISABLE_AUTH', 'true'), /*31*/
    ('URL_BASE', '<subpath>'), /*32*/
    ('USER', 'rstudio'),/*33*/
    ('HSTORAGE', 'true'), /*34*/
    ('TZ', 'Europe/Paris'),  /*35*/
    ('SUBFOLDER', '<subpath>/'),  /*36*/
    ('SCRIPT_NAME', '<subpath>-pgadmin'), /*37*/
    ('BASEPATH', '<subpath>-app'), /*38*/
    ('CUDA_MPS_ACTIVE_THREAD_PERCENTAGE', '25'), /*39*/
    ('CUDA_MPS_PINNED_DEVICE_MEM_LIMIT', '0=12000M'), /*40*/
    ('NVIDIA_DRIVER_CAPABILITIES', 'all'), /*41*/
    ('NVIDIA_VISIBLE_DEVICES', 'all'), /*42*/
    ('TZ', 'UTC'), /*43*/
    ('DISPLAY_SIZEW', '1920'), /*44*/
    ('DISPLAY_SIZEH', '1080'), /*45*/
    ('DISPLAY_REFRESH', '60'), /*46*/
    ('DISPLAY_DPI', '96'), /*47*/
    ('DISPLAY_CDEPTH', '24'), /*48*/
    ('DISPLAY', ':22'), /*49*/
    ('VIDEO_PORT', 'DFP'), /*50*/
    ('PASSWD', 'mypasswd'), /*51*/
    ('SELKIES_ENCODER', 'nvh264enc'), /*52*/
    ('SELKIES_ENABLE_RESIZE', 'true'), /*53*/
    ('SELKIES_VIDEO_BITRATE', '12000'), /*54*/
    ('SELKIES_FRAMERATE', '60'), /*55*/
    ('SELKIES_AUDIO_BITRATE', '128000'), /*56*/
    ('SELKIES_ENABLE_BASIC_AUTH', 'false'), /*57*/
    ('SELKIES_ENABLE_HTTPS', 'false'), /*58*/
    ('SELKIES_TURN_PORT', '3478'), /*59*/
    ('SELKIES_TURN_PROTOCOL', 'udp'), /*60*/
    ('SELKIES_TURN_TLS', 'false'), /*61*/
    ('SELKIES_TURN_USERNAME', 'didier'), /*62*/
    ('SELKIES_TURN_PASSWORD', 'ImplantGrudgingSassy1DirtinessTrickily'), /*63*/
    ('BASEPATH', '<subpath>'), /*64*/
    ('BASEPATHVSCODE', '<subpath>-vscode'), /*65*/
    ('BASEPATHAPP', '<subpath>-app'), /*66*/
    ('BASEPATH', '<subpath>-ingress-port'), /*67*/
    ('SELKIES_TURN_HOST', '152.228.208.84'), /*68*/
    ('DEFAULT_WORKSPACE', '/home/<username>')
    ON CONFLICT (key,value) DO NOTHING; /*69*/

    INSERT INTO Category (label, google_material_icon)
    VALUES
    ('Databases', 'database'),
    ('Linux', 'desktop_cloud'),
    ('Web', 'web_asset'),
    ('Networks', 'lan'),
    ('Development Environment', 'code'),
    ('DevOps', 'host'),
    ('Ops', 'host'),
    ('Computer', 'computer'),
    ('Windows', 'desktop_cloud'),
    ('Graphism', 'deployed_code')
    ON CONFLICT (label) DO NOTHING;

    INSERT INTO Argument (value)
    VALUES
    ('--ssh-host=ci<target><hash>22'), /*1*/
    ('--ssh-user=<username>'), /*2*/
    ('--ssh-pass=<password>'), /*3*/
    ('--allow-iframe=true'), /*4*/
    ('--base=<subpath>'), /*5*/
    ('--title=<vm_name>'), /*6*/
    ('/bin/sh'),/*7*/
    ('-c'),/*8*/
    ('tail -f /dev/null')
    ON CONFLICT (value) DO NOTHING; /*9*/

    INSERT INTO Node_selector(key,value)
    VALUES ('node-role.kubernetes.io/odn-default',''), /*1*/
    ('node-role.kubernetes.io/odn-gpu-gr',''), /*2*/
    ('node-role.kubernetes.io/odn-compute',''), /*3*/
    ('node-role.kubernetes.io/odn-gpu-storage',''), /*4*/
    ('node-role.kubernetes.io/odn-monitoring','')
    ON CONFLICT (key) DO NOTHING; /*5*/

END $$;