FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for python-docx / pypdf
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY app/ ./app/

# Expose port
EXPOSE 8000

# Production start command
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
