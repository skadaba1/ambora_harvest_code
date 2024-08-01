FROM nvidia/cuda:11.8.0-cudnn8-runtime-ubuntu20.04

#set up environment
RUN apt-get update && apt-get install --no-install-recommends --no-install-suggests -y curl iputils-ping unzip python3 python3-pip openssl nginx

# Copy our application code
WORKDIR /var/app

# . Here means current directory.
COPY . .

# Configure Nginx
COPY ./nginx.conf /etc/nginx/sites-available/default
RUN ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

RUN pip3 install --no-cache-dir -r requirements.txt

# Copy the Let's Encrypt certificates
COPY cert.pem /etc/ssl/certs/cert.pem
COPY privkey.pem /etc/ssl/private/privkey.pem

# Make sure the entrypoint script is executable
RUN chmod +x entrypoint.sh

ENV LC_ALL=C.UTF-8
ENV LANG=C.UTF-8


EXPOSE 80 443 11434 

# Run the entrypoint script
CMD ["./entrypoint.sh"]
