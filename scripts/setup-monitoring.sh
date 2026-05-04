#!/bin/bash
# UptimeRobot API v2 Setup Script

API_KEY="u3478544-3341b922a4125b2e0323f37a"
EMAIL="milankhanal2057@gmail.com"

echo "Creating monitor for Main Portfolio..."
curl -X POST -H "Cache-Control: no-cache" -H "Content-Type: application/x-www-form-urlencoded" \
  -d "api_key=$API_KEY&format=json&type=1&url=https://khanalmilan.com.np&friendly_name=Main Portfolio&interval=300" \
  "https://api.uptimerobot.com/v2/newMonitor"
echo -e "\n"

echo "Creating monitor for Birthday Site..."
curl -X POST -H "Cache-Control: no-cache" -H "Content-Type: application/x-www-form-urlencoded" \
  -d "api_key=$API_KEY&format=json&type=1&url=https://birthday.khanalmilan.com.np&friendly_name=Birthday Site&interval=300" \
  "https://api.uptimerobot.com/v2/newMonitor"
echo -e "\n"

echo "Creating keyword monitor for API Health..."
curl -X POST -H "Cache-Control: no-cache" -H "Content-Type: application/x-www-form-urlencoded" \
  -d "api_key=$API_KEY&format=json&type=2&url=https://milan-portfolio-api.up.railway.app/api/v1/health&friendly_name=API Health&interval=300&keyword_type=1&keyword_value=healthy" \
  "https://api.uptimerobot.com/v2/newMonitor"
echo -e "\n"

echo "Monitors created successfully!"
