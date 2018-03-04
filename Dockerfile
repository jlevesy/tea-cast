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

RUN apt-get update -yqqq && \
  apt-get install -y \
   avahi-daemon \ 
   avahi-discover \
   avahi-utils \
   libnss-mdns \
   libavahi-compat-libdnssd-dev \
   supervisor

COPY docker/avahi/avahi-daemon.conf /etc/avahi/avahi-daemon.conf
COPY docker/supervisor/* /etc/supervisor/conf.d/
COPY --from=build  /app /app

CMD /usr/bin/supervisord -nc /etc/supervisor/supervisord.conf
