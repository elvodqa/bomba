local socket = require("socket")
local address, port = "localhost", 8000

http = require("socket.http")

function love.load()
    udp = socket.udp()
    udp:settimeout(0)
end

function love.update(dt)
   request = http.request("http://localhost:8000/api/getUser/elvodqa") 
    if request then
        print(request)
    end
end

function love.draw()
    love.graphics.draw(love.graphics.newText(love.graphics.newFont(12), http.request("http://localhost:8000/api/getUser/elvodqa")), 0, 0)
end