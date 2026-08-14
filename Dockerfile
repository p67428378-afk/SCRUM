FROM python:3.12-slim

WORKDIR /app

# Copy requirements file (supports both root context and server context)
COPY server/requirements.tx[t] requirements.tx[t] ./
RUN if [ -f server/requirements.txt ]; then \
        pip install --no-cache-dir -r server/requirements.txt; \
    elif [ -f requirements.txt ]; then \
        pip install --no-cache-dir -r requirements.txt; \
    fi

# Copy application code into /app/server
COPY . /tmp/src/
RUN mkdir -p /app/server && \
    if [ -d /tmp/src/server ]; then \
        cp -r /tmp/src/server/* /app/server/; \
    else \
        cp -r /tmp/src/* /app/server/; \
    fi && \
    rm -rf /tmp/src

ENV PORT=8080
EXPOSE 8080

CMD ["sh", "-c", "python -m uvicorn server.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
