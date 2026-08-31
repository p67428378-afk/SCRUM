FROM python:3.12-slim

WORKDIR /app

# Copy requirements file (supports both root build context and server/ subdirectory context)
COPY requirements.txt* server/requirements.txt* ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . ./server/
RUN if [ -d "./server/server" ]; then cp -rn ./server/server/* ./server/ 2>/dev/null || true; fi

# Cloud Run requires the container to listen on port 8080
ENV PORT=8080
EXPOSE 8080

CMD ["sh", "-c", "python -m uvicorn server.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
