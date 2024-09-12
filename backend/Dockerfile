# backend/Dockerfile

# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Install system packages and build-essential tools
RUN apt-get update && apt-get install -y \
    build-essential \
    gfortran \
    libopenblas-dev \
    liblapack-dev \
    libatlas-base-dev \
    python3-dev \
    libssl-dev \
    sqlite3 \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /app

# Install NumPy first
RUN pip install numpy==1.23.1

# Copy the requirements file into the container at /app
COPY requirements.txt /app/

# Install the dependencies
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy the rest of the backend source code into the container
COPY . /app/

# Open port 8000 to the outside world (Django default)
EXPOSE 8000

# Define the environment variable for Django (optional for development)
ENV PYTHONUNBUFFERED 1

# Run the Django development server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
