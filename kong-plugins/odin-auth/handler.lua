local http = require "resty.http"

local OdinAuth = {
    PRIORITY = 1000,
    VERSION = "1.1.0"
}

-- Helper: extract a cookie value
local function get_cookie(name)
    local cookie_header = kong.request.get_header("cookie")
    if not cookie_header then
        return nil
    end
    for cookie in string.gmatch(cookie_header, "[^;]+") do
        local k, v = string.match(cookie, "%s*(.-)%s*=%s*(.*)")
        if k == name then
            return v
        end
    end
    return nil
end

function OdinAuth:access(conf)
    local headers = {}

    --  Get Authorization header (or from cookie)
    local auth_header = kong.request.get_header("authorization")
    if auth_header and auth_header ~= "" and auth_header ~= ngx.null then
        headers["Authorization"] = tostring(auth_header)
    else
        local odin_token = get_cookie("OdinToken")
        if odin_token and odin_token ~= "" then
            headers["Authorization"] = "Bearer " .. tostring(odin_token)
        end
    end

    --  If there's a `?odn_tkn=` param, set it as a response cookie
    local args = kong.request.get_query()
    local query_token = args["odn_tkn"]

    if query_token and query_token ~= "" then
        -- Set OdinToken cookie on the response
        kong.response.set_header("Set-Cookie", "OdinToken=" .. query_token .. "; Path=/; HttpOnly; Secure")
        -- Also override Authorization header
        headers["Authorization"] = "Bearer " .. tostring(query_token)
        kong.log.info("Token from query param set as OdinToken cookie: ", query_token)
    end

    --  Append some request metadata
    local request_method = kong.request.get_method() or "GET"
    headers["X-Requested-Method"] = tostring(request_method)
    local request_path = kong.request.get_path() or "/"
    local full_url = conf.auth_url .. request_path

    kong.log.info("Full URL: ", full_url)

    --  Call external auth service
    local client = http.new()
    local res, err = client:request_uri(full_url, {
        method = "GET",
        headers = headers,
        ssl_verify = false
    })

    if not res then
        return kong.response.exit(500, {
            message = "Auth service unreachable",
            error = err
        })
    end

    local body = res:read_body()
    if res.status ~= 200 then
        return kong.response.exit(res.status, body)
    end

    -- Forward the auth result upstream
    -- kong.service.request.set_header("x-odin-auth-result", body)
end

return OdinAuth

