# Pilot Project

## Setup

### To start the project locally
```
npm run dev
```

### To test authentication locally
Copy .env.example to .env
```
cp .env.example .env
```

Set the JWT Secret
```
JWT_SECRET_KEY="secret-key-should-be-at-least-32-chars"
```

Update your hosts file to include this entry
```
127.0.0.1 dashboard.spitfirepremier.com
```

Start the nginx server to proxy requests from https://dashboard.spitfirepremier.com to http://localhost:3000
```
cd nginx
sudo nginx -c "$(pwd)/dashboard.conf" -g 'daemon off;'
```

### To disable authentication
Simply don't set the JWT_SECRET_KEY environment variable. When this is unset, authentication is skipped.
This means in production, the environment varaible should always be set.

## API Endpoints

### Scorecard

#### /api/scorecard/upload

```
curl --location 'http://localhost:3000/api/scorecard/upload' \
--form 'files=@"/C:/...flight_log.png"'
```

#### /api/scorecard/save

```
curl --location 'http://localhost:3000/api/scorecard/save' \
--header 'Content-Type: application/json' \
--data '{
    "logs":
    [
        {
            "DATE_TIME": "2025-03-19T10:30:00Z",
            "AIRCRAFT_IDENTIFIER": "MV22B",
            "TOTAL_TIME": "1.4"
        }
    ]
}'
```

#### /api/scorecard/flights

```
curl --location 'http://localhost:3000/api/scorecard/flights'
```

#### /api/scorecard/columns

```
curl --location 'http://localhost:3000/api/scorecard/columns'
```