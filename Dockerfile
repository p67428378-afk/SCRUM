# Production Python 3.11 container image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8080 \
    AUTO_BOOT_ETL=true

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Expose HTTP port 8080 for Cloud Run
EXPOSE 8080

# Run entry point
CMD ["uvicorn", "server.main:app", "--host", "0.0.0.0", "--port", "8080"]
