#!/bin/bash

# Apply database migrations
echo "Apply database migrations"
python3 manage.py makemigrations
python3 manage.py migrate

# List SSL certificates to ensure they are copied
ls -l /etc/ssl/certs/cert.pem
ls -l /etc/ssl/private/privkey.pem

# Collect static files
echo "Collect static files"
python3 manage.py collectstatic --noinput

# Start Nginx
echo "Starting Nginx"
service nginx start

# Start Django server
echo "Starting server"
exec python3 manage.py runserver 0.0.0.0:8000
