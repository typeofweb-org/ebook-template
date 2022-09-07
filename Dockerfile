FROM ubuntu:20.04
ARG TARGETPLATFORM
ENV TARGETPLATFORM=${TARGETPLATFORM:-linux/amd64}
ARG TARGETARCH
ENV TARGETARCH=${TARGETARCH:-amd64}

ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=Europe/Warsaw

ARG FORCE_UPDATE=yes

RUN apt-get update --fix-missing -y

RUN apt-get install --no-install-recommends -y \
    wget \
    texlive \
    texlive-plain-generic \
    texlive-fonts-recommended \
    texlive-latex-recommended \
    texlive-latex-extra \
    texlive-lang-european \
    texlive-lang-polish \
    texlive-xetex \
    lmodern \
    ttf-ubuntu-font-family \
    openjdk-8-jre \
    python3-dev \
    python3-venv \
    locales \
    curl \
    build-essential \
    git \
    calibre
RUN apt-get clean

RUN curl -sL https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get install --no-install-recommends -y nodejs

RUN mkdir -p /usr/local/bin

RUN python3 -m venv ~/env

COPY requirements.txt /tmp/requirements.txt

RUN . ~/env/bin/activate && pip install -U --force-reinstall pip

# Agree to Microsoft EULA and install MS fonts
# RUN echo ttf-mscorefonts-installer msttcorefonts/accepted-mscorefonts-eula select true | debconf-set-selections
# RUN apt-get install --no-install-recommends -y ttf-mscorefonts-installer

RUN . ~/env/bin/activate && \
  pip install wheel && \
  pip install -r /tmp/requirements.txt && rm /tmp/requirements.txt && \
  # pip uninstall lib && \
  pip install lib && \
  pip install WeasyPrint && \
  pip install pandoc-secnos

# Copy add fonts from ./fonts directory
COPY fonts/. /usr/local/share/fonts
RUN fc-cache -f -v

RUN curl -LO \
  https://github.com/jgm/pandoc/releases/download/2.19.2/pandoc-2.19.2-1-$TARGETARCH.deb && \
  dpkg -i pandoc-2.19.2-1-$TARGETARCH.deb && \
  rm pandoc-2.19.2-1-$TARGETARCH.deb

RUN mkdir -p ~/.npm
RUN chown -R $(whoami) ~/.npm

WORKDIR /book
VOLUME /book
