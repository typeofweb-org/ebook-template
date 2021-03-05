FROM ubuntu:18.04

ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=Europe/Warsaw

ARG FORCE_UPDATE=yes

RUN apt-get clean
RUN apt-get update --fix-missing
RUN apt-get install --no-install-recommends -y \
    wget \
    texlive \
    texlive-generic-recommended \
    texlive-latex-recommended \
    texlive-fonts-recommended \
    texlive-latex-extra \
    texlive-lang-european \
    texlive-lang-polish \
    texlive-xetex \
    lmodern \
    ttf-ubuntu-font-family \
    openjdk-8-jre \
    python3.6-dev \
    python3-venv \
    locales \
    curl \
    build-essential \
    git \
    calibre

RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
RUN apt-get install --no-install-recommends -y nodejs

# RUN wget http://kindlegen.s3.amazonaws.com/kindlegen_linux_2.6_i386_v2_9.tar.gz
# RUN tar xvfz kindlegen_linux_2.6_i386_v2_9.tar.gz
# RUN mv kindlegen /usr/local/bin
COPY ./kindlegen /usr/local/bin

# Copy add fonts from ./fonts directory
COPY fonts/. /usr/local/share/fonts
RUN fc-cache -f -v

# Agree to Microsoft EULA and install MS fonts
# RUN echo ttf-mscorefonts-installer msttcorefonts/accepted-mscorefonts-eula select true | debconf-set-selections
# RUN apt-get install --no-install-recommends -y ttf-mscorefonts-installer

RUN curl -LO \
  https://github.com/jgm/pandoc/releases/download/2.9.2.1/pandoc-2.9.2.1-1-amd64.deb && \
  dpkg -i pandoc-2.9.2.1-1-amd64.deb && \
  rm pandoc-2.9.2.1-1-amd64.deb

RUN mkdir -p /usr/local/bin

RUN python3 -m venv ~/env

RUN \
  . ~/env/bin/activate && \
  pip install wheel && \
  curl -L -o /tmp/requirements.txt \
     https://raw.githubusercontent.com/bmc/ebook-template/master/requirements.txt && \
  pip install -r /tmp/requirements.txt && rm /tmp/requirements.txt && \
  # pip uninstall lib && \
  pip install lib && \
  pip install WeasyPrint && \
  pip install git+git://github.com/ValiValpas/pandoc-secnos.git@928fc94cbf52beea0510d5c6ec5cb6b8747b107d

RUN mkdir -p ~/.npm
RUN chown -R $(whoami) ~/.npm

WORKDIR /book
VOLUME /book
