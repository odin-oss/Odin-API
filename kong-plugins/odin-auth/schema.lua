local typedefs = require "kong.db.schema.typedefs"
return {
    name = "odin-auth",
    fields = {{
        consumer = typedefs.no_consumer
    }, {
        protocols = typedefs.protocols_http
    }, {
        config = {
            type = "record",
            fields = {{
                auth_url = {
                    type = "string",
                    required = true
                }
            }}
        }
    }}
}
