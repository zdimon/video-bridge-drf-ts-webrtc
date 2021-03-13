# Сервис для видеотрансляций.

## Установка

    git clone git@github.com:zdimon/video-bridge-drf-ts-webrtc.git

    cd backend
    python3 -m venv venv
    . ./venv/bin/activate
    pip install -r requirements.txt
    cd dj_app
    python3 manage.py migrate

## Запуск бекенда

### Веб сервер

    python3 manage.py runserver 0.0.0.0:8888

### Сокет-сервер 

    python3 manage.py socket_server

## Запуск фронтенда

    cd frontend
    npm install
    npm run build















