FROM node:8-slim AS build

WORKDIR /app
COPY . /app

RUN apt-get update -yqqq && \
  apt-get install -y \
    python \
    build-essential \
    git \
    libavahi-compat-libdnssd-dev && \
  npm install

FROM node:8-slim AS run

COPY docker/supervisor/* /etc/supervisor/conf.d/
COPY docker/avahi.sh /usr/local/bin/
COPY --from=build  /app /app

RUN apt-get update -yqqq && \
  apt-get install -y \
   avahi-daemon \ 
   avahi-discover \
   avahi-utils \
   libnss-mdns \
   libavahi-compat-libdnssd-dev \
   supervisor && \
  chmod +x /usr/local/bin/avahi.sh

CMD /usr/bin/supervisord -nc /etc/supervisor/supervisord.conf
