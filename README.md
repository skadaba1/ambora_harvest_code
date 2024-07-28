# Build the ollama image
docker pull ollama/ollama

# Build the main app image
docker build -t grant_app .
# Build separate image for dev for good measure
docker build -t grant_app_dev .

# Create the network
docker network create django-ollama-service

# Run the first container (if in prod)
docker run --network=django-ollama-service -p 443:443 -p 80:80 --name django grant_app
# or if in dev
docker run --network=django-ollama-service -p 8080:80 -p 4343:443 --name django_dev grant_app_dev

# Run the second container (port 11434)
docker run --network=django-ollama-service -d --gpus=all -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama

# Exec into container and download models
docker exec -it ollama bash
ollama pull all-minilm
ollama pull gemma:2b

# To stop all containers
docker stop $(docker ps -a -q)

# To copy over conatiner to local (run all 3)
docker cp django:/var/app/db.sqlite3 backend
docker cp django:/var/app/uploads/ backend
docker cp django:/var/app/chroma/ backend

# If cert.pem or privkey.pem not found check permissions, ensure readability
sudo su
su root
chmod 664 privkey.pem

# Start Neo4j instance
docker run \
    --restart always \
    --publish=7474:7474 --publish=7687:7687 \
    --volume=$HOME/neo4j/plugins:/plugins \
    --env NEO4J_AUTH=neo4j/amboralabs \
    --env 'NEO4J_dbms_security_procedures_unrestricted=apoc.*' \
    --env NEO4JLABS_PLUGINS='["apoc"]' \
    neo4j:5.19.0

# myapi_ table not found
- commment out uploads in the get function
