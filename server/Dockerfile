FROM python:3.11-slim
WORKDIR /app
COPY ./server/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY ./server /app/server
ENV PORT=8080
EXPOSE 8080
CMD uvicorn server.main:app --host 0.0.0.0 --port ${PORT:-8080}
