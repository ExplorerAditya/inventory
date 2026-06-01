# ============================================================
# Production-ready Dockerfile for the FastAPI backend
# Base: python:3.11-slim (lightweight)
# ============================================================
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies needed by psycopg2
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies first (layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY . .

# Expose port
EXPOSE 8000

# Run with uvicorn — use 0.0.0.0 to bind inside Docker network
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
