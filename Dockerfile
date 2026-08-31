FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends gcc python3-dev && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY server/requirements.txt ./server/requirements.txt
RUN pip install --no-cache-dir --prefer-binary -r ./server/requirements.txt

# Copy repository source code
COPY . .

# Cloud Run environment
ENV PORT=8080
EXPOSE 8080

CMD ["sh", "-c", "python -m uvicorn server.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
