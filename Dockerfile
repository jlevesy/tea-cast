FROM debian:jessie

ENV DEBIAN_FRONTEND noninteractive

# Create app directory
WORKDIR /usr/src/app

RUN apt-get update && \
    apt-get install -yq curl git avahi-daemon avahi-utils libnss-mdns libavahi-compat-libdnssd-dev && \
    apt-get -qq -y autoclean && \
    apt-get -qq -y autoremove && \
    apt-get -qq -y clean

# Node.js
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash - && apt-get install -y nodejs && rm -rf /var/lib/apt/lists/*

RUN update-rc.d avahi-daemon enable

COPY nsswitch.conf /etc/nsswitch.conf
COPY avahi-daemon.conf /etc/avahi/avahi-daemon.conf

COPY . .

RUN npm install

EXPOSE 9999

CMD ["npm", "start"]
