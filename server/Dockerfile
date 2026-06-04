# Python base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements file
COPY ./requirements.txt /app/requirements.txt

# Install dependencies
RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt

# Copy app source
COPY . /app

# Expose port 8000
EXPOSE 8000

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
