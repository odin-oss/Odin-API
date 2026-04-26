DO $$
BEGIN
    CREATE TABLE IF NOT EXISTS Password (
        id_password SERIAL PRIMARY KEY,
        pwd VARCHAR (255) NOT NULL
    );
    CREATE TABLE IF NOT EXISTS User_role (
        id_role SERIAL PRIMARY KEY,
        label VARCHAR (200) NOT NULL UNIQUE
    );
    CREATE TABLE IF NOT EXISTS Users (
        id_user SERIAL PRIMARY KEY,
        lastname VARCHAR(20) NOT NULL,
        firstname VARCHAR(20) NOT NULL,
        mail VARCHAR(60) NOT NULL UNIQUE,

        id_password INTEGER NOT NULL,
        id_role INTEGER NOT NULL,

        FOREIGN KEY (id_role) REFERENCES User_role(id_role),
        FOREIGN KEY (id_password) REFERENCES Password(id_password)
    );
    CREATE TABLE IF NOT EXISTS Whitelist (
        token VARCHAR(255) PRIMARY KEY,
        uuid VARCHAR(255) NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS School (
        id_school SERIAL PRIMARY KEY,
        label VARCHAR (100) NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS Class (
        id_class SERIAL PRIMARY KEY,
        label VARCHAR (100) NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS School_has_class (
        id_school INTEGER NOT NULL,
        id_class INTEGER NOT NULL,
        PRIMARY KEY (id_school, id_class),
        FOREIGN KEY (id_school) REFERENCES School(id_school) ON DELETE CASCADE,
        FOREIGN KEY (id_class) REFERENCES Class(id_class) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Class_has_user (
        id_class INTEGER NOT NULL,
        id_user INTEGER NOT NULL,
        PRIMARY KEY (id_class, id_user),
        FOREIGN KEY (id_class) REFERENCES Class(id_class) ON DELETE CASCADE,
        FOREIGN KEY (id_user) REFERENCES Users(id_user) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Random_dictionary (
        id_dictionary SERIAL PRIMARY KEY,
        word VARCHAR (100) NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS Image_type (
        id_type SERIAL PRIMARY KEY,
        label VARCHAR(100) NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS Environment (
        id_environment SERIAL PRIMARY KEY,
        icon VARCHAR(8) NOT NULL,
        label VARCHAR(255) NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS Interface (
        id_interface SERIAL PRIMARY KEY,
        label TEXT NOT NULL CHECK (char_length(label) BETWEEN 4 AND 70) UNIQUE,
        registry_link VARCHAR(200) NOT NULL,
        exec_command VARCHAR(200) NOT NULL,
        service_command VARCHAR(200) NOT NULL,
        privileged BOOLEAN NOT NULL DEFAULT 'false',
        readiness_probe_initial_delay INT NOT NULL DEFAULT 5,
        liveness_probe_initial_delay INT NOT NULL DEFAULT 200,
        readiness_probe_period INT NOT NULL DEFAULT 10,
        liveness_probe_period INT NOT NULL DEFAULT 20,
        need_compute_gpu BOOLEAN NOT NULL DEFAULT 'false',
        need_graphical_rendering_gpu BOOLEAN NOT NULL DEFAULT 'false',
        cpu_request VARCHAR(20) NOT NULL DEFAULT '2',
        ram_request VARCHAR(20) NOT NULL DEFAULT '4Gi',
        cpu_limit VARCHAR(20) NOT NULL DEFAULT '4',
        ram_limit VARCHAR(20) NOT NULL DEFAULT '8Gi',
        egress_bandwidth VARCHAR(40) NOT NULL DEFAULT 'N/A',
        ingress_bandwidth VARCHAR(40) NOT NULL DEFAULT 'N/A',

        id_type INTEGER NOT NULL,

        FOREIGN KEY (id_type) REFERENCES Image_type(id_type)
    );

    CREATE TABLE IF NOT EXISTS Node_selector (
        id_node_selector SERIAL PRIMARY KEY,
        key VARCHAR(100) NOT NULL UNIQUE,
        value VARCHAR(100) NOT NULL DEFAULT '' 
    );
    CREATE TABLE IF NOT EXISTS Interface_has_node_selector (
        id_interface INTEGER NOT NULL,
        id_node_selector INTEGER NOT NULL,

        PRIMARY KEY (id_interface, id_node_selector),
        FOREIGN KEY (id_interface) REFERENCES Interface(id_interface),
        FOREIGN KEY (id_node_selector) REFERENCES Node_selector(id_node_selector)
    );

    CREATE TABLE IF NOT EXISTS Environment_has_interface (
        id_environment INTEGER NOT NULL,
        id_interface INTEGER NOT NULL,
        label VARCHAR(100) NOT NULL DEFAULT 'N/A' ,

        PRIMARY KEY (id_environment, id_interface, label),
        FOREIGN KEY (id_environment) REFERENCES Environment(id_environment) ON DELETE CASCADE,
        FOREIGN KEY (id_interface) REFERENCES Interface(id_interface) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Enum_state_application (
        id_enum_state_application SERIAL PRIMARY KEY,
        label VARCHAR (50) NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS Enum_agent_state (
        id_enum_agent_state SERIAL PRIMARY KEY,
        label VARCHAR(100) NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS Agent (
        id_agent UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        id_enum_agent_state INTEGER NOT NULL,
        label VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL DEFAULT 'kubernetes',

        FOREIGN KEY (id_enum_agent_state) REFERENCES Enum_agent_state(id_enum_agent_state)
    );

    CREATE TABLE IF NOT EXISTS Datacenter (
        id_datacenter SERIAL PRIMARY KEY,
        label VARCHAR(25) NOT NULL DEFAULT 'N/A',
        city VARCHAR(50) NOT NULL DEFAULT 'N/A',
        provider VARCHAR(50) NOT NULL DEFAULT 'N/A',
        id_agent UUID,

        FOREIGN KEY (id_agent) REFERENCES Agent(id_agent)
    );

    CREATE TABLE IF NOT EXISTS Application_order (
        id_application_order SERIAL PRIMARY KEY,
        custom_label VARCHAR (64) NOT NULL ,
        generated_label VARCHAR (64) UNIQUE NOT NULL,
        creation_date TIMESTAMP WITH TIME ZONE NOT NULL,
        hash VARCHAR (255) NOT NULL DEFAULT '',
        username VARCHAR (255) NOT NULL,
        password VARCHAR (255) NOT NULL,
        state_changed_date TIMESTAMP WITH TIME ZONE NOT NULL,
        programming_shutdown_date TIMESTAMP WITH TIME ZONE,

        id_user INTEGER NOT NULL,
        id_environment INTEGER NOT NULL,
        id_enum_state_application INTEGER NOT NULL,
        id_datacenter INTEGER NOT NULL,

        FOREIGN KEY (id_environment) REFERENCES Environment(id_environment) ON DELETE CASCADE,
        FOREIGN KEY (id_datacenter) REFERENCES Datacenter(id_datacenter) ON DELETE CASCADE,
        FOREIGN KEY (id_enum_state_application) REFERENCES Enum_state_application(id_enum_state_application)
    );

    CREATE TABLE IF NOT EXISTS Application (
        id_application SERIAL PRIMARY KEY,
        last_update TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        creation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

        id_enum_state_application INTEGER NOT NULL,
        id_application_order INTEGER UNIQUE,

        FOREIGN KEY (id_enum_state_application) REFERENCES Enum_state_application(id_enum_state_application),
        FOREIGN KEY (id_application_order) REFERENCES Application_order(id_application_order)
    );

    CREATE TABLE IF NOT EXISTS Enum_export_state (
        id_enum_export_state SERIAL PRIMARY KEY,
        status VARCHAR (100) NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS Application_export (
        id_export SERIAL PRIMARY KEY,
        init_date TIMESTAMP WITH TIME ZONE NOT NULL,
        expiration_date TIMESTAMP WITH TIME ZONE NOT NULL,
        id_provider VARCHAR(100),
        download_link TEXT,
        id_application INTEGER NOT NULL,
        id_enum_export_state INTEGER NOT NULL,

        FOREIGN KEY (id_application) REFERENCES Application(id_application) ON DELETE CASCADE,
        FOREIGN KEY (id_enum_export_state) REFERENCES Enum_export_state(id_enum_export_state)
    );

    CREATE TABLE IF NOT EXISTS Port_type (
        id_port_type SERIAL PRIMARY KEY,
        label VARCHAR (100) NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS Interface_has_port (
        label VARCHAR (255) NOT NULL DEFAULT 'N/A',
        port INTEGER NOT NULL,
        icon VARCHAR(8) NOT NULL DEFAULT 'xxxxxxxx',
        display_name VARCHAR(100) NOT NULL DEFAULT 'N/A',

        id_interface INTEGER NOT NULL,
        id_port_type INTEGER NOT NULL,

        PRIMARY KEY (port, id_interface),

        FOREIGN KEY (id_port_type) REFERENCES Port_type(id_port_type),
        FOREIGN KEY (id_interface) REFERENCES Interface(id_interface)
    );

    CREATE TABLE IF NOT EXISTS Variable_environment (
        id_variable_environment SERIAL PRIMARY KEY,
        key VARCHAR(100) NOT NULL,
        value VARCHAR(255) NOT NULL DEFAULT '',
        CONSTRAINT unique_variable_environment UNIQUE (key, value)
    );

    CREATE TABLE IF NOT EXISTS Interface_has_variable (
        id_interface INTEGER NOT NULL,
        id_variable_environment INTEGER NOT NULL,

        PRIMARY KEY (id_interface, id_variable_environment),

        FOREIGN KEY (id_variable_environment) REFERENCES Variable_environment(id_variable_environment),
        FOREIGN KEY (id_interface) REFERENCES Interface(id_interface)
    );

    CREATE TABLE IF NOT EXISTS Category (
        id_category SERIAL PRIMARY KEY,
        label VARCHAR(100) NOT NULL UNIQUE,
        google_material_icon VARCHAR(100) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Environment_has_category (
        id_category INTEGER NOT NULL,
        id_environment INTEGER NOT NULL,
        PRIMARY KEY (id_category, id_environment),
        FOREIGN KEY (id_category) REFERENCES Category(id_category) ON DELETE CASCADE,
        FOREIGN KEY (id_environment) REFERENCES Environment(id_environment) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Argument (
        id_argument SERIAL PRIMARY KEY,
        value VARCHAR(255) NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS Interface_has_argument (
        id_argument INTEGER NOT NULL,
        id_interface INTEGER NOT NULL,

        PRIMARY KEY (id_argument, id_interface),
        FOREIGN KEY (id_argument) REFERENCES Argument(id_argument) ON DELETE CASCADE,
        FOREIGN KEY (id_interface) REFERENCES Interface(id_interface) ON DELETE CASCADE
    );


    CREATE TABLE IF NOT EXISTS History (
        id_history SERIAL PRIMARY KEY,
        datetime TIMESTAMP WITH TIME ZONE DEFAULT NULL,

        id_application INTEGER NOT NULL,
        id_user INTEGER NOT NULL,

    FOREIGN KEY (id_application) REFERENCES Application(id_application)
    );

    CREATE TABLE IF NOT EXISTS Session (
        id_session SERIAL PRIMARY KEY,
        label VARCHAR (200) DEFAULT '',
        begin_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
        end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,

        id_environment INTEGER NOT NULL,

        FOREIGN KEY (id_environment) REFERENCES Environment(id_environment)
    );

    CREATE TABLE IF NOT EXISTS Session_has_user (
        id_user INTEGER NOT NULL,
        id_application INTEGER NOT NULL,
        id_session INTEGER NOT NULL,

        PRIMARY KEY (id_user, id_application, id_session),
        FOREIGN KEY (id_application) REFERENCES Application(id_application) ON DELETE CASCADE,
        FOREIGN KEY (id_session) REFERENCES Session(id_session) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Session_has_professor (
        id_user INTEGER NOT NULL,
        id_session INTEGER NOT NULL,

        PRIMARY KEY (id_user, id_session),
        FOREIGN KEY (id_session) REFERENCES Session(id_session) ON DELETE CASCADE
    );

END $$;