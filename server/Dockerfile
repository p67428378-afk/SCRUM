FROM python:3.11-slim

WORKDIR /app

# Copy requirements
COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files into /app/server/ so `import server` works
COPY . ./server/

# Cloud Run requires the container to listen on port 8080
ENV PORT=8080
EXPOSE 8080

CMD ["sh", "-c", "python -m uvicorn server.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
